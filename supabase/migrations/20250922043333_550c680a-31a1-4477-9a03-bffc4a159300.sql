-- Fix security issue: Restrict profiles SELECT policy to only allow users to view their own data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also create a policy to allow viewing profiles for public display purposes (without email)
-- This will be handled at the application level by selecting only non-sensitive fields