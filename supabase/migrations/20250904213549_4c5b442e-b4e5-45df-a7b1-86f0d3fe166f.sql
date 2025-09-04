-- Eliminar la columna note_title de la tabla lesson_notes
-- ya que no se está utilizando y solo necesitamos lesson_title
ALTER TABLE public.lesson_notes DROP COLUMN IF EXISTS note_title;