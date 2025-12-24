# Vercel Deployment Guide

## Fix White Screen Error: Add Environment Variables

Your app shows a white screen on Vercel because the environment variables are missing. Follow these steps:

### 1. Go to Vercel Dashboard
1. Open your project: https://vercel.com/your-username/aiacademic
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar

### 2. Add These Environment Variables

Add each variable with these **exact names and values**:

#### Supabase Variables (REQUIRED - causes white screen if missing):
```
Name: VITE_SUPABASE_URL
Value: https://ujmqnoizgkjvaoyiyeia.supabase.co
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbXFub2l6Z2tqdmFveWl5ZWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2OTkyMTYsImV4cCI6MjA3NTI3NTIxNn0.2LrLveQvNEbj8IHQOTKexKsY2vLHHfcgGgQrUDKhcVA
```

#### Gemini AI Variables (REQUIRED for features to work):
```
Name: VITE_GEMINI_API_KEY
Value: AIzaSyBocGIDbzHW-O3L_Th2DkgGh9mIIjJ6bcw
```

```
Name: VITE_GEMINI_API_KEY_PRIMARY
Value: AIzaSyBocGIDbzHW-O3L_Th2DkgGh9mIIjJ6bcw
```

```
Name: VITE_GEMINI_API_KEY_SECONDARY
Value: AIzaSyBsMPe_MEasu7x3u9EK85ULYDHZ3oykklM
```

### 3. Important Settings for Each Variable:
- **Environment**: Select all three: `Production`, `Preview`, and `Development`
- This ensures the variables work in all deployments

### 4. Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click the **three dots (...)** on your latest deployment
3. Click **Redeploy**
4. Wait for the build to complete (1-2 minutes)

### 5. Test Your Site
Once redeployed, your site should work without the white screen!

---

## Quick Checklist
- [ ] Add VITE_SUPABASE_URL
- [ ] Add VITE_SUPABASE_ANON_KEY
- [ ] Add VITE_GEMINI_API_KEY
- [ ] Add VITE_GEMINI_API_KEY_PRIMARY
- [ ] Add VITE_GEMINI_API_KEY_SECONDARY
- [ ] Select all environments (Production, Preview, Development) for each
- [ ] Redeploy the application
- [ ] Test the live site

## Troubleshooting
If you still see a white screen:
1. Open browser console (F12)
2. Check for any other missing environment variables
3. Make sure all variable names start with `VITE_` (Vite requirement)
4. Clear your browser cache and hard refresh (Ctrl + Shift + R)

## Security Note
⚠️ These environment variables are now exposed in your deployment. For production, you should:
1. Rotate all API keys
2. Set up proper access controls in Supabase
3. Use server-side API routes for sensitive operations
