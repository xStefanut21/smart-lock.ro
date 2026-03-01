-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create policies for brands
CREATE POLICY "Brands are viewable by everyone" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert brands" ON brands
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can update brands" ON brands
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete brands" ON brands
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE brands IS 'Brands table for product brands/manufacturers';
COMMENT ON COLUMN brands.id IS 'Unique identifier for the brand';
COMMENT ON COLUMN brands.name IS 'Brand name';
COMMENT ON COLUMN brands.description IS 'Brand description';
COMMENT ON COLUMN brands.logo_url IS 'URL to brand logo image';
COMMENT ON COLUMN brands.website_url IS 'Official brand website URL';
COMMENT ON COLUMN brands.is_active IS 'Whether the brand is active/visible';
COMMENT ON COLUMN brands.sort_order IS 'Display order for brands';
