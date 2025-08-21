
-- Remove the duplicate foreign key constraint we just added
ALTER TABLE action_plan_items 
DROP CONSTRAINT IF EXISTS fk_action_plan_items_summary;

-- Check for and remove any other potential duplicate foreign keys
-- Remove duplicate constraint on cursos if it exists
ALTER TABLE cursos 
DROP CONSTRAINT IF EXISTS fk_cursos_categoria;

-- Remove duplicate constraint on course_summaries if it exists  
ALTER TABLE course_summaries 
DROP CONSTRAINT IF EXISTS fk_course_summaries_curso;

-- Verify the original constraints still exist and are working
-- These should already be in place from the original Supabase setup
DO $$
BEGIN
    -- Check if action_plan_items_summary_id_fkey exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'action_plan_items_summary_id_fkey'
        AND table_name = 'action_plan_items'
    ) THEN
        ALTER TABLE action_plan_items 
        ADD CONSTRAINT action_plan_items_summary_id_fkey 
        FOREIGN KEY (summary_id) REFERENCES course_summaries(id) 
        ON DELETE CASCADE;
    END IF;
END $$;
