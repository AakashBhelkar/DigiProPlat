# Deploy Edge Functions to Supabase

## Step 1: Deploy Admin Login Function

Run this command in your terminal:

```bash
cd "D:\AI Apps\DigiProPlat-main"
npx supabase functions deploy admin-login --project-ref mafryhnhgopxfckrepxv
```

If prompted for credentials, use your Supabase access token.

## Step 2: Get Supabase Access Token (if needed)

1. Go to: https://supabase.com/dashboard/account/tokens
2. Generate a new access token
3. Copy and save it securely

## Step 3: Alternative - Deploy via Supabase Dashboard

If CLI doesn't work:

1. Go to: https://supabase.com/dashboard/project/mafryhnhgopxfckrepxv/functions
2. Click "Create a new function"
3. Name it: `admin-login`
4. Copy the contents of `supabase/functions/admin-login/index.ts`
5. Paste into the editor
6. Click "Deploy"

## Step 4: Verify Deployment

Test the function:

```bash
curl -X POST \
  'https://mafryhnhgopxfckrepxv.supabase.co/functions/v1/admin-login' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"hello@akadeadshot.work","password":"Admin@DigiPro2025!"}'
```

You should see a success response with admin data.

## Troubleshooting

### Function not found
- Make sure it's deployed via CLI or Dashboard
- Check function name is exactly `admin-login`

### Password verification failed
- Verify admin password was set correctly in database
- Run this SQL again:
  ```sql
  UPDATE admin_users
  SET password_hash = crypt('Admin@DigiPro2025!', gen_salt('bf', 10))
  WHERE email = 'hello@akadeadshot.work';
  ```

### CORS errors
- Edge function already has CORS headers configured
- If still seeing errors, check browser console for details
