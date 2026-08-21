'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/database.types';
import { Loader2, ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

/**
 * RoleGuard - Wraps protected dashboard pages to enforce role-based access.
 * 
 * - If user is not authenticated → redirects to /login once auth is confirmed not loading.
 * - If user role matches or user is ADMIN → renders children.
 * - If user is a verified writer and route allows WRITER → renders children.
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // If Auth is still loading session from Supabase, stay in waiting state
    if (isLoading) return;

    // Once auth is definitively resolved:
    if (!isLoggedIn || !user) {
      router.replace('/login');
      return;
    }

    // Admins (or the primary owner) can access all views in preview mode
    if (user.role === 'ADMIN' || user.email === 'orukari878@gmail.com') {
      setIsAuthorized(true);
      return;
    }

    // Check if the user's role is in the allowed list
    if (allowedRoles.includes(user.role)) {
      setIsAuthorized(true);
      return;
    }

    // If route allows WRITER and user has writer accreditation
    if (allowedRoles.includes('WRITER') && (user.role === 'WRITER' || user.is_verified_writer)) {
      setIsAuthorized(true);
      return;
    }

    // If user has a different role, redirect to their home portal
    const targetDashboard = (user.role === 'WRITER' || user.is_verified_writer) 
      ? '/writer-dashboard' 
      : '/dashboard';
    
    router.replace(targetDashboard);
  }, [isLoggedIn, user, isLoading, allowedRoles, router]);

  // While checking auth status
  if (isLoading || (!isAuthorized && isLoggedIn && user)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50/50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in (redirecting)
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50/50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
