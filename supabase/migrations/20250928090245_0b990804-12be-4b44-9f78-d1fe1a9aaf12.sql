-- Fix critical security vulnerability: Remove overly permissive RLS policy
-- that allows authenticated users to view sensitive post data including
-- password hashes and IP addresses

-- Remove the problematic policy that allows any authenticated user to view all post data
DROP POLICY IF EXISTS "Authenticated users can view basic post data through functions" ON public.posts;

-- The existing "Admins and owners can access sensitive post data" policy should remain
-- as it properly restricts access to only admins and post owners for sensitive data

-- Note: The application should use the safe functions like get_thread_posts_safe() 
-- which only return non-sensitive fields (id, parent_id, title, content, author_name, 
-- depth, sort_order, timestamps, and stats) but NOT the sensitive fields like 
-- author_password_hash, ip_address, or user_agent