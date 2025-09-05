-- Fix critical security issue: Remove public access to course content
-- This prevents anonymous users from accessing course structures and audio URLs

-- Remove public read policies from cursos table
DROP POLICY IF EXISTS "Permitir lectura pública de cursos" ON public.cursos;
DROP POLICY IF EXISTS "Public can view course likes" ON public.cursos;

-- Remove public read policies from modulos table  
DROP POLICY IF EXISTS "Permitir lectura pública de módulos" ON public.modulos;

-- Remove public read policies from lecciones table
DROP POLICY IF EXISTS "Permitir lectura pública de lecciones" ON public.lecciones;

-- Create secure policies that only allow authenticated users to access courses
-- Users can view courses they have purchased or free courses
CREATE POLICY "Authenticated users can view courses" 
ON public.cursos 
FOR SELECT 
TO authenticated
USING (
  -- Allow access to free courses
  tipo_curso = 'libre' 
  OR 
  -- Allow access to purchased courses
  EXISTS (
    SELECT 1 FROM public.compras_cursos cc 
    WHERE cc.curso_id = cursos.id 
    AND cc.user_id = auth.uid() 
    AND cc.estado_pago = 'completado'
  )
);

-- Users can view modules of courses they have access to
CREATE POLICY "Authenticated users can view accessible modules" 
ON public.modulos 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cursos c 
    WHERE c.id = modulos.curso_id 
    AND (
      c.tipo_curso = 'libre' 
      OR 
      EXISTS (
        SELECT 1 FROM public.compras_cursos cc 
        WHERE cc.curso_id = c.id 
        AND cc.user_id = auth.uid() 
        AND cc.estado_pago = 'completado'
      )
    )
  )
);

-- Users can view lessons of courses they have access to
CREATE POLICY "Authenticated users can view accessible lessons" 
ON public.lecciones 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.modulos m 
    JOIN public.cursos c ON c.id = m.curso_id 
    WHERE m.id = lecciones.modulo_id 
    AND (
      c.tipo_curso = 'libre' 
      OR 
      EXISTS (
        SELECT 1 FROM public.compras_cursos cc 
        WHERE cc.curso_id = c.id 
        AND cc.user_id = auth.uid() 
        AND cc.estado_pago = 'completado'
      )
    )
  )
);