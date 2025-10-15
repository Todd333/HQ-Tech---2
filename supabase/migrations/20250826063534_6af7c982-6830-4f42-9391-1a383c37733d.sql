-- 보안키 요청 테이블 생성
CREATE TABLE public.security_key_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    request_status VARCHAR(50) DEFAULT 'pending',
    auto_generated_password VARCHAR(100),
    assigned_security_key TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- RLS 활성화
ALTER TABLE public.security_key_requests ENABLE ROW LEVEL SECURITY;

-- 관리자만 접근 가능하도록 설정
CREATE POLICY "security_key_requests_no_public_access" 
ON public.security_key_requests 
FOR ALL 
USING (false);

-- 자동 비밀번호 생성 함수
CREATE OR REPLACE FUNCTION public.generate_random_password(length INTEGER DEFAULT 8)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- 보안키 요청 처리 함수
CREATE OR REPLACE FUNCTION public.create_security_key_request(
    p_email VARCHAR(255),
    p_message TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request_id UUID;
    v_auto_password TEXT;
BEGIN
    -- 입력값 검증
    IF LENGTH(TRIM(p_email)) = 0 THEN
        RAISE EXCEPTION '이메일을 입력해주세요.';
    END IF;
    
    IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION '올바른 이메일 형식이 아닙니다.';
    END IF;
    
    -- 자동 비밀번호 생성
    v_auto_password := generate_random_password(10);
    
    -- 보안키 요청 등록
    INSERT INTO security_key_requests (
        email, 
        message, 
        auto_generated_password,
        assigned_security_key,
        ip_address, 
        user_agent
    ) VALUES (
        TRIM(LOWER(p_email)), 
        TRIM(p_message),
        v_auto_password,
        'Sample01',
        p_ip_address, 
        p_user_agent
    ) RETURNING id INTO v_request_id;
    
    RETURN v_request_id;
END;
$$;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_security_key_requests_updated_at
    BEFORE UPDATE ON public.security_key_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();