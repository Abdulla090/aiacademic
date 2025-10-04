-- SQL script to run in Supabase SQL Editor
-- This creates the necessary tables and policies for the credit system

-- 1. Create users_credits table
CREATE TABLE IF NOT EXISTS public.users_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  credits INTEGER DEFAULT 100 NOT NULL CHECK (credits >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create credit_transactions table for tracking usage
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  tool_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.users_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for users_credits
-- Users can read their own credits
CREATE POLICY "Users can view their own credits"
  ON public.users_credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own credits
CREATE POLICY "Users can update their own credits"
  ON public.users_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow insert for new users (when they sign up)
CREATE POLICY "Users can insert their own credits"
  ON public.users_credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Create policies for credit_transactions
-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert their own transactions"
  ON public.credit_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Create function to automatically create credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_credits (user_id, credits)
  VALUES (NEW.id, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to run the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for updating timestamps
DROP TRIGGER IF EXISTS on_users_credits_updated ON public.users_credits;
CREATE TRIGGER on_users_credits_updated
  BEFORE UPDATE ON public.users_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_credits_user_id ON public.users_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
