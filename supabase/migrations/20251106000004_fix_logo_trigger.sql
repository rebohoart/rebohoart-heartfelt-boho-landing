-- Fix logo trigger by dropping and recreating it properly

-- Drop the trigger if it exists (with cascade to clean up any issues)
DROP TRIGGER IF EXISTS trigger_ensure_single_active_logo ON logos CASCADE;

-- Drop the function if it exists (with cascade to clean up any issues)
DROP FUNCTION IF EXISTS ensure_single_active_logo() CASCADE;

-- Recreate the function with proper formatting
CREATE OR REPLACE FUNCTION ensure_single_active_logo()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated logo is being set to active
  IF NEW.is_active = true THEN
    -- Set all other logos to inactive
    UPDATE logos
    SET is_active = false
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_ensure_single_active_logo
  BEFORE INSERT OR UPDATE ON logos
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_logo();
