-- Creare bucket pentru imaginile din descrieri
-- Rulează acest SQL în Supabase SQL Editor

-- Creare bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('description-images', 'description-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politici RLS pentru bucket-ul description-images

-- Politica SELECT (public read)
CREATE POLICY "Public Read Access for description-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'description-images');

-- Politica INSERT (authenticated users write)
CREATE POLICY "Authenticated users can upload description-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'description-images' AND 
  auth.role() = 'authenticated'
);

-- Politica UPDATE (authenticated users update)
CREATE POLICY "Authenticated users can update description-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'description-images' AND 
  auth.role() = 'authenticated'
);

-- Politica DELETE (authenticated users delete)
CREATE POLICY "Authenticated users can delete description-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'description-images' AND 
  auth.role() = 'authenticated'
);
