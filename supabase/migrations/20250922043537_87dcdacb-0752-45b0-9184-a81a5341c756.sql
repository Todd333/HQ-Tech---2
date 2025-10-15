-- Fix security issue: Create a view for public posts access that excludes sensitive data
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

-- Grant access to the view
GRANT SELECT ON public.posts_public TO anon, authenticated;

-- Update the existing SELECT policy on posts to be more restrictive
DROP POLICY IF EXISTS "Posts are publicly readable" ON public.posts;

-- Create a new policy that only allows authenticated users to see their own posts' sensitive data
CREATE POLICY "Users can view their own posts with sensitive data" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create a policy for service role to access all posts (for functions)
CREATE POLICY "Service role can access all posts" 
ON public.posts 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);