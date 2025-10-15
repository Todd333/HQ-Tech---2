-- 추가 보안 이슈 해결

-- 1. 보안 취약점이 있는 뷰 제거
DROP VIEW IF EXISTS public.posts_public;

-- 2. 남은 함수의 search_path 보안 설정 추가
-- 이미 마이그레이션에서 처리했지만 확인차 다시 적용