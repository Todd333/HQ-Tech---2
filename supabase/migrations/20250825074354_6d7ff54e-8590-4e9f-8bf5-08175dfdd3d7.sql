-- 보안 수정: 모든 테이블에 RLS 활성화 및 적절한 정책 설정

-- 1. 모든 테이블에 RLS 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- 2. posts 테이블을 위한 보안 뷰 생성 (민감한 데이터 제외)
CREATE VIEW public.posts_public AS
SELECT 
    id,
    parent_id,
    title,
    content,
    author_name,
    depth,
    sort_order,
    created_at,
    updated_at,
    is_deleted
FROM public.posts
WHERE NOT is_deleted;

-- 3. posts 테이블 RLS 정책 - 완전히 제한적 (함수를 통해서만 접근)
CREATE POLICY "posts_no_direct_access" ON public.posts
FOR ALL USING (false);

-- 4. post_stats 테이블 - 읽기 전용 공개
CREATE POLICY "post_stats_public_read" ON public.post_stats
FOR SELECT USING (true);

CREATE POLICY "post_stats_no_insert_update_delete" ON public.post_stats
FOR INSERT WITH CHECK (false);

CREATE POLICY "post_stats_no_update" ON public.post_stats
FOR UPDATE USING (false);

CREATE POLICY "post_stats_no_delete" ON public.post_stats
FOR DELETE USING (false);

-- 5. security_keys 테이블 - 완전히 비공개 (함수를 통해서만 접근)
CREATE POLICY "security_keys_no_access" ON public.security_keys
FOR ALL USING (false);

-- 6. banned_ips 테이블 - 완전히 비공개
CREATE POLICY "banned_ips_no_access" ON public.banned_ips
FOR ALL USING (false);

-- 7. board_settings 테이블 - 읽기 전용 공개
CREATE POLICY "board_settings_public_read" ON public.board_settings
FOR SELECT USING (true);

CREATE POLICY "board_settings_no_modify" ON public.board_settings
FOR INSERT WITH CHECK (false);

CREATE POLICY "board_settings_no_update" ON public.board_settings
FOR UPDATE USING (false);

CREATE POLICY "board_settings_no_delete" ON public.board_settings
FOR DELETE USING (false);

-- 8. post_reports 테이블 - 완전히 비공개
CREATE POLICY "post_reports_no_access" ON public.post_reports
FOR ALL USING (false);

