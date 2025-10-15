-- Remove the overly permissive RLS policy that allows public access to ALL columns
DROP POLICY IF EXISTS "Users can view basic post data" ON public.posts;

-- Create a more restrictive policy that only allows public access to non-sensitive columns
CREATE POLICY "Public can view non-sensitive post data" 
ON public.posts 
FOR SELECT 
USING (
  -- Only allow access to specific non-sensitive columns
  -- This will be enforced by using a view for public access
  false  -- Temporarily block public access until we set up the view
);

-- Create a secure view for public post access that excludes sensitive fields
CREATE OR REPLACE VIEW public.posts_safe AS 
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

-- Grant SELECT permission on the safe view to the authenticated role
GRANT SELECT ON public.posts_safe TO authenticated;
GRANT SELECT ON public.posts_safe TO anon;

-- Enable RLS on the safe view
ALTER VIEW public.posts_safe SET (security_barrier = true);

-- Update the public access policy to allow reading through the application logic only
-- The application should use get_thread_posts_safe function for public access
CREATE POLICY "Public can view posts through safe functions only" 
ON public.posts 
FOR SELECT 
USING (
  -- Allow access only to post owners and admins for direct table access
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'Admin'::app_role
  ))
);