'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, Mail, User, School, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'WRITER'>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-up failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            institution,
            role,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push(role === 'WRITER' ? '/writer-dashboard' : '/dashboard');
      }
    } catch (err: any) {
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-2xl space-y-6">
        
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
          <h2 className="text-2xl font-black text-slate-900">Create Free Account</h2>
          <p className="text-xs text-slate-500">
            Join the academic study notes and project writing escrow network
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* 1. Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading}
          className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            or with email
          </span>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'STUDENT'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I'm a Student (Download & Hire)
          </button>
          <button
            type="button"
            onClick={() => setRole('WRITER')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'WRITER'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I'm a Writer / Tutor (Earn)
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Adebayo"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu.ng"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">University / College</label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. University of Lagos (UNILAG)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
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
                Creating Account...
              </>
            ) : (
              <>
                Complete Sign Up
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary-600 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
