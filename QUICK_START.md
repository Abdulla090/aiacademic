# 🚀 Quick Start - 3 Steps Only!

## ⚡ Step 1: Run SQL (2 minutes)
1. Open: https://supabase.com/dashboard/project/ujmqnoizgkjvaoyiyeia/sql
2. Click "New Query"
3. Copy EVERYTHING from `supabase-schema.sql`
4. Paste → Click "Run"
5. ✅ Done!

## ⚡ Step 2: Start App (10 seconds)
```bash
npm run dev
```

## ⚡ Step 3: Test (1 minute)
1. Go to http://localhost:5173/signup
2. Create account
3. See 100 credits in sidebar ✅
4. Use Report Generator (-10 credits)
5. Credits now show 90 ✅

## 🎯 That's It!

### What You Have Now:
✅ Full authentication (login/signup)
✅ 100 free credits per user
✅ Credit system on Report Generator
✅ Protected routes (all tools require login)
✅ Credit display in sidebar

### What to Do Next:
Add credit checking to other tools using this pattern:

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { CREDIT_COSTS } from '@/config/credits';

const { deductCredits } = useAuth();

const handleGenerate = async () => {
  const success = await deductCredits(
    CREDIT_COSTS.ARTICLE_WRITER, // Change to your tool
    'Article Writer',
    'Description'
  );
  if (!success) return;
  // Your code here...
};
```

### Credit Costs (from `credits.ts`):
- Report Generator: 10 credits
- Article Writer: 10 credits
- Quiz Generator: 5 credits
- Citation Generator: 2 credits
- File Converter: 1 credit
- etc.

### Routes:
- `/` - Landing (public)
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Dashboard (protected)
- All tool pages - Protected

## 📞 Need Help?
Read: `AUTH_SETUP_GUIDE.md` for full documentation

## 🎉 Done!
Your app now has:
- ✅ User accounts
- ✅ Credit system
- ✅ Protected routes
- ✅ 100 free credits per user
