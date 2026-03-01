-- Add SEO fields to products table with proper handling of existing columns
-- First, check if there's a column with wrong spelling and rename it
DO $$
BEGIN
    -- Check if column exists with wrong spelling and rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'etiquete_produs'
    ) THEN
        ALTER TABLE products RENAME COLUMN etiquete_produs TO etichete_produs;
    END IF;
END $$;

-- Add SEO fields to products table (will skip if already exists due to IF NOT EXISTS)
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_h1 TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_h2 TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_h3 TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alt TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS etichete_produs TEXT;

-- Add comments for documentation
COMMENT ON COLUMN products.seo_h1 IS 'SEO H1 title for product page';
COMMENT ON COLUMN products.seo_h2 IS 'SEO H2 subtitle for product page';
COMMENT ON COLUMN products.seo_h3 IS 'SEO H3 additional heading for product page';
COMMENT ON COLUMN products.image_alt IS 'Alt text for product main image';
COMMENT ON COLUMN products.image_title IS 'Title attribute for product main image';
COMMENT ON COLUMN products.etichete_produs IS 'Product tags/keywords for SEO and internal categorization';
