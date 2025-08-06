-- Update existing corridas with centro_custo from their respective empresas
UPDATE public.corridas 
SET centro_custo = empresas.centro_custo
FROM public.empresas 
WHERE corridas.empresa_id = empresas.id 
  AND (corridas.centro_custo IS NULL OR corridas.centro_custo = '');