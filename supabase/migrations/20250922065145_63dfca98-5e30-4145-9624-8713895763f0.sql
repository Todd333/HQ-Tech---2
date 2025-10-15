-- Create a new function that allows admins to delete posts without password
CREATE OR REPLACE FUNCTION public.delete_post_admin(
  p_post_id uuid,
  p_author_password text DEFAULT NULL,
  p_admin_user_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_post_record RECORD;
    v_is_admin boolean := false;
BEGIN
    -- Check if user is admin
    IF p_admin_user_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM profiles 
            WHERE user_id = p_admin_user_id AND role = 'Admin'
        ) INTO v_is_admin;
    END IF;
    
    -- Get post information
    SELECT * INTO v_post_record 
    FROM posts 
    WHERE id = p_post_id AND NOT is_deleted;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- If admin, allow deletion without password check
    IF v_is_admin THEN
        UPDATE posts 
        SET is_deleted = true, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_post_id;
        RETURN TRUE;
    END IF;
    
    -- For non-admin users, check password (existing logic)
    IF p_author_password IS NULL OR 
       v_post_record.author_password_hash IS NULL OR
       v_post_record.author_password_hash != crypt(p_author_password, v_post_record.author_password_hash) THEN
        RETURN FALSE;
    END IF;
    
    -- Delete post (soft delete)
    UPDATE posts 
    SET is_deleted = true, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_post_id;
    
    RETURN TRUE;
END;
$function$