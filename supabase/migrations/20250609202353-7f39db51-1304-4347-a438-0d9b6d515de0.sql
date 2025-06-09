
-- First, let's clean up any existing negative values in the database
UPDATE public.cursos 
SET 
  likes = GREATEST(0, COALESCE(likes, 0)),
  dislikes = GREATEST(0, COALESCE(dislikes, 0))
WHERE likes < 0 OR dislikes < 0 OR likes IS NULL OR dislikes IS NULL;

-- Add check constraints to prevent negative values in the future
ALTER TABLE public.cursos 
ADD CONSTRAINT cursos_likes_non_negative CHECK (likes >= 0),
ADD CONSTRAINT cursos_dislikes_non_negative CHECK (dislikes >= 0);

-- Update the default values to ensure they're never null
ALTER TABLE public.cursos 
ALTER COLUMN likes SET DEFAULT 0,
ALTER COLUMN dislikes SET DEFAULT 0;

-- Make sure the columns are not nullable
ALTER TABLE public.cursos 
ALTER COLUMN likes SET NOT NULL,
ALTER COLUMN dislikes SET NOT NULL;