-- 9. 안전한 게시글 조회를 위한 함수 업데이트
CREATE OR REPLACE FUNCTION public.get_thread_posts_safe(p_parent_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS TABLE(
    id uuid, 
    parent_id uuid, 
    title character varying, 
    content text, 
    author_name character varying, 
    depth integer, 
    sort_order integer, 
    created_at timestamp with time zone, 
    updated_at timestamp with time zone, 
    reply_count integer, 
    view_count integer, 
    like_count integer, 
    last_reply_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE post_tree AS (
        -- 기준점: 최상위 게시글들 또는 지정된 parent_id의 직접 자식들
        SELECT 
            p.id, p.parent_id, p.title, p.content, p.author_name,
            p.depth, p.sort_order, p.created_at, p.updated_at,
            COALESCE(ps.reply_count, 0) as reply_count,
            COALESCE(ps.view_count, 0) as view_count,
            COALESCE(ps.like_count, 0) as like_count,
            ps.last_reply_at,
            p.created_at as root_created_at,
            p.sort_order as root_sort_order,
            0 as level
        FROM posts p
        LEFT JOIN post_stats ps ON p.id = ps.post_id
        WHERE p.parent_id IS NOT DISTINCT FROM p_parent_id 
        AND NOT p.is_deleted
        
        UNION ALL
        
        -- 재귀: 하위 게시글들
        SELECT 
            p.id, p.parent_id, p.title, p.content, p.author_name,
            p.depth, p.sort_order, p.created_at, p.updated_at,
            COALESCE(ps.reply_count, 0) as reply_count,
            COALESCE(ps.view_count, 0) as view_count,
            COALESCE(ps.like_count, 0) as like_count,
            ps.last_reply_at,
            pt.root_created_at,
            pt.root_sort_order,
            pt.level + 1
        FROM posts p
        LEFT JOIN post_stats ps ON p.id = ps.post_id
        INNER JOIN post_tree pt ON p.parent_id = pt.id
        WHERE NOT p.is_deleted AND pt.level < 20  -- 무한 재귀 방지
    )
    SELECT 
        pt.id, pt.parent_id, pt.title, pt.content, pt.author_name,
        pt.depth, pt.sort_order, pt.created_at, pt.updated_at,
        pt.reply_count, pt.view_count, pt.like_count, pt.last_reply_at
    FROM post_tree pt
    ORDER BY 
        pt.root_created_at DESC,  -- 최상위 게시글은 최신순
        pt.depth ASC,             -- 깊이별 정렬
        pt.sort_order ASC         -- 같은 레벨에서는 순서대로
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 10. 기존 함수들에 search_path 보안 설정 추가
CREATE OR REPLACE FUNCTION public.increment_view_count(post_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO post_stats (post_id, view_count, updated_at)
    VALUES (post_id_param, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (post_id) DO UPDATE SET 
        view_count = post_stats.view_count + 1,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_post(p_post_id uuid, p_author_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_post_record RECORD;
BEGIN
    -- 게시글 정보 조회
    SELECT * INTO v_post_record 
    FROM posts 
    WHERE id = p_post_id AND NOT is_deleted;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- 비밀번호 확인
    IF v_post_record.author_password_hash != crypt(p_author_password, v_post_record.author_password_hash) THEN
        RETURN FALSE;
    END IF;
    
    -- 게시글 삭제 (소프트 삭제)
    UPDATE posts 
    SET is_deleted = true, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_post_id;
    
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_security_key(key_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    key_record RECORD;
BEGIN
    -- 활성화된 보안키들을 확인
    FOR key_record IN 
        SELECT id, key_hash 
        FROM security_keys 
        WHERE is_active = true 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    LOOP
        -- 해시 비교 (crypt 함수 사용)
        IF key_record.key_hash = crypt(key_input, key_record.key_hash) THEN
            RETURN key_record.id;
        END IF;
    END LOOP;
    
    RETURN NULL; -- 유효하지 않은 키
END;
$$;

CREATE OR REPLACE FUNCTION public.is_ip_banned(ip_input inet)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    banned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO banned_count
    FROM banned_ips 
    WHERE ip_address = ip_input 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);
    
    RETURN banned_count > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_post(p_parent_id uuid DEFAULT NULL::uuid, p_title character varying DEFAULT NULL::character varying, p_content text DEFAULT ''::text, p_author_name character varying DEFAULT ''::character varying, p_author_password text DEFAULT ''::text, p_security_key text DEFAULT ''::text, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_security_key_id UUID;
    v_depth INTEGER := 0;
    v_sort_order INTEGER := 0;
    v_new_post_id UUID;
    v_parent_depth INTEGER;
BEGIN
    -- 입력값 검증
    IF LENGTH(TRIM(p_content)) = 0 THEN
        RAISE EXCEPTION '내용을 입력해주세요.';
    END IF;
    
    IF LENGTH(TRIM(p_author_name)) = 0 THEN
        RAISE EXCEPTION '작성자명을 입력해주세요.';
    END IF;
    
    IF LENGTH(TRIM(p_author_password)) < 4 THEN
        RAISE EXCEPTION '비밀번호는 4자 이상 입력해주세요.';
    END IF;
    
    -- IP 차단 확인
    IF p_ip_address IS NOT NULL AND is_ip_banned(p_ip_address) THEN
        RAISE EXCEPTION '접근이 차단된 IP입니다.';
    END IF;
    
    -- 보안키 검증
    v_security_key_id := verify_security_key(p_security_key);
    IF v_security_key_id IS NULL THEN
        RAISE EXCEPTION '올바르지 않은 보안키입니다.';
    END IF;
    
    -- 부모 게시글 처리
    IF p_parent_id IS NOT NULL THEN
        -- 부모 게시글 존재 및 삭제 여부 확인
        SELECT depth INTO v_parent_depth 
        FROM posts 
        WHERE id = p_parent_id AND NOT is_deleted;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION '존재하지 않거나 삭제된 게시글에는 답글을 달 수 없습니다.';
        END IF;
        
        -- 최대 depth 제한 (예: 10단계)
        IF v_parent_depth >= 10 THEN
            RAISE EXCEPTION '답글 깊이가 제한을 초과했습니다. (최대 10단계)';
        END IF;
        
        v_depth := v_parent_depth + 1;
        
        -- 같은 부모의 마지막 sort_order + 1
        SELECT COALESCE(MAX(sort_order), 0) + 1 INTO v_sort_order 
        FROM posts WHERE parent_id = p_parent_id;
        
        -- 답글인 경우 제목 검증 (제목 없어도 됨)
        NULL;
    ELSE
        -- 최상위 게시글인 경우 제목 필수
        IF LENGTH(TRIM(COALESCE(p_title, ''))) = 0 THEN
            RAISE EXCEPTION '최상위 게시글은 제목이 필요합니다.';
        END IF;
    END IF;
    
    -- 게시글 삽입
    INSERT INTO posts (
        parent_id, title, content, author_name, 
        author_password_hash, security_key_id, depth, sort_order,
        ip_address, user_agent
    ) VALUES (
        p_parent_id, NULLIF(TRIM(p_title), ''), TRIM(p_content), TRIM(p_author_name),
        crypt(p_author_password, gen_salt('bf')), v_security_key_id, 
        v_depth, v_sort_order, p_ip_address, p_user_agent
    ) RETURNING id INTO v_new_post_id;
    
    RETURN v_new_post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_post_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    -- INSERT: 새 게시글 생성시
    IF TG_OP = 'INSERT' AND NOT NEW.is_deleted THEN
        -- 자신의 통계 레코드 생성
        INSERT INTO post_stats (post_id, updated_at)
        VALUES (NEW.id, CURRENT_TIMESTAMP)
        ON CONFLICT (post_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
        
        -- 부모 게시글의 답글 수 증가
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE post_stats 
            SET reply_count = reply_count + 1,
                last_reply_at = NEW.created_at,
                updated_at = CURRENT_TIMESTAMP
            WHERE post_id = NEW.parent_id;
            
            -- 최상위 게시글도 업데이트 (depth가 0인 것 찾기)
            UPDATE post_stats 
            SET last_reply_at = NEW.created_at,
                updated_at = CURRENT_TIMESTAMP
            WHERE post_id = (
                WITH RECURSIVE parent_chain AS (
                    SELECT id, parent_id FROM posts WHERE id = NEW.parent_id
                    UNION ALL
                    SELECT p.id, p.parent_id 
                    FROM posts p 
                    INNER JOIN parent_chain pc ON p.id = pc.parent_id
                )
                SELECT id FROM parent_chain WHERE parent_id IS NULL
            );
        END IF;
    END IF;
    
    -- UPDATE: 게시글 삭제시
    IF TG_OP = 'UPDATE' AND OLD.is_deleted = false AND NEW.is_deleted = true THEN
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE post_stats 
            SET reply_count = reply_count - 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE post_id = NEW.parent_id AND reply_count > 0;
        END IF;
    END IF;
    
    -- UPDATE: 게시글 복구시
    IF TG_OP = 'UPDATE' AND OLD.is_deleted = true AND NEW.is_deleted = false THEN
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE post_stats 
            SET reply_count = reply_count + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE post_id = NEW.parent_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;