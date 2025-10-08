-- Modify handle_new_user function to generate automatic avatar using DiceBear API
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'https://api.dicebear.com/7.x/initials/svg?seed=' || NEW.email
  );
  RETURN NEW;
END;
$function$;