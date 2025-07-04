
-- Create table for Mercado Pago transactions
CREATE TABLE public.mercadopago_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  course_id UUID REFERENCES public.cursos(id) NOT NULL,
  preference_id TEXT NOT NULL,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.mercadopago_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own transactions" 
  ON public.mercadopago_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
  ON public.mercadopago_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update transactions" 
  ON public.mercadopago_transactions 
  FOR UPDATE 
  USING (true);

-- Create index for better performance
CREATE INDEX idx_mercadopago_transactions_user_id ON public.mercadopago_transactions(user_id);
CREATE INDEX idx_mercadopago_transactions_preference_id ON public.mercadopago_transactions(preference_id);
CREATE INDEX idx_mercadopago_transactions_payment_id ON public.mercadopago_transactions(payment_id);
