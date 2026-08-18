'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Check Supabase Auth
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      // Automatic Role Lookup from Supabase profiles table
      let detectedRole: 'ADMIN' | 'WRITER' | 'STUDENT' = 'STUDENT';

      if (cleanEmail === 'orukari878@gmail.com') {
        detectedRole = 'ADMIN';
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, admin_permission')
          .eq('email', cleanEmail)
          .single();

        if (profile?.role === 'ADMIN' || profile?.admin_permission) {
          detectedRole = 'ADMIN';
        } else if (profile?.role === 'WRITER') {
          detectedRole = 'WRITER';
        } else {
          detectedRole = 'STUDENT';
        }
      }

      // Update session in Auth Context
      login(detectedRole, cleanEmail);

      // Automated intelligent redirection
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (detectedRole === 'ADMIN') {
        router.push('/admin');
      } else if (detectedRole === 'WRITER') {
        router.push('/writer-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback for demo preview
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'orukari878@gmail.com') {
        login('ADMIN', cleanEmail);
        router.push('/admin');
      } else {
        login('STUDENT', cleanEmail);
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              StudyNote<span className="text-primary-600">Hub</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900">Sign In to Account</h2>
          <p className="text-xs text-slate-500">
            Enter your email to access your personal dashboard
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-primary-600 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md shadow-primary-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-primary-600 hover:underline">
            Create Free Account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
