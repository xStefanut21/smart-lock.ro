-- Migration script: Convert old color_options to new options system
-- This script migrates all products from the old color_options system to the new options system

DO $$
DECLARE
    color_option_id UUID;
BEGIN
    -- Step 1: Create the "Culoare" option if it doesn't exist
    INSERT INTO options (id, name, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Culoare',
        NOW(),
        NOW()
    )
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO color_option_id;
    
    -- Get the color option ID (in case it already existed)
    SELECT id INTO color_option_id FROM options WHERE name = 'Culoare' LIMIT 1;
    
    RAISE NOTICE 'Color option ID: %', color_option_id;
    
    -- Step 2: Create option_values for all unique colors from products
    INSERT INTO option_values (id, option_id, name, sort_order, created_at, updated_at)
    SELECT 
        gen_random_uuid(),
        color_option_id,
        TRIM(color_value),
        ROW_NUMBER() OVER (ORDER BY TRIM(color_value)),
        NOW(),
        NOW()
    FROM (
        SELECT UNNEST(string_to_array(color_options, ',')) as color_value
        FROM products 
        WHERE color_options IS NOT NULL 
        AND color_options != ''
        AND color_options != 'null'
    ) unique_colors
    WHERE TRIM(color_value) != ''
    AND TRIM(color_value) IS NOT NULL
    ON CONFLICT (option_id, name) DO NOTHING;
    
    RAISE NOTICE 'Created color option values';
    
    -- Step 3: Create product_options associations for all products that had color_options
    INSERT INTO product_options (id, product_id, option_id, required, price_modifier, created_at, updated_at)
    SELECT 
        gen_random_uuid(),
        p.id,
        color_option_id,
        false, -- colors are usually not required
        0, -- no price modifier for colors
        NOW(),
        NOW()
    FROM products p
    WHERE p.color_options IS NOT NULL 
    AND p.color_options != ''
    AND p.color_options != 'null'
    AND NOT EXISTS (
        SELECT 1 FROM product_options po 
        WHERE po.product_id = p.id 
        AND po.option_id = color_option_id
    )
    ON CONFLICT (product_id, option_id) DO NOTHING;
    
    RAISE NOTICE 'Created product_options associations';
    
    -- Step 4: Set default color for each product (first color in their list)
    UPDATE product_options po
    SET default_value_id = ov.id,
        updated_at = NOW()
    FROM products p,
         option_values ov,
         LATERAL (
             SELECT TRIM(UNNEST(string_to_array(p.color_options, ','))) as color_name
         ) colors
    WHERE po.product_id = p.id
    AND po.option_id = color_option_id
    AND ov.option_id = color_option_id
    AND ov.name = colors.color_name
    AND colors.color_name = (
        SELECT TRIM(UNNEST(string_to_array(p.color_options, ',')))
        ORDER BY array_position(string_to_array(p.color_options, ','), UNNEST(string_to_array(p.color_options, ',')))
        LIMIT 1
    )
    AND po.default_value_id IS NULL;
    
    RAISE NOTICE 'Set default colors';
    
    RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Step 5: Optional - Clear old color_options after successful migration
-- UNCOMMENT THIS LINE ONLY AFTER VERIFYING THE MIGRATION WORKED:
-- UPDATE products SET color_options = NULL WHERE color_options IS NOT NULL;

-- Verification queries:
-- SELECT COUNT(*) as total_products_with_colors FROM products WHERE color_options IS NOT NULL AND color_options != '';
-- SELECT COUNT(*) as total_color_values FROM option_values WHERE option_id = (SELECT id FROM options WHERE name = 'Culoare');
-- SELECT COUNT(*) as total_product_options FROM product_options WHERE option_id = (SELECT id FROM options WHERE name = 'Culoare');
