-- ================================
-- orders 테이블만 생성 (기존 테이블과 충돌 방지)
-- ================================

-- orders 테이블만 생성 (IF NOT EXISTS 사용)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  
  -- 주문 정보
  order_number TEXT UNIQUE NOT NULL, -- 주문번호 (LVUP-20240728-001)
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED')),
  
  -- 금액 정보
  amount INTEGER NOT NULL, -- 결제 금액 (원 단위)
  original_amount INTEGER NOT NULL, -- 원래 가격
  discount_amount INTEGER DEFAULT 0, -- 할인 금액
  
  -- 결제 정보
  payment_method TEXT, -- 결제 수단 (카드, 계좌이체, 간편결제)
  payment_key TEXT, -- 토스페이먼츠 결제 키
  order_id TEXT, -- 토스페이먼츠 주문 ID
  
  -- 메타데이터
  metadata JSONB, -- 추가 정보
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- 인덱스 생성 (IF NOT EXISTS 사용하여 중복 방지)
DO $$
BEGIN
  -- orders 테이블 인덱스들
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_user_id') THEN
    CREATE INDEX idx_orders_user_id ON public.orders(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_course_id') THEN
    CREATE INDEX idx_orders_course_id ON public.orders(course_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_status') THEN
    CREATE INDEX idx_orders_status ON public.orders(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_order_number') THEN
    CREATE INDEX idx_orders_order_number ON public.orders(order_number);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_created_at') THEN
    CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
  END IF;
END $$;

-- RLS 정책 설정 (중복 방지)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 후 재생성
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at 트리거 함수 생성 (IF NOT EXISTS 방식)
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성 (중복 방지)
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();

SELECT 'orders 테이블 생성 완료!' as message;