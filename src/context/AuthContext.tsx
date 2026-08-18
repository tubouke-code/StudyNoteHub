'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types/database.types';
import { MOCK_CURRENT_USER, MOCK_WRITERS, MOCK_ADMINS, MOCK_SUPER_ADMIN_PROFILE } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: Profile | null;
  isLoggedIn: boolean;
  login: (role?: UserRole, customEmail?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage or active session on mount
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

  const login = (role: UserRole = 'STUDENT', customEmail?: string) => {
    let profileToSet: Profile;

    // If logging in with the owner's email or explicit ADMIN role
    if (customEmail?.toLowerCase() === 'orukari878@gmail.com' || role === 'ADMIN') {
      profileToSet = {
        ...MOCK_SUPER_ADMIN_PROFILE,
        email: customEmail || 'orukari878@gmail.com',
      };
    } else if (role === 'WRITER') {
      profileToSet = {
        ...MOCK_WRITERS[0],
        email: customEmail || MOCK_WRITERS[0].email,
      };
    } else {
      profileToSet = {
        ...MOCK_CURRENT_USER,
        email: customEmail || MOCK_CURRENT_USER.email,
      };
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
    login(role, user?.email);
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
