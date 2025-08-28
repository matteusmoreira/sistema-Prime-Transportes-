-- Adicionar campos para controle de edição financeira
ALTER TABLE public.corridas 
ADD COLUMN IF NOT EXISTS preenchido_por_financeiro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_edicao_financeiro TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS usuario_edicao_financeiro TEXT;