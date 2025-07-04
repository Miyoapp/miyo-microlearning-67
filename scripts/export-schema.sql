
-- Script para exportar el esquema de la base de datos actual
-- Ejecutar este script en el SQL Editor de Supabase (desarrollo)

-- 1. Exportar estructura de tablas
SELECT 
  'CREATE TABLE IF NOT EXISTS ' || schemaname || '.' || tablename || ' (' ||
  string_agg(
    column_name || ' ' || data_type || 
    CASE 
      WHEN character_maximum_length IS NOT NULL 
      THEN '(' || character_maximum_length || ')'
      ELSE ''
    END ||
    CASE 
      WHEN is_nullable = 'NO' 
      THEN ' NOT NULL'
      ELSE ''
    END ||
    CASE 
      WHEN column_default IS NOT NULL 
      THEN ' DEFAULT ' || column_default
      ELSE ''
    END,
    ', '
  ) || ');'
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'categorias', 'cursos', 'creadores', 'modulos', 'lecciones',
    'profiles', 'user_course_progress', 'user_lesson_progress',
    'curso_votos', 'compras_cursos', 'mercadopago_transactions',
    'categoria_landing', 'creador_social_media'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;
