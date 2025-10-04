# Supabase Authentication & Credit System Setup Guide

## ✅ What's Been Done

1. **Installed Dependencies**
   - @supabase/supabase-js

2. **Created Files**
   - `.env` - Environment variables
   - `src/lib/supabase.ts` - Supabase client configuration
   - `src/contexts/AuthContext.tsx` - Authentication context
   - `src/pages/Login.tsx` - Login page
   - `src/pages/Signup.tsx` - Signup page
   - `src/components/ProtectedRoute.tsx` - Protected route wrapper
   - `src/components/CreditDisplay.tsx` - Credit display component
   - `src/config/credits.ts` - Credit costs configuration
   - `supabase-schema.sql` - Database schema

3. **Updated Files**
   - `App.tsx` - Added AuthProvider and protected routes
   - `CustomSidebar.tsx` - Added credit display
   - `ReportGenerator.tsx` - Added credit checking

## 🔧 Setup Steps Required

### 1. Run SQL in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard/project/ujmqnoizgkjvaoyiyeia
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-schema.sql`
5. Paste into the SQL editor
6. Click "Run" button
7. Verify tables were created:
   - Go to "Table Editor"
   - You should see `users_credits` and `credit_transactions` tables

### 2. Enable Email Authentication

1. In Supabase dashboard, go to "Authentication" > "Providers"
2. Make sure "Email" provider is enabled
3. Configure email templates (optional)

### 3. Test the Application

1. Start your app: `npm run dev`
2. Visit the app
3. Try to access any tool - you'll be redirected to login
4. Click "Sign Up" and create an account
5. You should get 100 credits automatically
6. Try using the Report Generator - it will deduct 10 credits

## 📊 Credit System

### Credit Costs
- **Major Tools** (10 credits):
  - Report Generator
  - Article Writer
  - Presentation Generator
  - Writing Supervisor
  - AI Research Assistant

- **Medium Tools** (5 credits):
  - Mind Map Generator
  - Quiz Generator
  - Flashcard Generator
  - Summarizer/Paraphraser
  - Grammar Checker
  - OCR Extractor
  - Chat with File
  - Knowledge Graph

- **Small Tools** (2 credits):
  - Citation Generator
  - Task Planner
  - Kurdish Dialect Translator
  - Text Structure Fixer
  - AI Content Humanizer

- **File Tools** (1 credit):
  - File Converter
  - Image Converter
  - Compressor

### How to Add Credit Checking to Other Tools

Example for Article Writer:

```typescript
// 1. Import at the top
import { useAuth } from '@/contexts/AuthContext';
import { CREDIT_COSTS } from '@/config/credits';

// 2. Inside component
const { deductCredits } = useAuth();

// 3. Before starting generation
const handleGenerate = async () => {
  // Check and deduct credits
  const success = await deductCredits(
    CREDIT_COSTS.ARTICLE_WRITER,
    'Article Writer',
    `Generating article about: ${topic}`
  );

  if (!success) return; // Will show error toast automatically

  // Continue with generation...
};
```

## 🔐 Authentication Flow

1. **Signup**: User creates account → Gets 100 credits automatically (via database trigger)
2. **Login**: User logs in → Credits are fetched and displayed
3. **Protected Routes**: All tool pages require authentication
4. **Credit Deduction**: Each tool usage checks credits first, then deducts if sufficient

## 🎨 UI Components

- **Login/Signup Pages**: Clean Kurdish/English bilingual forms
- **Credit Display**: Shows in sidebar when expanded
- **Protected Routes**: Auto-redirect to login if not authenticated
- **Error Handling**: Friendly messages in Kurdish

## 📝 Database Schema

### users_credits Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `credits`: INTEGER (default 100)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### credit_transactions Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `amount`: INTEGER (negative for deductions)
- `tool_name`: VARCHAR
- `description`: TEXT
- `created_at`: TIMESTAMP

## 🔒 Security

- Row Level Security (RLS) is enabled
- Users can only see/modify their own credits
- Automatic credit creation via database trigger
- All API keys are in `.env` (not committed)

## 🚀 Next Steps

1. Run the SQL schema in Supabase
2. Test signup/login
3. Add credit checking to remaining tools
4. (Optional) Add credit purchase system
5. (Optional) Add admin panel to manage credits

## ⚠️ Important Notes

- The `.env` file contains your Supabase keys - **NEVER commit this to Git**
- Each new user automatically gets 100 credits via database trigger
- Credits are checked BEFORE tool execution
- Failed operations don't consume credits
- All tools except About page require authentication

## 🐛 Troubleshooting

If signup doesn't work:
1. Check Supabase email settings
2. Verify SQL schema was run correctly
3. Check browser console for errors

If credits don't appear:
1. Verify the database trigger was created
2. Check `users_credits` table in Supabase
3. Check browser console for errors

If login doesn't redirect:
1. Clear browser cache
2. Check network tab for API errors
3. Verify Supabase URL and keys in `.env`
