
-- First, let's check and clean any orphaned data before adding constraints
-- Remove any action_plan_items that reference non-existent course_summaries
DELETE FROM action_plan_items 
WHERE summary_id NOT IN (SELECT id FROM course_summaries);

-- Remove any course_summaries that reference non-existent courses
DELETE FROM course_summaries 
WHERE course_id NOT IN (SELECT id FROM cursos);

-- Remove any courses that reference non-existent categories
DELETE FROM cursos 
WHERE categoria_id NOT IN (SELECT id FROM categorias);

-- Now add the foreign key constraints
-- Add foreign key from course_summaries to cursos
ALTER TABLE course_summaries 
ADD CONSTRAINT fk_course_summaries_curso 
FOREIGN KEY (course_id) REFERENCES cursos(id) 
ON DELETE CASCADE;

-- Add foreign key from cursos to categorias (if it doesn't exist)
ALTER TABLE cursos 
ADD CONSTRAINT fk_cursos_categoria 
FOREIGN KEY (categoria_id) REFERENCES categorias(id) 
ON DELETE RESTRICT;

-- Add foreign key from action_plan_items to course_summaries (if it doesn't exist)
ALTER TABLE action_plan_items 
ADD CONSTRAINT fk_action_plan_items_summary 
FOREIGN KEY (summary_id) REFERENCES course_summaries(id) 
ON DELETE CASCADE;
