-- Create motorista_fotos table for vehicle photos
CREATE TABLE public.motorista_fotos (
  id INTEGER NOT NULL DEFAULT nextval('motorista_fotos_id_seq'::regclass) PRIMARY KEY,
  motorista_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  nome_original TEXT NOT NULL,
  url TEXT NOT NULL,
  tamanho INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for motorista_fotos
CREATE SEQUENCE IF NOT EXISTS motorista_fotos_id_seq;

-- Enable RLS
ALTER TABLE public.motorista_fotos ENABLE ROW LEVEL SECURITY;

-- Create policies for motorista_fotos
CREATE POLICY "Admins can manage motorista fotos" 
ON public.motorista_fotos 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['Administrador'::user_role, 'Administração'::user_role]));

CREATE POLICY "Motoristas can view their own fotos" 
ON public.motorista_fotos 
FOR SELECT 
USING (motorista_id IN (
  SELECT motoristas.id
  FROM motoristas
  WHERE motoristas.user_id = auth.uid()
));