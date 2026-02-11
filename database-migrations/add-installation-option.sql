-- Adăugare câmpuri pentru opțiunea de montaj în tabela products
-- Rulează acest SQL în Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS has_installation_option BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS installation_price DECIMAL(10, 2) DEFAULT NULL;

-- Comentarii pentru câmpuri (opțional)
COMMENT ON COLUMN products.has_installation_option IS 'Indică dacă produsul are opțiune de montaj';
COMMENT ON COLUMN products.installation_price IS 'Prețul pentru serviciul de montaj (dacă este aplicabil)';
