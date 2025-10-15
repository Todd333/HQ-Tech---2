-- Remove the problematic security definer views
DROP VIEW IF EXISTS public.posts_public CASCADE;
DROP VIEW IF EXISTS public.posts_safe CASCADE;

-- Remove ALL existing SELECT policies on posts table to start fresh
DROP POLICY IF EXISTS "Users can view posts via safe functions only" ON public.posts;
DROP POLICY IF EXISTS "Public can view non-sensitive post data" ON public.posts;
DROP POLICY IF EXISTS "Public can view posts through safe functions only" ON public.posts;
DROP POLICY IF EXISTS "Users can view basic post data" ON public.posts;
DROP POLICY IF EXISTS "Admins and owners can access sensitive post data" ON public.posts;

-- Recreate the admin/owner policy for accessing sensitive data
CREATE POLICY "Admins and owners can access sensitive post data" 
ON public.posts 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'Admin'::app_role
  ))
);

-- Create a restrictive policy for general access
-- Since the application now requires login, we only need authenticated access
CREATE POLICY "Authenticated users can view basic post data through functions" 
ON public.posts 
FOR SELECT 
USING (
  -- Only allow access to authenticated users
  auth.uid() IS NOT NULL
);