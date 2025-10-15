-- Update delete_post function to support admin password "0826"
CREATE OR REPLACE FUNCTION public.delete_post(p_post_id uuid, p_author_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
    v_post_record RECORD;
    v_admin_password TEXT := '0826';
BEGIN
    -- 게시글 정보 조회
    SELECT * INTO v_post_record 
    FROM posts 
    WHERE id = p_post_id AND NOT is_deleted;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- 관리자 비밀번호 확인 또는 작성자 비밀번호 확인
    IF p_author_password = v_admin_password OR 
       v_post_record.author_password_hash = extensions.crypt(p_author_password, v_post_record.author_password_hash) THEN
        
        -- 게시글 삭제 (소프트 삭제)
        UPDATE posts 
        SET is_deleted = true, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_post_id;
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$function$;