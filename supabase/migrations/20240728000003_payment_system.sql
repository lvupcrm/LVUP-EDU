-- ================================
-- 결제 시스템 관련 테이블
-- ================================

-- 주문 테이블
CREATE TABLE public.orders (
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

-- 결제 내역 테이블 (결제 시도마다 기록)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  
  -- 토스페이먼츠 정보
  payment_key TEXT NOT NULL,
  order_id_toss TEXT NOT NULL, -- 토스페이먼츠 orderId
  
  -- 결제 정보
  method TEXT NOT NULL, -- 결제 수단
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('READY', 'IN_PROGRESS', 'WAITING_FOR_DEPOSIT', 'DONE', 'CANCELED', 'PARTIAL_CANCELED')),
  
  -- 결제 상세 정보
  requested_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ,
  
  -- 응답 데이터
  raw_data JSONB, -- 토스페이먼츠 응답 전체 데이터
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 환불 내역 테이블
CREATE TABLE public.refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
  
  -- 환불 정보
  refund_amount INTEGER NOT NULL,
  refund_reason TEXT,
  
  -- 토스페이먼츠 환불 정보
  cancel_amount INTEGER NOT NULL,
  cancel_reason TEXT,
  canceled_at TIMESTAMPTZ,
  
  -- 관리자 정보
  processed_by UUID REFERENCES public.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 수강 등록 테이블 (기존 enrollments 테이블이 있다면 수정)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  
  -- 수강 정보
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  progress INTEGER DEFAULT 0, -- 진도율 (0-100)
  
  -- 수강 기간
  enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ, -- 수강 만료일 (무제한이면 NULL)
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, course_id)
);

-- ================================
-- 인덱스 생성
-- ================================

-- 주문 관련 인덱스
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_course_id ON public.orders(course_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- 결제 관련 인덱스
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_payment_key ON public.payments(payment_key);
CREATE INDEX idx_payments_status ON public.payments(status);

-- 환불 관련 인덱스
CREATE INDEX idx_refunds_payment_id ON public.refunds(payment_id);

-- 수강 등록 관련 인덱스
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);

-- ================================
-- RLS 정책
-- ================================

-- 주문 테이블 RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 결제 내역 테이블 RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
    )
  );

-- 환불 내역 테이블 RLS
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own refunds" ON public.refunds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      JOIN public.orders o ON p.order_id = o.id
      WHERE p.id = refunds.payment_id AND o.user_id = auth.uid()
    )
  );

-- 수강 등록 테이블 RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================
-- 트리거 함수 (업데이트 시간)
-- ================================

-- 주문 테이블 updated_at 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON public.payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at 
  BEFORE UPDATE ON public.enrollments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();