
-- Agregar columna para trackear si el modal de felicitaciones ya fue mostrado
ALTER TABLE user_course_progress 
ADD COLUMN completion_modal_shown boolean DEFAULT false;

-- Actualizar registros existentes donde el curso está completado para marcar el modal como ya mostrado
-- (esto evitará que aparezca el modal en cursos ya completados)
UPDATE user_course_progress 
SET completion_modal_shown = true 
WHERE is_completed = true AND progress_percentage = 100;
