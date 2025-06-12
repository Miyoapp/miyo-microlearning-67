
-- Agregar campo show a la tabla cursos para control de visibilidad
ALTER TABLE public.cursos 
ADD COLUMN show BOOLEAN NOT NULL DEFAULT true;

-- Establecer show = true para todos los cursos existentes
UPDATE public.cursos 
SET show = true;

-- Añadir comentario para documentar el propósito del campo
COMMENT ON COLUMN public.cursos.show IS 'Campo de control de visibilidad: true = mostrar curso en la web, false = ocultar curso de la web';
