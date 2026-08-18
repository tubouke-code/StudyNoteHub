'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types/database.types';
import { MOCK_CURRENT_USER, MOCK_WRITERS, MOCK_SUPER_ADMIN_PROFILE } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: Profile | null;
  isLoggedIn: boolean;
  login: (role?: UserRole, customEmail?: string) => void;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
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
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const authUser = session.user;
        const email = authUser.email?.toLowerCase() || '';

        // Query profile from Supabase
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
          role = 'STUDENT';
        }

        const activeProfile: Profile = {
          id: authUser.id,
          email: email,
          full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Student User',
          role: role,
          admin_permission: admin_permission,
          avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          wallet_balance: Number(profile?.wallet_balance) || (role === 'STUDENT' ? 18500 : role === 'WRITER' ? 145000 : 500000),
          is_verified_writer: role === 'WRITER' || role === 'ADMIN',
          created_at: profile?.created_at || authUser.created_at || new Date().toISOString(),
        };

        setUser(activeProfile);
        setIsLoggedIn(true);
        localStorage.setItem('snh_auth_session', JSON.stringify(activeProfile));
        return;
      }
    } catch (err) {
      console.error('Error syncing Supabase auth session:', err);
    }

    // Fallback to local session storage if available
    const savedAuth = localStorage.getItem('snh_auth_session');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setUser(parsed);
        setIsLoggedIn(true);
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      }
    }
  };

  useEffect(() => {
    syncSupabaseProfile();

    // Listen for live Supabase Auth state changes (e.g. Google OAuth redirect)
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
    let profileToSet: Profile;
    const cleanEmail = customEmail?.toLowerCase() || '';

    if (cleanEmail === 'orukari878@gmail.com' || role === 'ADMIN') {
      profileToSet = {
        ...MOCK_SUPER_ADMIN_PROFILE,
        email: cleanEmail || 'orukari878@gmail.com',
      };
    } else if (role === 'WRITER') {
      profileToSet = {
        ...MOCK_WRITERS[0],
        email: cleanEmail || MOCK_WRITERS[0].email,
      };
    } else {
      profileToSet = {
        ...MOCK_CURRENT_USER,
        email: cleanEmail || MOCK_CURRENT_USER.email,
      };
    }

    setUser(profileToSet);
    setIsLoggedIn(true);
    localStorage.setItem('snh_auth_session', JSON.stringify(profileToSet));
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

  const switchRole = (role: UserRole) => {
    login(role, user?.email);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, switchRole, refreshUser: syncSupabaseProfile }}>
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
