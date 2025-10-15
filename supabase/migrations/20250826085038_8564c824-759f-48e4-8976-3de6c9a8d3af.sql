-- RLS 정책 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- 공개 포럼을 위한 정책 설정 (모든 사용자가 읽기 가능)
CREATE POLICY "Posts are publicly readable" ON public.posts
FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Post stats are publicly readable" ON public.post_stats
FOR SELECT USING (true);

-- 보안키는 시스템 전용
CREATE POLICY "Security keys are not accessible" ON public.security_keys
FOR ALL USING (false);

-- 관리 테이블들도 접근 제한
CREATE POLICY "Banned IPs are not accessible" ON public.banned_ips
FOR ALL USING (false);

CREATE POLICY "Board settings are not accessible" ON public.board_settings
FOR ALL USING (false);

CREATE POLICY "Post reports are not accessible" ON public.post_reports
FOR ALL USING (false);