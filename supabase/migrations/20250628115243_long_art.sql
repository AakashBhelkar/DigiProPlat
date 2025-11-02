-- Create storage buckets for file uploads

-- Create bucket for product files
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-files', 'product-files', true);

-- Create bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create bucket for page assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-assets', 'page-assets', true);

-- Set up storage policies for product-files bucket
CREATE POLICY "Users can upload product files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-files');

CREATE POLICY "Users can view product files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-files');

CREATE POLICY "Users can update own product files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own product files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policies for avatars bucket
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policies for page-assets bucket
CREATE POLICY "Users can upload page assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'page-assets');

CREATE POLICY "Anyone can view page assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'page-assets');

CREATE POLICY "Users can update own page assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'page-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own page assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'page-assets' AND auth.uid()::text = (storage.foldername(name))[1]);