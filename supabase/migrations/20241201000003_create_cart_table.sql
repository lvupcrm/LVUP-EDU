-- Create cart table for shopping cart functionality
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one course per user in cart
  UNIQUE(user_id, course_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id 
  ON cart_items(user_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_course_id 
  ON cart_items(course_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_added_at 
  ON cart_items(added_at DESC);

-- Enable Row Level Security
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own cart items
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

-- Users can add items to their own cart
CREATE POLICY "Users can add to own cart" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to add item to cart (prevents duplicates)
CREATE OR REPLACE FUNCTION add_to_cart(
  target_course_id UUID
)
RETURNS UUID AS $$
DECLARE
  cart_item_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if user is already enrolled in this course
  IF EXISTS (
    SELECT 1 FROM enrollments 
    WHERE user_id = current_user_id 
    AND course_id = target_course_id 
    AND status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Already enrolled in this course';
  END IF;

  -- Insert or get existing cart item
  INSERT INTO cart_items (user_id, course_id)
  VALUES (current_user_id, target_course_id)
  ON CONFLICT (user_id, course_id) 
  DO UPDATE SET added_at = NOW()
  RETURNING id INTO cart_item_id;
  
  RETURN cart_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to remove item from cart
CREATE OR REPLACE FUNCTION remove_from_cart(
  target_course_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  deleted_count INTEGER;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Delete cart item
  DELETE FROM cart_items 
  WHERE user_id = current_user_id 
  AND course_id = target_course_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clear entire cart
CREATE OR REPLACE FUNCTION clear_cart()
RETURNS INTEGER AS $$
DECLARE
  current_user_id UUID;
  deleted_count INTEGER;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Delete all cart items for current user
  DELETE FROM cart_items 
  WHERE user_id = current_user_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get cart summary
CREATE OR REPLACE FUNCTION get_cart_summary()
RETURNS TABLE (
  item_count INTEGER,
  total_amount DECIMAL
) AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as item_count,
    COALESCE(SUM(c.price), 0)::DECIMAL as total_amount
  FROM cart_items ci
  JOIN courses c ON ci.course_id = c.id
  WHERE ci.user_id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate cart before checkout
CREATE OR REPLACE FUNCTION validate_cart_for_checkout()
RETURNS TABLE (
  is_valid BOOLEAN,
  invalid_items JSONB,
  message TEXT
) AS $$
DECLARE
  current_user_id UUID;
  invalid_courses JSONB := '[]'::JSONB;
  validation_message TEXT := '';
  cart_count INTEGER;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if cart is empty
  SELECT COUNT(*) INTO cart_count
  FROM cart_items 
  WHERE user_id = current_user_id;
  
  IF cart_count = 0 THEN
    RETURN QUERY SELECT FALSE, '[]'::JSONB, 'Cart is empty';
    RETURN;
  END IF;

  -- Find invalid courses (already enrolled, unavailable, etc.)
  SELECT JSONB_AGG(
    JSONB_BUILD_OBJECT(
      'course_id', ci.course_id,
      'course_title', c.title,
      'reason', CASE 
        WHEN e.id IS NOT NULL THEN 'already_enrolled'
        WHEN NOT c.is_published THEN 'not_published'
        ELSE 'unknown'
      END
    )
  ) INTO invalid_courses
  FROM cart_items ci
  JOIN courses c ON ci.course_id = c.id
  LEFT JOIN enrollments e ON e.user_id = current_user_id 
    AND e.course_id = ci.course_id 
    AND e.status = 'ACTIVE'
  WHERE ci.user_id = current_user_id
  AND (
    e.id IS NOT NULL OR  -- Already enrolled
    NOT c.is_published   -- Course not published
  );

  -- Check if there are any invalid items
  IF invalid_courses IS NULL OR invalid_courses = '[]'::JSONB THEN
    RETURN QUERY SELECT TRUE, '[]'::JSONB, 'Cart is valid for checkout';
  ELSE
    validation_message := 'Some items in your cart are no longer available';
    RETURN QUERY SELECT FALSE, invalid_courses, validation_message;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table and columns
COMMENT ON TABLE cart_items IS 'Shopping cart items for users';
COMMENT ON COLUMN cart_items.user_id IS 'User who owns this cart item';
COMMENT ON COLUMN cart_items.course_id IS 'Course added to cart';
COMMENT ON COLUMN cart_items.added_at IS 'When item was added to cart';