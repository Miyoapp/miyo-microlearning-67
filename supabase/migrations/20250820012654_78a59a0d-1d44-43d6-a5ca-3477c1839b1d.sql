
-- Modificar la tabla course_summaries para soportar el nuevo formato de resúmenes
ALTER TABLE course_summaries ADD COLUMN IF NOT EXISTS key_concepts TEXT;
ALTER TABLE course_summaries ADD COLUMN IF NOT EXISTS personal_insight TEXT;
ALTER TABLE course_summaries ADD COLUMN IF NOT EXISTS action_plans JSONB DEFAULT '[]'::jsonb;

-- Crear tabla para items individuales de planes de acción
CREATE TABLE IF NOT EXISTS action_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  summary_id UUID REFERENCES course_summaries(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para la nueva tabla
ALTER TABLE action_plan_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para action_plan_items
CREATE POLICY "Users can view their own action plan items" 
  ON action_plan_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM course_summaries cs 
      WHERE cs.id = action_plan_items.summary_id 
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own action plan items" 
  ON action_plan_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_summaries cs 
      WHERE cs.id = action_plan_items.summary_id 
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own action plan items" 
  ON action_plan_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM course_summaries cs 
      WHERE cs.id = action_plan_items.summary_id 
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own action plan items" 
  ON action_plan_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM course_summaries cs 
      WHERE cs.id = action_plan_items.summary_id 
      AND cs.user_id = auth.uid()
    )
  );

-- Trigger para actualizar updated_at en action_plan_items
CREATE OR REPLACE FUNCTION update_action_plan_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER action_plan_items_updated_at
  BEFORE UPDATE ON action_plan_items
  FOR EACH ROW
  EXECUTE FUNCTION update_action_plan_items_updated_at();
