# Supabase Storage Setup Guide

## 🚀 Quick Setup

Follow these steps to configure Supabase Storage buckets for file uploads.

---

## **Step 1: Create Storage Buckets**

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/storage/buckets
2. Click **"New Bucket"**
3. Create the following buckets:

### **Bucket 1: product-files**
- **Name:** `product-files`
- **Public:** ✅ Yes (Enable public access)
- **File size limit:** 100 MB
- **Allowed MIME types:** Leave empty (allow all types)

### **Bucket 2: user-avatars** (Optional, for future use)
- **Name:** `user-avatars`
- **Public:** ✅ Yes
- **File size limit:** 5 MB
- **Allowed MIME types:** `image/*`

### **Bucket 3: page-assets** (Optional, for page builder)
- **Name:** `page-assets`
- **Public:** ✅ Yes
- **File size limit:** 50 MB
- **Allowed MIME types:** `image/*,video/*`

---

## **Step 2: Configure Storage Policies (RLS)**

For each bucket, you need to set up Row Level Security (RLS) policies.

### **For product-files bucket:**

Go to: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/storage/policies

#### **Policy 1: Allow authenticated users to upload**
```sql
-- Policy Name: Allow authenticated uploads
-- Bucket: product-files
-- Operation: INSERT

CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-files' AND
  (storage.foldername(name))[1] = 'products' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
```

#### **Policy 2: Allow public read access**
```sql
-- Policy Name: Public read access
-- Bucket: product-files
-- Operation: SELECT

CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-files');
```

#### **Policy 3: Allow users to delete their own files**
```sql
-- Policy Name: Users can delete own files
-- Bucket: product-files
-- Operation: DELETE

CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-files' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
```

---

## **Step 3: Test Storage Access**

Run this SQL in the SQL Editor to verify setup:

```sql
-- Check if buckets exist
SELECT * FROM storage.buckets;

-- Check storage policies
SELECT * FROM storage.policies;

-- Test bucket accessibility
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name IN ('product-files', 'user-avatars', 'page-assets');
```

---

## **Step 4: Update Environment Variables**

Make sure your `.env.local` has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://mafryhnhgopxfckrepxv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## **Step 5: Test File Upload**

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/products/upload`
3. Try uploading a test file
4. Check if the file appears in Supabase Storage:
   - Go to: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/storage/buckets/product-files
   - You should see: `products/[user-id]/[filename]`

---

## **📁 File Organization Structure**

```
product-files/
└── products/
    └── [user-id]/
        ├── 1699123456-abc123-document.pdf
        ├── 1699123457-def456-image.png
        └── 1699123458-ghi789-archive.zip

user-avatars/
└── [user-id].jpg

page-assets/
└── [page-id]/
    ├── hero-image.jpg
    ├── section-bg.png
    └── video.mp4
```

---

## **🔒 Security Best Practices**

1. **Always use RLS policies** - Never disable RLS on storage buckets
2. **Validate file types** - Check file extensions and MIME types before upload
3. **Limit file sizes** - Enforce maximum file sizes (currently 100MB)
4. **Use signed URLs** for private content (if needed in the future)
5. **Clean up unused files** - Implement a cleanup job for orphaned files

---

## **🐛 Troubleshooting**

### **Error: "new row violates row-level security policy"**
- Check that RLS policies are correctly configured
- Ensure user is authenticated before uploading
- Verify the file path matches the policy conditions

### **Error: "The resource already exists"**
- File with same name already exists
- Change the file naming strategy (already using timestamps + random string)
- Enable `upsert: true` in upload options if you want to overwrite

### **Error: "Bucket not found"**
- Double-check bucket name matches exactly: `product-files`
- Verify bucket was created successfully in Supabase dashboard

### **Error: "Failed to upload"**
- Check network connection
- Verify CORS settings in Supabase (should be configured by default)
- Check browser console for detailed error messages
- Ensure file size is within limits

---

## **✅ Verification Checklist**

- [ ] `product-files` bucket created and public
- [ ] RLS policies configured for product-files
- [ ] Environment variables set correctly
- [ ] Test upload successful
- [ ] Files visible in Supabase Storage dashboard
- [ ] Public URLs accessible

---

## **📚 Additional Resources**

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads/standard-uploads)

---

**Once complete, the storage integration is fully functional and ready for production!**
