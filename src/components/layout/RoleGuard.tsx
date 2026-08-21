'use client';

import React from 'react';
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
 * - If user is not authenticated → redirect to /login
 * - If user role doesn't match allowedRoles → redirect to their correct dashboard
 * - ADMIN users can access any dashboard (preview mode via Admin Switcher)
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [isChecking, setIsChecking] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    // Wait for auth to initialize
    const timer = setTimeout(() => {
      if (!isLoggedIn || !user) {
        router.push('/login');
        return;
      }

      // Admin can access any dashboard (preview mode)
      if (user.role === 'ADMIN') {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if user's role is in the allowed list
      if (allowedRoles.includes(user.role)) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Redirect to correct dashboard based on role
      const redirectPath = user.role === 'WRITER' ? '/writer-dashboard' : '/dashboard';
      router.push(redirectPath);
    }, 500); // Brief delay to allow auth state to resolve

    return () => clearTimeout(timer);
  }, [isLoggedIn, user, allowedRoles, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-900">Access Denied</p>
          <p className="text-xs text-slate-500">Redirecting you to the right dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
