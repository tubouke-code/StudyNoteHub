'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types/database.types';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: Profile | null;
  isLoggedIn: boolean;
  login: (role?: UserRole, customEmail?: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Function to fetch real profile from Supabase
  const syncSupabaseProfile = async () => {
    try {
      const supabase = createClient();

      // Check if URL has ?code= from an auth redirect
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
          try {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeError && exchangeData?.session) {
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
            }
          } catch (e) {
            console.error('Error exchanging auth code:', e);
          }
        }
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const authUser = session.user;
        const email = authUser.email?.toLowerCase() || '';

        // Query real profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        let role: UserRole = 'STUDENT';
        let admin_permission = undefined;

        // Check if owner or designated admin in database
        if (email === 'orukari878@gmail.com' || profile?.role === 'ADMIN' || profile?.admin_permission) {
          role = 'ADMIN';
          admin_permission = profile?.admin_permission || 'SUPER_ADMIN';
        } else if (profile?.role === 'WRITER' || authUser.user_metadata?.role === 'WRITER') {
          role = 'WRITER';
        } else {
          role = (profile?.role as UserRole) || 'STUDENT';
        }

        const activeProfile: Profile = {
          id: authUser.id,
          email: email,
          full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split('@')[0] || 'User',
          role: role,
          admin_permission: admin_permission,
          avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          institution: profile?.institution,
          department: profile?.department,
          bio: profile?.bio,
          wallet_balance: Number(profile?.wallet_balance) || 0,
          is_verified_writer: Boolean(profile?.is_verified_writer) || role === 'ADMIN',
          is_email_verified: Boolean(profile?.is_email_verified) || email === 'orukari878@gmail.com',
          writer_skills: profile?.writer_skills || [],
          writer_rating: profile?.writer_rating || 5.0,
          total_reviews: profile?.total_reviews || 0,
          total_completed_orders: profile?.total_completed_orders || 0,
          created_at: profile?.created_at || authUser.created_at || new Date().toISOString(),
        };

        setUser(activeProfile);
        setIsLoggedIn(true);
        localStorage.setItem('snh_auth_session', JSON.stringify(activeProfile));
        return;
      } else {
        // No active session
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('snh_auth_session');
      }
    } catch (err) {
      console.error('Error syncing Supabase auth session:', err);
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('snh_auth_session');
    }
  };

  useEffect(() => {
    syncSupabaseProfile();

    // Listen for live Supabase Auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        syncSupabaseProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('snh_auth_session');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (role: UserRole = 'STUDENT', customEmail?: string) => {
    syncSupabaseProfile();
  };

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('snh_auth_session');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, refreshUser: syncSupabaseProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
