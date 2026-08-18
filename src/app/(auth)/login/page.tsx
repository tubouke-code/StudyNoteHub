'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Lock, Mail, ArrowRight, ShieldCheck, User, PenTool, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/database.types';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login } = useAuth();

  const [email, setEmail] = useState('orukari878@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Execute login and store session with user's email
      login(selectedRole, email);

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (email.toLowerCase() === 'orukari878@gmail.com' || selectedRole === 'ADMIN') {
        router.push('/admin');
      } else if (selectedRole === 'WRITER') {
        router.push('/writer-dashboard');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    if (role === 'ADMIN') {
      login('ADMIN', 'orukari878@gmail.com');
      router.push('/admin');
    } else if (role === 'WRITER') {
      login('WRITER', 'dr.emeka@writers.hub');
      router.push('/writer-dashboard');
    } else {
      login('STUDENT', 'alex.adebayo@university.edu.ng');
      router.push('/dashboard');
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
          <h2 className="text-2xl font-black text-slate-900">Sign In to Continue</h2>
          <p className="text-xs text-slate-500">
            Access your personalized student, writer, or admin dashboard
          </p>
        </div>

        {/* Role Preset Tabs */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Sign In As:
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('STUDENT');
                setEmail('alex.adebayo@university.edu.ng');
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                selectedRole === 'STUDENT'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Student
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('WRITER');
                setEmail('dr.emeka@writers.hub');
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                selectedRole === 'WRITER'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Writer
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('ADMIN');
                setEmail('orukari878@gmail.com');
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                selectedRole === 'ADMIN'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Admin
            </button>
          </div>
        </div>

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
                placeholder="user@university.edu"
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
            {isLoading ? 'Authenticating...' : `Enter ${selectedRole} Dashboard`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick 1-Click Demo Login Shortcuts */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[10px] text-center uppercase tracking-wider font-bold text-slate-400">
            Quick 1-Click Instant Preview Login:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('STUDENT')}
              className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-700 border border-slate-200 text-[11px] font-bold transition-all"
            >
              🎓 Student
            </button>
            <button
              onClick={() => handleQuickDemoLogin('WRITER')}
              className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 text-[11px] font-bold transition-all"
            >
              ✍️ Writer
            </button>
            <button
              onClick={() => handleQuickDemoLogin('ADMIN')}
              className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-[11px] font-bold transition-all"
            >
              🛡️ Super Admin
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500">
          New to StudyNoteHub?{' '}
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
