
-- Agregar columna email_verified a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN email_verified boolean DEFAULT false;

-- Actualizar la función handle_new_user para incluir el estado de verificación
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, email_verified)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
  );
  RETURN NEW;
END;
$$;

-- Actualizar registros existentes basado en el estado de verificación en auth.users
UPDATE public.profiles 
SET email_verified = CASE 
  WHEN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = profiles.id 
    AND auth.users.email_confirmed_at IS NOT NULL
  ) THEN true 
  ELSE false 
END;
