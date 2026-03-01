-- Create table to store selected values per product option
-- This allows admin to select multiple values that should be available for customers

CREATE TABLE IF NOT EXISTS product_selected_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  value_id UUID NOT NULL REFERENCES option_values(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combinations
  UNIQUE(product_id, option_id, value_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_selected_values_product_id ON product_selected_values(product_id);
CREATE INDEX IF NOT EXISTS idx_product_selected_values_option_id ON product_selected_values(option_id);
CREATE INDEX IF NOT EXISTS idx_product_selected_values_value_id ON product_selected_values(value_id);

-- Enable RLS (Row Level Security)
ALTER TABLE product_selected_values ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users (admin access)
CREATE POLICY "Authenticated users can view product_selected_values"
  ON product_selected_values FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage product_selected_values"
  ON product_selected_values FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
