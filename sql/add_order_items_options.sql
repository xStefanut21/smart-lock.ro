-- Add options and installation support to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS selected_options JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_installation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS installation_price DECIMAL(10,2) DEFAULT 0;

-- Add index for better performance on JSONB queries
CREATE INDEX IF NOT EXISTS idx_order_items_selected_options ON order_items USING GIN(selected_options);
