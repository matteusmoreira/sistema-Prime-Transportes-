-- Adicionar coluna PIX na tabela motoristas
ALTER TABLE public.motoristas 
ADD COLUMN pix TEXT;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.motoristas.pix IS 'Chave PIX do motorista para pagamentos';