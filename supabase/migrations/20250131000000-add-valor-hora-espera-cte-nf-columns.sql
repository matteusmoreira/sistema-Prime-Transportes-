-- Adicionar colunas valor_hora_espera e cte_nf na tabela corridas
-- valor_hora_espera: campo monetário para valor da hora de espera
-- cte_nf: campo de texto para CTE/NF

ALTER TABLE public.corridas 
ADD COLUMN valor_hora_espera DECIMAL(10,2),
ADD COLUMN cte_nf TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.corridas.valor_hora_espera IS 'Valor da hora de espera em reais - campo opcional editável pelo financeiro';
COMMENT ON COLUMN public.corridas.cte_nf IS 'Campo de texto para CTE/NF - campo opcional editável pelo financeiro';