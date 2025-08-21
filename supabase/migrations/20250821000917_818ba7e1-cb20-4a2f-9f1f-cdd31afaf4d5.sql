
-- Agregar foreign key para lesson_id hacia la tabla lecciones
ALTER TABLE lesson_notes 
ADD CONSTRAINT fk_lesson_notes_lesson_id 
FOREIGN KEY (lesson_id) REFERENCES lecciones(id) ON DELETE CASCADE;

-- Agregar foreign key para course_id hacia la tabla cursos
ALTER TABLE lesson_notes 
ADD CONSTRAINT fk_lesson_notes_course_id 
FOREIGN KEY (course_id) REFERENCES cursos(id) ON DELETE CASCADE;
