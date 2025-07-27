-- Clean up orphan records in motorista_fotos
DELETE FROM motorista_fotos 
WHERE motorista_id NOT IN (SELECT id FROM motoristas);

-- Create triggers to prevent orphan records in the future
CREATE OR REPLACE FUNCTION prevent_orphan_motorista_records()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if motorista exists
  IF NOT EXISTS (SELECT 1 FROM motoristas WHERE id = NEW.motorista_id) THEN
    RAISE EXCEPTION 'Motorista with ID % does not exist', NEW.motorista_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
CREATE TRIGGER prevent_orphan_motorista_documentos
  BEFORE INSERT OR UPDATE ON motorista_documentos
  FOR EACH ROW
  EXECUTE FUNCTION prevent_orphan_motorista_records();

CREATE TRIGGER prevent_orphan_motorista_fotos
  BEFORE INSERT OR UPDATE ON motorista_fotos
  FOR EACH ROW
  EXECUTE FUNCTION prevent_orphan_motorista_records();