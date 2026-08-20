'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  KeyRound,
  Sparkles,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const provider = searchParams.get('provider') || 'email';
  const { user, refreshUser } = useAuth();

  const [email, setEmail] = useState(emailParam || user?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isVerified, setIsVerified] = useState(false);

  // Auto-redirect if already verified
  useEffect(() => {
    if (user?.is_email_verified) {
      if (user.email.toLowerCase() === 'orukari878@gmail.com') {
        router.push('/admin');
      } else if (user.role === 'WRITER') {
        router.push('/writer-dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [emailParam, user?.email]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !email) {
      setErrorMessage('Please enter the verification code sent to your email.');
      return;
    }

    if (otpCode.trim().length < 6) {
      setErrorMessage('Please enter the complete verification code (6 to 8 digits).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const supabase = createClient();
      
      // 1. Try verify with 'email' (Magic Link OTP)
      let authResult = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otpCode.trim(),
        type: 'email',
      });

      if (authResult.error) {
        // 2. Try with 'signup' token type
        authResult = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otpCode.trim(),
          type: 'signup',
        });

        if (authResult.error) {
          // 3. Try with 'magiclink' token type
          authResult = await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token: otpCode.trim(),
            type: 'magiclink' as any,
          });

          if (authResult.error) {
            throw new Error(authResult.error.message);
          }
        }
      }

      const verifiedUser = authResult.data?.user || user;
      const verifiedUserId = verifiedUser?.id;

      // Update user metadata in Supabase Auth
      try {
        await supabase.auth.updateUser({
          data: { is_email_verified: true }
        });
      } catch (e) {
        console.error('Error updating user metadata:', e);
      }

      // Upsert into profiles table
      if (verifiedUserId) {
        const authUserMeta = (authResult.data?.user as any)?.user_metadata;
        const fullName = user?.full_name || authUserMeta?.full_name || authUserMeta?.name || email.split('@')[0] || 'User';

        await supabase
          .from('profiles')
          .upsert({
            id: verifiedUserId,
            email: email.trim().toLowerCase(),
            full_name: fullName,
            is_email_verified: true,
          }, { onConflict: 'id' });
      }

      setIsVerified(true);
      setSuccessMessage('Email verified successfully! Taking you to your dashboard...');
      
      await refreshUser();

      // Redirect directly
      setTimeout(() => {
        if (email.toLowerCase() === 'orukari878@gmail.com') {
          window.location.href = '/admin';
        } else if (user?.role === 'WRITER') {
          window.location.href = '/writer-dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }, 1000);

    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code. Please request a fresh code.');
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || !email) return;
    setIsResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const supabase = createClient();
      
      // Resend OTP / verification email
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });

      if (error) {
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim().toLowerCase(),
        });
        if (resendError) throw resendError;
      }

      setSuccessMessage('A fresh verification code and link have been sent to your inbox!');
      setCountdown(60);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification email. Please wait a moment.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-2xl space-y-6">
        
        {/* Header Icon & Logo */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block">
            <img
              src="/logo.jpg"
              alt="StudyNoteHub"
              className="h-12 w-auto object-contain mx-auto rounded-xl"
            />
          </Link>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-0.5 rounded-full border border-primary-100">
              {provider === 'google' ? 'Google Auth Verification' : 'Email Security Verification'}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              Verify Your Email Address
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              To protect academic integrity and secure your escrow wallet, please confirm your email address.
            </p>
          </div>
        </div>

        {/* Email Address Callout */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Verification Sent To</span>
          <p className="text-sm font-black text-slate-900 font-mono break-all">{email || 'your email'}</p>
        </div>

        {/* 2 Ways to Verify Info Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-2">
          <p className="font-bold flex items-center gap-1.5 text-indigo-950">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> 2 Easy Ways to Verify:
          </p>
          <div className="space-y-1 text-[11px] text-indigo-800">
            <p><strong>1. Click the Button in Email:</strong> Open your email app and click <em>"Verify Email"</em> to log in automatically.</p>
            <p><strong>2. Or Enter Code Below:</strong> Enter your verification code (6 to 8 digits).</p>
          </div>
        </div>

        {/* Success / Error Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Enter Verification Code (6 to 8 Digits)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={8}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="12345678"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-center text-lg font-black tracking-widest text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isVerified}
            className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Code...
              </>
            ) : isVerified ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Verified & Redirecting...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Confirm Email Code
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Code Section */}
        <div className="text-center pt-2 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-500">
            Didn't receive the email? Check your Spam / Promotions folder.
          </p>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={countdown > 0 || isResending}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 disabled:text-slate-400"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            {countdown > 0 ? `Resend Email in ${countdown}s` : 'Resend Verification Email'}
          </button>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
