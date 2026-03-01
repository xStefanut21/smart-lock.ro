-- Add brand_id foreign key to products table and migrate existing brand data
-- First, add the brand_id column
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);

-- Create a function to migrate existing brand data
DO $$
DECLARE
    brand_record RECORD;
    new_brand_id UUID;
BEGIN
    -- Loop through all products that have a brand
    FOR brand_record IN
        SELECT DISTINCT brand
        FROM products
        WHERE brand IS NOT NULL AND brand != ''
    LOOP
        -- Check if brand already exists
        SELECT id INTO new_brand_id
        FROM brands
        WHERE name = brand_record.brand;

        -- If brand doesn't exist, create it
        IF new_brand_id IS NULL THEN
            INSERT INTO brands (name, is_active, sort_order)
            VALUES (brand_record.brand, true, 0)
            RETURNING id INTO new_brand_id;
        END IF;

        -- Update products with the brand_id
        UPDATE products
        SET brand_id = new_brand_id
        WHERE brand = brand_record.brand AND brand_id IS NULL;
    END LOOP;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);

-- Add comment
COMMENT ON COLUMN products.brand_id IS 'Foreign key to brands table';

-- Note: Keep the brand column for now for backward compatibility
-- It can be removed later after confirming everything works
