
-- Crear tabla para notas de lecciones con timestamps
CREATE TABLE public.lesson_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  course_id UUID NOT NULL,
  note_text TEXT NOT NULL,
  timestamp_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para resúmenes personalizados de cursos
CREATE TABLE public.course_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary_content TEXT NOT NULL,
  summary_type TEXT DEFAULT 'personal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en ambas tablas
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_summaries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lesson_notes
CREATE POLICY "Users can view their own notes" 
  ON public.lesson_notes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
  ON public.lesson_notes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
  ON public.lesson_notes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
  ON public.lesson_notes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para course_summaries
CREATE POLICY "Users can view their own summaries" 
  ON public.course_summaries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own summaries" 
  ON public.course_summaries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries" 
  ON public.course_summaries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries" 
  ON public.course_summaries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear índices para optimizar consultas
CREATE INDEX idx_lesson_notes_user_lesson ON public.lesson_notes(user_id, lesson_id);
CREATE INDEX idx_lesson_notes_timestamp ON public.lesson_notes(timestamp_seconds);
CREATE INDEX idx_course_summaries_user_course ON public.course_summaries(user_id, course_id);

-- Trigger para actualizar updated_at automáticamente en lesson_notes
CREATE OR REPLACE FUNCTION public.update_lesson_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lesson_notes_updated_at
  BEFORE UPDATE ON public.lesson_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lesson_notes_updated_at();

-- Trigger para actualizar updated_at automáticamente en course_summaries
CREATE OR REPLACE FUNCTION public.update_course_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_summaries_updated_at
  BEFORE UPDATE ON public.course_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_summaries_updated_at();
