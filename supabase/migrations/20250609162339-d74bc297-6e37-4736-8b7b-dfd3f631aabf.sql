
-- Add currency field to cursos table
ALTER TABLE public.cursos 
ADD COLUMN moneda text DEFAULT 'USD';

-- Add a comment to document the field
COMMENT ON COLUMN public.cursos.moneda IS 'Currency code for course pricing (e.g., USD, EUR, MXN)';
