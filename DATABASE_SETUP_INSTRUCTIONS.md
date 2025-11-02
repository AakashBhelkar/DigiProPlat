# Database Setup Instructions for DigiProPlat

## Step 1: Get Your Supabase Anon Key

1. Go to: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/settings/api
2. Copy the **`anon` / `public`** key
3. Update `.env.local` file - replace `YOUR_ANON_KEY_HERE` with your actual anon key

## Step 2: Run Database Migrations

### Option A: Using Supabase CLI (Recommended)

```bash
cd "D:\AI Apps\DigiProPlat-main"
npx supabase db push
```

### Option B: Manual SQL Execution

1. Go to: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/editor
2. Copy the contents of `supabase/migrations/20251101000000_complete_schema_setup.sql`
3. Paste and run in the SQL Editor
4. Copy the contents of `supabase/migrations/20251101000001_storage_setup.sql`
5. Paste and run in the SQL Editor

## Step 3: Create Admin Account

The admin account will be created automatically with the following credentials:

**Email:** hello@akadeadshot.work
**Password:** You need to set this manually

### To set the admin password:

1. Go to: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/editor
2. Run this SQL (replace `YOUR_SECURE_PASSWORD` with your desired password):

```sql
-- First, generate a bcrypt hash for your password
-- You can use: https://bcrypt-generator.com/ with 10 rounds
-- Or use the command below with your password

UPDATE admin_users
SET password_hash = crypt('YOUR_SECURE_PASSWORD', gen_salt('bf', 10))
WHERE email = 'hello@akadeadshot.work';
```

**Recommended Password:** `Admin@DigiPro2025!` (Strong password)

If you want to use this password, run:

```sql
UPDATE admin_users
SET password_hash = crypt('Admin@DigiPro2025!', gen_salt('bf', 10))
WHERE email = 'hello@akadeadshot.work';
```

## Step 4: Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check if admin user exists
SELECT email, first_name, last_name, role, is_active FROM admin_users;

-- Check storage buckets
SELECT id, name, public FROM storage.buckets;

-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Step 5: Enable Realtime (Optional)

For real-time features like notifications:

1. Go to: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/database/replication
2. Enable replication for these tables:
   - `notifications`
   - `orders`
   - `transactions`
   - `product_reviews`

## Database Schema Overview

### Core Tables:
- ✅ **profiles** - User profiles
- ✅ **products** - Digital products
- ✅ **product_files** - Product file attachments
- ✅ **product_reviews** - Product reviews and ratings
- ✅ **orders** - Customer orders
- ✅ **order_items** - Individual items in orders
- ✅ **transactions** - Payment transactions
- ✅ **landing_pages** - User-created landing pages
- ✅ **page_sections** - Sections within landing pages
- ✅ **templates** - Page templates
- ✅ **notifications** - User notifications
- ✅ **wishlists** - Product wishlists
- ✅ **coupons** - Discount coupons
- ✅ **admin_users** - Admin accounts
- ✅ **system_logs** - System activity logs
- ✅ **email_notifications** - Email queue
- ✅ **user_api_keys** - User API keys (OpenAI)

### Storage Buckets:
- ✅ **product-files** - Private product downloads
- ✅ **product-images** - Public product images
- ✅ **avatars** - User profile pictures
- ✅ **page-assets** - Landing page assets

## Troubleshooting

### Issue: "relation already exists"
**Solution:** The table already exists. Skip that migration or drop the table first.

### Issue: "permission denied"
**Solution:** Make sure you're using the service_role key or running queries as authenticated user.

### Issue: "function crypt does not exist"
**Solution:** Install pgcrypto extension:
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## Next Steps

After database setup is complete, proceed with:
1. Installing MUI components ✅ (Already done)
2. Integrating Minimals.cc theme
3. Redesigning pages
4. Setting up Stripe webhooks
5. Configuring email notifications

---

For any issues, check the Supabase logs:
https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/logs
