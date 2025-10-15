-- Add user_id column to posts table for authenticated users
ALTER TABLE public.posts 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for updating updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Update posts table RLS policies to support both authenticated and anonymous users
DROP POLICY IF EXISTS "Posts are publicly readable" ON public.posts;

CREATE POLICY "Posts are publicly readable" 
ON public.posts 
FOR SELECT 
USING (NOT is_deleted);

-- Allow authenticated users to create posts with their user_id
CREATE POLICY "Authenticated users can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own posts
CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Update create_post function to handle user_id
CREATE OR REPLACE FUNCTION public.create_post(
    p_parent_id uuid DEFAULT NULL::uuid, 
    p_title character varying DEFAULT NULL::character varying, 
    p_content text DEFAULT ''::text, 
    p_author_name character varying DEFAULT ''::character varying, 
    p_author_password text DEFAULT ''::text, 
    p_security_key text DEFAULT ''::text, 
    p_ip_address inet DEFAULT NULL::inet, 
    p_user_agent text DEFAULT NULL::text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_security_key_id UUID;
    v_depth INTEGER := 0;
    v_sort_order INTEGER := 0;
    v_new_post_id UUID;
    v_parent_depth INTEGER;
    v_user_id UUID;
BEGIN
    -- Get current user ID if authenticated
    v_user_id := auth.uid();
    
    -- 입력값 검증
    IF LENGTH(TRIM(p_content)) = 0 THEN
        RAISE EXCEPTION '내용을 입력해주세요.';
    END IF;
    
    IF LENGTH(TRIM(p_author_name)) = 0 THEN
        RAISE EXCEPTION '작성자명을 입력해주세요.';
    END IF;
    
    -- Authenticated users don't need password or security key
    IF v_user_id IS NULL THEN
        IF LENGTH(TRIM(p_author_password)) < 4 THEN
            RAISE EXCEPTION '비밀번호는 4자 이상 입력해주세요.';
        END IF;
        
        -- IP 차단 확인 (anonymous users only)
        IF p_ip_address IS NOT NULL AND is_ip_banned(p_ip_address) THEN
            RAISE EXCEPTION '접근이 차단된 IP입니다.';
        END IF;
        
        -- 보안키 검증 (anonymous users only)
        v_security_key_id := verify_security_key(p_security_key);
        IF v_security_key_id IS NULL THEN
            RAISE EXCEPTION '올바르지 않은 보안키입니다.';
        END IF;
    END IF;
    
    -- 부모 게시글 처리
    IF p_parent_id IS NOT NULL THEN
        -- 부모 게시글 존재 및 삭제 여부 확인
        SELECT depth INTO v_parent_depth 
        FROM posts 
        WHERE id = p_parent_id AND NOT is_deleted;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION '존재하지 않거나 삭제된 게시글에는 답글을 달 수 없습니다.';
        END IF;
        
        -- 최대 depth 제한 (예: 10단계)
        IF v_parent_depth >= 10 THEN
            RAISE EXCEPTION '답글 깊이가 제한을 초과했습니다. (최대 10단계)';
        END IF;
        
        v_depth := v_parent_depth + 1;
        
        -- 같은 부모의 마지막 sort_order + 1
        SELECT COALESCE(MAX(sort_order), 0) + 1 INTO v_sort_order 
        FROM posts WHERE parent_id = p_parent_id;
        
        -- 답글인 경우 제목 검증 (제목 없어도 됨)
        NULL;
    ELSE
        -- 최상위 게시글인 경우 제목 필수
        IF LENGTH(TRIM(COALESCE(p_title, ''))) = 0 THEN
            RAISE EXCEPTION '최상위 게시글은 제목이 필요합니다.';
        END IF;
    END IF;
    
    -- 게시글 삽입
    INSERT INTO posts (
        parent_id, title, content, author_name, 
        author_password_hash, security_key_id, depth, sort_order,
        ip_address, user_agent, user_id
    ) VALUES (
        p_parent_id, 
        NULLIF(TRIM(p_title), ''), 
        TRIM(p_content), 
        TRIM(p_author_name),
        CASE WHEN v_user_id IS NULL THEN crypt(p_author_password, gen_salt('bf')) ELSE NULL END,
        v_security_key_id, 
        v_depth, 
        v_sort_order, 
        p_ip_address, 
        p_user_agent,
        v_user_id
    ) RETURNING id INTO v_new_post_id;
    
    RETURN v_new_post_id;
END;
$function$;