-- Migration script: Create separate color options for each product
-- This creates specific options for each product instead of one global "Culoare" option

DO $$
DECLARE
    product_record RECORD;
    color_option_id UUID;
    color_value_id UUID;
    color_array TEXT[];
    color_name TEXT;
BEGIN
    -- Process each product that has color_options
    FOR product_record IN 
        SELECT id, color_options 
        FROM products 
        WHERE color_options IS NOT NULL 
        AND color_options != ''
        AND color_options != 'null'
    LOOP
        -- RAISE NOTICE 'Processing product: %', product_record.id;
        
        -- Split colors into array
        color_array := string_to_array(product_record.color_options, ',');
        
        -- Skip if no valid colors
        IF array_length(color_array, 1) IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Create a specific "Culoare" option for this product
        INSERT INTO options (id, name, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Culoare',
            NOW(),
            NOW()
        )
        RETURNING id INTO color_option_id;
        
        -- RAISE NOTICE 'Created color option % for product %', color_option_id, product_record.id;
        
        -- Create option values for each color of this product
        FOR i IN 1..array_length(color_array, 1) LOOP
            color_name := TRIM(color_array[i]);
            
            -- Skip empty color names
            IF color_name = '' OR color_name IS NULL THEN
                CONTINUE;
            END IF;
            
            -- Create the color value
            INSERT INTO option_values (id, option_id, name, sort_order, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                color_option_id,
                color_name,
                i, -- use array index as sort_order
                NOW(),
                NOW()
            )
            RETURNING id INTO color_value_id;
            
            -- RAISE NOTICE 'Created color value % for option %', color_value_id, color_option_id;
            
            -- If this is the first color, remember it as default
            IF i = 1 THEN
                -- Create product_options association with default value
                INSERT INTO product_options (id, product_id, option_id, required, price_modifier, default_value_id, created_at, updated_at)
                VALUES (
                    gen_random_uuid(),
                    product_record.id,
                    color_option_id,
                    false, -- colors are not required
                    0, -- no price modifier
                    color_value_id, -- first color as default
                    NOW(),
                    NOW()
                );
            ELSE
                -- If no product_options exists yet, create without default
                INSERT INTO product_options (id, product_id, option_id, required, price_modifier, created_at, updated_at)
                VALUES (
                    gen_random_uuid(),
                    product_record.id,
                    color_option_id,
                    false, -- colors are not required
                    0, -- no price modifier
                    NOW(),
                    NOW()
                )
                ON CONFLICT (product_id, option_id) DO NOTHING;
            END IF;
        END LOOP;
        
        -- RAISE NOTICE 'Completed product %', product_record.id;
    END LOOP;
    
    RAISE NOTICE 'Migration completed! Each product now has its own color option.';
END $$;

-- Verification queries:
-- SELECT COUNT(*) as total_color_options FROM options WHERE name = 'Culoare';
-- SELECT COUNT(*) as total_products_with_colors FROM products WHERE color_options IS NOT NULL AND color_options != '';
-- SELECT COUNT(*) as total_product_options FROM product_options po JOIN options o ON po.option_id = o.id WHERE o.name = 'Culoare';

-- Optional: Clear old color_options after verification
-- UPDATE products SET color_options = NULL WHERE color_options IS NOT NULL;
