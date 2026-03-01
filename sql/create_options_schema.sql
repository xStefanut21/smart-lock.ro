-- Create options table
CREATE TABLE IF NOT EXISTS options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create option_values table
CREATE TABLE IF NOT EXISTS option_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(option_id, name)
);

-- Create product_options table
CREATE TABLE IF NOT EXISTS product_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  required BOOLEAN DEFAULT FALSE,
  default_value_id UUID REFERENCES option_values(id) ON DELETE SET NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, option_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_option_values_option_id ON option_values(option_id);
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_options_option_id ON product_options(option_id);

-- Disable RLS for admin tables (admin checks done in app)
ALTER TABLE options DISABLE ROW LEVEL SECURITY;
ALTER TABLE option_values DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_options DISABLE ROW LEVEL SECURITY;
