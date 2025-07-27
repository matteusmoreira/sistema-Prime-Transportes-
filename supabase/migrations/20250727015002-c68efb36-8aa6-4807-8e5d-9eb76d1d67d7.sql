-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION prevent_orphan_motorista_records()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if motorista exists
  IF NOT EXISTS (SELECT 1 FROM motoristas WHERE id = NEW.motorista_id) THEN
    RAISE EXCEPTION 'Motorista with ID % does not exist', NEW.motorista_id;
  END IF;
  RETURN NEW;
END;
$$;