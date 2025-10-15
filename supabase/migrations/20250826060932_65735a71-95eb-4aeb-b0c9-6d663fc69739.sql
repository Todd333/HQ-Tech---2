-- Sample01 보안키 추가
INSERT INTO security_keys (key_name, key_hash, description, is_active)
VALUES (
    'Sample01',
    crypt('Sample01', gen_salt('bf')),
    '테스트용 기본 보안키',
    true
);