-- Adicionar coluna hora_espera na tabela corridas
-- Esta coluna armazenará o tempo de espera da corrida (não obrigatório)

ALTER TABLE public.corridas 
ADD COLUMN hora_espera TIME;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.corridas.hora_espera IS 'Hora de espera da corrida (campo opcional editável pelo financeiro)';