'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types/database.types';
import { MOCK_CURRENT_USER, MOCK_WRITERS, MOCK_ADMINS } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: Profile | null;
  isLoggedIn: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage or session on mount
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
  }, []);

  const login = (role: UserRole = 'STUDENT') => {
    let profileToSet: Profile;
    if (role === 'WRITER') {
      profileToSet = MOCK_WRITERS[0];
    } else if (role === 'ADMIN') {
      profileToSet = {
        id: MOCK_ADMINS[0].id,
        email: MOCK_ADMINS[0].email,
        full_name: MOCK_ADMINS[0].full_name,
        role: 'ADMIN',
        admin_permission: 'SUPER_ADMIN',
        avatar_url: MOCK_ADMINS[0].avatar_url,
        wallet_balance: 500000.00,
        is_verified_writer: true,
        created_at: new Date().toISOString(),
      };
    } else {
      profileToSet = MOCK_CURRENT_USER;
    }

    setUser(profileToSet);
    setIsLoggedIn(true);
    localStorage.setItem('snh_auth_session', JSON.stringify(profileToSet));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('snh_auth_session');
  };

  const switchRole = (role: UserRole) => {
    login(role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, switchRole }}>
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
