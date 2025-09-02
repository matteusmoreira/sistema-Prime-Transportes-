-- Script para limpar campos hora_chegada que estão com '00:00:00'
-- Esses campos devem estar NULL até serem preenchidos pelo motorista ou financeiro

UPDATE corridas 
SET hora_chegada = NULL 
WHERE hora_chegada = '00:00:00';

-- Verificar quantos registros foram afetados
SELECT COUNT(*) as registros_atualizados 
FROM corridas 
WHERE hora_chegada IS NULL;