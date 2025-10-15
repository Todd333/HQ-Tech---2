-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('Admin', 'User');

-- Add role column to profiles table  
ALTER TABLE public.profiles 
ADD COLUMN role public.app_role NOT NULL DEFAULT 'User';

-- Update existing profiles to have 'User' role
UPDATE public.profiles SET role = 'User' WHERE role IS NULL;

-- Set specific user as Admin
UPDATE public.profiles 
SET role = 'Admin' 
WHERE email = 'todd.cho333@gmail.com';

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update the handle_new_user function to set default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email,
    CASE 
      WHEN NEW.email = 'todd.cho333@gmail.com' THEN 'Admin'::public.app_role
      ELSE 'User'::public.app_role
    END
  );
  RETURN NEW;
END;
$function$;