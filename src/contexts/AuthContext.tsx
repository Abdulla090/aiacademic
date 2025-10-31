import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, UserCredits } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  credits: number;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  deductCredits: (amount: number, toolName: string, description?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user credits
  const fetchCredits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setCredits(data?.credits || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchCredits(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchCredits(session.user.id);
      } else {
        setCredits(0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { error };

      toast({
        title: 'بەخێربێیت!',
        description: 'هەژمارەکەت بە سەرکەوتوویی دروست کرا',
      });

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      toast({
        title: 'بەخێربێیت!',
        description: 'بە سەرکەوتوویی چوویتە ژوورەوە',
      });

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setCredits(0);

      toast({
        title: 'دەرچوون',
        description: 'بە سەرکەوتوویی دەرچوویت',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا دەربچیت',
        variant: 'destructive',
      });
    }
  };

  // Refresh credits
  const refreshCredits = async () => {
    if (user) {
      await fetchCredits(user.id);
    }
  };

  // Deduct credits
  const deductCredits = async (amount: number, toolName: string, description?: string): Promise<boolean> => {
    // TEMPORARILY DISABLED FOR TESTING - Credit system bypassed
    console.log(`[TESTING MODE] Would deduct ${amount} credits for ${toolName}`);
    return true;

    // Original credit logic (commented out for testing)
    /*
    if (!user) {
      toast({
        title: 'هەڵە',
        description: 'تکایە بچۆ ژوورەوە',
        variant: 'destructive',
      });
      return false;
    }

    if (credits < amount) {
      toast({
        title: 'کریدیت بەس نییە',
        description: `پێویستت بە ${amount} کریدیتە، بەڵام تەنها ${credits} کریدیتت هەیە`,
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Start a transaction-like operation
      const newCredits = credits - amount;

      // Update credits
      const { error: updateError } = await supabase
        .from('users_credits')
        .update({ credits: newCredits })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          tool_name: toolName,
          description: description || `${amount} کریدیت بەکارهێنرا بۆ ${toolName}`,
        });

      if (transactionError) throw transactionError;

      setCredits(newCredits);

      toast({
        title: 'سەرکەوتوو',
        description: `${amount} کریدیت بەکارهێنرا. ${newCredits} کریدیت ماوە`,
      });

      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      toast({
        title: 'هەڵە',
        description: 'نەتوانرا کریدیت لابەرێت',
        variant: 'destructive',
      });
      return false;
    }
    */
  };

  const value = {
    user,
    session,
    credits,
    loading,
    signUp,
    signIn,
    signOut,
    refreshCredits,
    deductCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
