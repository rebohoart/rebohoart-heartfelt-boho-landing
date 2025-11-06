-- Create logos table for managing multiple logo options
CREATE TABLE IF NOT EXISTS logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read logos
CREATE POLICY "Anyone can read logos"
  ON logos
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow authenticated users to insert logos
CREATE POLICY "Authenticated users can insert logos"
  ON logos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update logos
CREATE POLICY "Authenticated users can update logos"
  ON logos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete logos
CREATE POLICY "Authenticated users can delete logos"
  ON logos
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index on is_active for faster queries
CREATE INDEX IF NOT EXISTS logos_is_active_idx ON logos(is_active);

-- Add a trigger to ensure only one logo is active at a time
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

CREATE TRIGGER trigger_ensure_single_active_logo
  BEFORE INSERT OR UPDATE ON logos
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_logo();
