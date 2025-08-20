
-- Agregar nuevos campos a la tabla lesson_notes
ALTER TABLE public.lesson_notes 
ADD COLUMN tags text[] DEFAULT '{}',
ADD COLUMN is_favorite boolean DEFAULT false,
ADD COLUMN note_title text;

-- Crear índices para mejorar performance en consultas
CREATE INDEX idx_lesson_notes_tags ON public.lesson_notes USING GIN (tags);
CREATE INDEX idx_lesson_notes_is_favorite ON public.lesson_notes (is_favorite);
CREATE INDEX idx_lesson_notes_user_id_created_at ON public.lesson_notes (user_id, created_at DESC);
