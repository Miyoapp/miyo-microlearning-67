
-- Enable realtime for user_lesson_progress table
ALTER TABLE public.user_lesson_progress REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_lesson_progress;

-- Enable realtime for user_course_progress table  
ALTER TABLE public.user_course_progress REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_course_progress;

-- Update the course progress trigger to preserve 100% completion
CREATE OR REPLACE FUNCTION public.update_course_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  new_progress INTEGER;
  current_progress INTEGER;
  current_completion BOOLEAN;
BEGIN
  -- Get current progress to check if course is already 100% complete
  SELECT progress_percentage, is_completed INTO current_progress, current_completion
  FROM public.user_course_progress
  WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
  
  -- If course is already 100% complete, don't update progress (review mode)
  IF current_completion = TRUE AND current_progress = 100 THEN
    RETURN NEW;
  END IF;
  
  -- Get total lessons for the course
  SELECT COUNT(*) INTO total_lessons
  FROM public.lecciones l
  JOIN public.modulos m ON l.modulo_id = m.id
  WHERE m.curso_id = NEW.course_id;
  
  -- Get completed lessons for the user in this course
  SELECT COUNT(*) INTO completed_lessons
  FROM public.user_lesson_progress ulp
  JOIN public.lecciones l ON ulp.lesson_id = l.id
  JOIN public.modulos m ON l.modulo_id = m.id
  WHERE ulp.user_id = NEW.user_id 
    AND m.curso_id = NEW.course_id 
    AND ulp.is_completed = TRUE;
  
  -- Calculate progress percentage
  IF total_lessons > 0 THEN
    new_progress := (completed_lessons * 100) / total_lessons;
  ELSE
    new_progress := 0;
  END IF;
  
  -- Update or insert course progress
  INSERT INTO public.user_course_progress (user_id, course_id, progress_percentage, is_completed, last_listened_at, created_at, updated_at)
  VALUES (NEW.user_id, NEW.course_id, new_progress, new_progress >= 100, NOW(), NOW(), NOW())
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET 
    progress_percentage = CASE 
      WHEN user_course_progress.is_completed = TRUE AND user_course_progress.progress_percentage = 100 
      THEN 100  -- Preserve 100% in review mode
      ELSE new_progress 
    END,
    is_completed = CASE 
      WHEN user_course_progress.is_completed = TRUE AND user_course_progress.progress_percentage = 100 
      THEN TRUE  -- Preserve completion in review mode
      ELSE new_progress >= 100 
    END,
    last_listened_at = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$function$;
