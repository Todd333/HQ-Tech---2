-- Fix the security definer view issue by removing it and updating functions instead
DROP VIEW IF EXISTS public.posts_public;

-- Update the get_thread_posts functions to exclude sensitive fields
CREATE OR REPLACE FUNCTION public.get_thread_posts_safe(p_parent_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, parent_id uuid, title character varying, content text, author_name character varying, depth integer, sort_order integer, created_at timestamp with time zone, updated_at timestamp with time zone, reply_count integer, view_count integer, like_count integer, last_reply_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;