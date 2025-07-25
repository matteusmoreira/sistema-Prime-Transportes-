-- Create enum for motorista status
CREATE TYPE public.motorista_status AS ENUM ('Pendente', 'Aprovado', 'Reprovado');

-- Add status column to motoristas table
ALTER TABLE public.motoristas 
ADD COLUMN status motorista_status NOT NULL DEFAULT 'Pendente';

-- Add index for better performance on status queries
CREATE INDEX idx_motoristas_status ON public.motoristas(status);