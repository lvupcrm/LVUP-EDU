-- Create notifications table for real-time notification system
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_notification_type CHECK (
    type IN (
      'course_update',
      'new_lesson', 
      'enrollment_success',
      'payment_success',
      'payment_failed',
      'refund_processed',
      'lesson_completed',
      'course_completed',
      'certificate_issued',
      'assignment_due',
      'system_maintenance',
      'instructor_message'
    )
  )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
  ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
  ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
  ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_type 
  ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, is_read) 
  WHERE is_read = FALSE;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Only authenticated users can insert notifications (system/admin)
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid() IS NOT NULL
  );

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications 
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE 
    id = notification_id 
    AND user_id = auth.uid()
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications 
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE 
    user_id = auth.uid()
    AND is_read = FALSE;
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = auth.uid() AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_type VARCHAR(50),
  notification_title VARCHAR(255),
  notification_message TEXT,
  notification_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    notification_data
  ) RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table and columns
COMMENT ON TABLE notifications IS 'Real-time notifications for users';
COMMENT ON COLUMN notifications.type IS 'Type of notification for categorization and handling';
COMMENT ON COLUMN notifications.data IS 'Additional JSON data for notification context (course_id, order_id, etc.)';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when notification was marked as read';