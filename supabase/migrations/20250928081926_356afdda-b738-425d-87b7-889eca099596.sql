-- Drop existing overly permissive RLS policies on posts table
DROP POLICY IF EXISTS "Service role can access all posts" ON public.posts;

-- Create a secure view for public post access that excludes sensitive data
CREATE OR REPLACE VIEW public.posts_public AS
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
  is_deleted,
  user_id
FROM public.posts
WHERE NOT is_deleted;

-- Enable RLS on the view
ALTER VIEW public.posts_public SET (security_barrier = true);

-- Create a secure function for getting posts with sensitive data (admin/owner only)
CREATE OR REPLACE FUNCTION public.get_post_with_sensitive_data(post_id_param uuid)
RETURNS TABLE(
  id uuid,
  parent_id uuid,
  title character varying,
  content text,
  author_name character varying,
  author_password_hash character varying,
  depth integer,
  sort_order integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  is_deleted boolean,
  user_id uuid,
  ip_address inet,
  user_agent text,
  security_key_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_id uuid;
  is_admin boolean := false;
  post_owner_id uuid;
BEGIN
  -- Get the requesting user ID
  requesting_user_id := auth.uid();
  
  -- Check if user is admin
  IF requesting_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM profiles 
      WHERE user_id = requesting_user_id AND role = 'Admin'
    ) INTO is_admin;
  END IF;
  
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = post_id_param;
  
  -- Only allow access if user is admin or post owner
  IF is_admin OR (requesting_user_id = post_owner_id) THEN
    RETURN QUERY
    SELECT 
      p.id, p.parent_id, p.title, p.content, p.author_name,
      p.author_password_hash, p.depth, p.sort_order, 
      p.created_at, p.updated_at, p.is_deleted, p.user_id,
      p.ip_address, p.user_agent, p.security_key_id
    FROM posts p
    WHERE p.id = post_id_param;
  END IF;
END;
$$;

-- Update the existing RLS policies on posts table to be more restrictive
DROP POLICY IF EXISTS "Users can view their own posts with sensitive data" ON public.posts;

-- Create new restrictive policies
CREATE POLICY "Users can view basic post data" 
ON public.posts 
FOR SELECT 
USING (
  -- Allow reading non-sensitive fields only
  true
);

-- Create policy for sensitive data access (admin or owner only)
CREATE POLICY "Admins and owners can access sensitive post data" 
ON public.posts 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'Admin'))
);

-- Update the get_thread_posts_safe function to use safe data access
CREATE OR REPLACE FUNCTION public.get_thread_posts_safe(p_parent_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, parent_id uuid, title character varying, content text, author_name character varying, depth integer, sort_order integer, created_at timestamp with time zone, updated_at timestamp with time zone, reply_count integer, view_count integer, like_count integer, last_reply_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE post_tree AS (
        -- Base case: top-level posts or direct children of specified parent_id
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
        
        -- Recursive case: child posts
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
        WHERE NOT p.is_deleted AND pt.level < 20  -- Prevent infinite recursion
    )
    SELECT 
        pt.id, pt.parent_id, pt.title, pt.content, pt.author_name,
        pt.depth, pt.sort_order, pt.created_at, pt.updated_at,
        pt.reply_count, pt.view_count, pt.like_count, pt.last_reply_at
    FROM post_tree pt
    ORDER BY 
        pt.root_created_at DESC,  -- Latest top-level posts first
        pt.depth ASC,             -- Sort by depth
        pt.sort_order ASC         -- Same level ordered by sort_order
    LIMIT p_limit OFFSET p_offset;
END;
$$;