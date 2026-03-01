-- Add SEO fields to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_url TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add comments for documentation
COMMENT ON COLUMN categories.seo_url IS 'Custom SEO-friendly URL for the category page';
COMMENT ON COLUMN categories.meta_title IS 'SEO title for category page';
COMMENT ON COLUMN categories.meta_keywords IS 'SEO keywords for category page';
COMMENT ON COLUMN categories.meta_description IS 'SEO description for category page';

-- Add SEO fields to product_images table
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS meta_name TEXT;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS meta_alt TEXT;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS meta_title TEXT;

-- Add comments for documentation
COMMENT ON COLUMN product_images.meta_name IS 'SEO-friendly name for the image';
COMMENT ON COLUMN product_images.meta_alt IS 'Alt text for image accessibility and SEO';
COMMENT ON COLUMN product_images.meta_title IS 'Title attribute for image SEO';

-- Add SEO fields to brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS seo_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add comments for documentation
COMMENT ON COLUMN brands.seo_url IS 'Custom SEO-friendly URL for the brand page';
COMMENT ON COLUMN brands.meta_title IS 'SEO title for brand page';
COMMENT ON COLUMN brands.meta_keywords IS 'SEO keywords for brand page';
COMMENT ON COLUMN brands.meta_description IS 'SEO description for brand page';
