-- Criar tabela de configurações para Evolution API
CREATE TABLE public.configuracoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    evolution_api_url TEXT NOT NULL,
    evolution_instance_id TEXT NOT NULL,
    evolution_api_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can manage configuracoes" 
ON public.configuracoes 
FOR ALL 
USING (get_current_user_role() = 'Administrador'::user_role)
WITH CHECK (get_current_user_role() = 'Administrador'::user_role);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_configuracoes_updated_at
BEFORE UPDATE ON public.configuracoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();