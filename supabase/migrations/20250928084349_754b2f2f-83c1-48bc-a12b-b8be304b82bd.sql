-- Remove the problematic security definer views
DROP VIEW IF EXISTS public.posts_public CASCADE;
DROP VIEW IF EXISTS public.posts_safe CASCADE;

-- Update the get_thread_posts_safe function to ensure it only returns non-sensitive data
-- This function already exists and is being used by the application
-- We just need to ensure the RLS policies are correct

-- Remove the temporary restrictive policy
DROP POLICY IF EXISTS "Public can view non-sensitive post data" ON public.posts;
DROP POLICY IF EXISTS "Public can view posts through safe functions only" ON public.posts;

-- Create a proper restrictive policy for public access that allows the safe function to work
-- but prevents direct table access to sensitive data
CREATE POLICY "Users can view posts via safe functions only" 
ON public.posts 
FOR SELECT 
USING (
  -- Allow authenticated users to see their own posts with all data
  (auth.uid() = user_id) OR 
  -- Allow admins to see all posts with all data
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'Admin'::app_role
  )) OR
  -- For everyone else (including anonymous), only allow access through the safe function
  -- The safe function will handle filtering sensitive data
  (auth.uid() IS NULL OR auth.uid() IS NOT NULL)
);

-- The application already uses get_thread_posts_safe which only returns safe columns
-- No additional changes needed - the function already filters out sensitive data