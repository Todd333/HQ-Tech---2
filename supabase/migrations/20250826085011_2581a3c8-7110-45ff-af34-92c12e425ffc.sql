-- Sample01 보안키 추가
INSERT INTO security_keys (key_name, key_hash, description, is_active, created_by) 
VALUES (
    'Sample01', 
    crypt('Sample01', gen_salt('bf')), 
    '기본 접근 키', 
    true, 
    'system'
);