-- =====================================================
-- SCRIPT PARA CREAR USUARIOS DE PRUEBA
-- Sistema de Login TallerPro
-- =====================================================

-- IMPORTANTE: Este script debe ejecutarse desde el SQL Editor de Supabase
-- URL: https://supabase.com/dashboard/project/[TU_PROJECT_ID]/sql

-- =====================================================
-- PASO 1: Crear usuarios en Supabase Auth
-- =====================================================

-- NOTA: Los usuarios deben crearse primero desde el panel de Supabase Auth
-- Dashboard > Authentication > Users > Add User

-- O usar las siguientes funciones desde este SQL Editor:

-- Usuario Administrador
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@tallerpro.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Usuario Recepcionista
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'recepcionista@tallerpro.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Usuario Mecánico
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'mecanico@tallerpro.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- =====================================================
-- PASO 2: Insertar datos en la tabla usuarios
-- =====================================================

-- OPCIÓN MANUAL (Recomendada): Los datos se insertarán automáticamente 
-- la primera vez que el usuario inicie sesión mediante el authService.

-- O EJECUTAR MANUALMENTE:

-- Administrador
INSERT INTO usuarios (id, email, nombre, rol, activo)
SELECT 
    id,
    'admin@tallerpro.com',
    'Administrador Sistema',
    'administrador',
    true
FROM auth.users 
WHERE email = 'admin@tallerpro.com'
ON CONFLICT (id) DO NOTHING;

-- Recepcionista
INSERT INTO usuarios (id, email, nombre, rol, activo)
SELECT 
    id,
    'recepcionista@tallerpro.com',
    'María Recepción',
    'recepcionista',
    true
FROM auth.users 
WHERE email = 'recepcionista@tallerpro.com'
ON CONFLICT (id) DO NOTHING;

-- Mecánico
INSERT INTO usuarios (id, email, nombre, rol, activo)
SELECT 
    id,
    'mecanico@tallerpro.com',
    'Juan Mecánico',
    'mecanico',
    true
FROM auth.users 
WHERE email = 'mecanico@tallerpro.com'
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- MÉTODO ALTERNATIVO SIMPLE
-- Usar el panel de administración de Supabase
-- =====================================================

-- 1. Ve a: Dashboard > Authentication > Users
-- 2. Click en "Add User"
-- 3. Ingresa el email y contraseña:
--    - admin@tallerpro.com / admin123
--    - recepcionista@tallerpro.com / admin123
--    - mecanico@tallerpro.com / admin123
-- 4. Confirma el email automáticamente
-- 5. Los registros en la tabla 'usuarios' se crearán automáticamente
--    al hacer login por primera vez

-- =====================================================
-- VERIFICAR USUARIOS CREADOS
-- =====================================================

-- Ver usuarios en auth
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email IN ('admin@tallerpro.com', 'recepcionista@tallerpro.com', 'mecanico@tallerpro.com');

-- Ver usuarios en tabla usuarios
SELECT 
    id,
    email,
    nombre,
    rol,
    activo,
    created_at
FROM usuarios
WHERE email IN ('admin@tallerpro.com', 'recepcionista@tallerpro.com', 'mecanico@tallerpro.com');

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

-- 1. La contraseña es 'admin123' para todos los usuarios de prueba
-- 2. Cambiar las contraseñas en producción
-- 3. Los usuarios se pueden gestionar desde el panel de Supabase
-- 4. El sistema creará automáticamente el registro en 'usuarios' 
--    la primera vez que inicien sesión si no existe
