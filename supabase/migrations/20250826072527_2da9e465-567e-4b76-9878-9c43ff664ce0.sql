-- Fix all functions to use extensions.crypt instead of public.crypt
CREATE OR REPLACE FUNCTION public.create_post(
    p_parent_id uuid DEFAULT NULL::uuid, 
    p_title character varying DEFAULT NULL::character varying, 
    p_content text DEFAULT ''::text, 
    p_author_name character varying DEFAULT ''::character varying, 
    p_author_password text DEFAULT ''::text, 
    p_security_key text DEFAULT ''::text, 
    p_ip_address inet DEFAULT NULL::inet, 
    p_user_agent text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
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
        extensions.crypt(p_author_password, extensions.gen_salt('bf')), v_security_key_id, 
        v_depth, v_sort_order, p_ip_address, p_user_agent
    ) RETURNING id INTO v_new_post_id;
    
    RETURN v_new_post_id;
END;
$function$;

-- Fix verify_security_key function
CREATE OR REPLACE FUNCTION public.verify_security_key(key_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
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
        IF key_record.key_hash = extensions.crypt(key_input, key_record.key_hash) THEN
            RETURN key_record.id;
        END IF;
    END LOOP;
    
    RETURN NULL; -- 유효하지 않은 키
END;
$function$;

-- Fix delete_post function
CREATE OR REPLACE FUNCTION public.delete_post(p_post_id uuid, p_author_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
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
    IF v_post_record.author_password_hash != extensions.crypt(p_author_password, v_post_record.author_password_hash) THEN
        RETURN FALSE;
    END IF;
    
    -- 게시글 삭제 (소프트 삭제)
    UPDATE posts 
    SET is_deleted = true, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_post_id;
    
    RETURN TRUE;
END;
$function$;