# Database Migration Steps - FIX USER LOGIN

## 🔴 **CRITICAL: Run These Steps NOW**

Your user login is failing because the database tables and triggers aren't set up yet.

---

## **OPTION 1: Quick Fix (5 minutes)**

### **Step 1: Run the Complete Schema**
1. Go to: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/sql/new
2. Open file: `supabase/migrations/20251101000000_complete_schema_setup.sql`
3. Copy ALL contents and paste into SQL Editor
4. Click **RUN**
5. Wait for "Success" message

### **Step 2: Run the Storage Setup**
1. Still in SQL Editor (same page)
2. Open file: `supabase/migrations/20251101000001_storage_setup.sql`
3. Copy ALL contents and paste
4. Click **RUN**

### **Step 3: Fix User Login**
1. Still in SQL Editor
2. Open file: `FIX_USER_LOGIN.sql` (just created)
3. Copy ALL contents and paste
4. Click **RUN**
5. Should see "SETUP COMPLETE" message

### **Step 4: Test Login**
1. Go back to your app: http://localhost:5173/login
2. Try logging in again
3. Should work now! ✅

---

## **OPTION 2: Using Supabase CLI (Alternative)**

```bash
cd "D:\AI Apps\DigiProPlat-main"

# Push all migrations
npx supabase db push

# Or run them individually
npx supabase db push --file supabase/migrations/20251101000000_complete_schema_setup.sql
npx supabase db push --file supabase/migrations/20251101000001_storage_setup.sql
npx supabase db push --file FIX_USER_LOGIN.sql
```

---

## **What This Fixes:**

1. ✅ **Creates `profiles` table** - Stores user profile data
2. ✅ **Creates auto-trigger** - Automatically creates profile when user signs up
3. ✅ **Creates profiles for existing users** - Retroactively creates profiles
4. ✅ **Fixes RLS policies** - Allows users to read their own profiles
5. ✅ **Creates storage buckets** - For file uploads
6. ✅ **Sets up all other tables** - Orders, products, transactions, etc.

---

## **Verification:**

After running the scripts, check in Supabase:

### **Check Tables Exist:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should show: profiles, products, orders, transactions, etc.

### **Check Your Profile Exists:**
```sql
SELECT * FROM profiles;
```

Should show your user profile!

### **Check Trigger Exists:**
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Should return: `on_auth_user_created`

---

## **Troubleshooting:**

### **Error: "relation profiles does not exist"**
- Run Step 1 again (complete_schema_setup.sql)

### **Error: "permission denied"**
- Make sure you're logged into the correct Supabase project
- Use the service_role key, not anon key

### **Error: "column user_subscriptions does not exist"**
- The user_subscriptions table wasn't created
- Run the complete schema setup script

### **Still getting 400 error?**
1. Go to: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/editor
2. Click "Logs" tab
3. Check for detailed error messages
4. Share with me if needed

---

## **After Running Migrations:**

1. ✅ User login will work
2. ✅ Profile will be created automatically
3. ✅ Dashboard will load properly
4. ✅ All features will be available

---

**Run the SQL scripts now and let me know if you see any errors!**
