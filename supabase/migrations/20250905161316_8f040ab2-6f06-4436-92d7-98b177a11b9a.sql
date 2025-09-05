-- Security Enhancement: Fix function search path issues
-- Add explicit search_path to prevent potential schema manipulation attacks

-- Recreate update_lesson_notes_updated_at with secure search_path
CREATE OR REPLACE FUNCTION public.update_lesson_notes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Recreate update_course_summaries_updated_at with secure search_path  
CREATE OR REPLACE FUNCTION public.update_course_summaries_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Recreate handle_new_user with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Recreate update_action_plan_items_updated_at with secure search_path
CREATE OR REPLACE FUNCTION public.update_action_plan_items_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;