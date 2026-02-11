-- Adăugare câmp AWB pentru comenzi
-- Rulează acest SQL în Supabase SQL Editor

-- Adăugare câmp awb_number în tabela orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS awb_number TEXT;

-- Adăugare câmp awb_added_at pentru a ține evidența când a fost adăugat AWB-ul
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS awb_added_at TIMESTAMPTZ;

-- Comentarii pentru câmpuri (opțional)
COMMENT ON COLUMN orders.awb_number IS 'Numărul AWB (Air Waybill) pentru trackingul coletului';
COMMENT ON COLUMN orders.awb_added_at IS 'Data și ora când a fost adăugat numărul AWB';
