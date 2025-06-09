
-- 1. Agregar campo linkedin_url a la tabla creadores
ALTER TABLE creadores ADD COLUMN linkedin_url text;

-- 2. Agregar campos de likes y dislikes a la tabla cursos
ALTER TABLE cursos ADD COLUMN likes integer DEFAULT 0;
ALTER TABLE cursos ADD COLUMN dislikes integer DEFAULT 0;

-- 3. Crear tabla para trackear votos de usuarios
CREATE TABLE curso_votos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    curso_id uuid REFERENCES cursos(id) ON DELETE CASCADE,
    tipo_voto text CHECK (tipo_voto IN ('like', 'dislike', 'none')) DEFAULT 'none',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, curso_id)
);

-- 4. Agregar campos para cursos premium
ALTER TABLE cursos ADD COLUMN tipo_curso text CHECK (tipo_curso IN ('libre', 'pago')) DEFAULT 'libre';
ALTER TABLE cursos ADD COLUMN precio decimal(10,2);

-- 5. Crear tabla para compras de cursos
CREATE TABLE compras_cursos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    curso_id uuid REFERENCES cursos(id) ON DELETE CASCADE,
    fecha_compra timestamp with time zone DEFAULT now(),
    monto_pagado decimal(10,2),
    estado_pago text CHECK (estado_pago IN ('pendiente', 'completado', 'cancelado')) DEFAULT 'pendiente',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, curso_id)
);

-- 6. Habilitar RLS en las nuevas tablas
ALTER TABLE curso_votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras_cursos ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas RLS para curso_votos
CREATE POLICY "Users can view their own votes" ON curso_votos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own votes" ON curso_votos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON curso_votos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON curso_votos
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Crear políticas RLS para compras_cursos
CREATE POLICY "Users can view their own purchases" ON compras_cursos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON compras_cursos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Permitir lectura pública de likes/dislikes en cursos
CREATE POLICY "Public can view course likes" ON cursos
    FOR SELECT USING (true);
