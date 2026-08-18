'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  DollarSign, 
  Sparkles, 
  Award, 
  ArrowRight,
  TrendingUp,
  Wallet,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';

export default function ReferralPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.full_name ? user.full_name.toLowerCase().replace(/\s+/g, '') : 'ambassador';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://study-note-hub.vercel.app';
  const referralLink = `${origin}?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Get verified university lecture notes, solved past exams, and hire vetted final year project writers with 100% money-back escrow on StudyNoteHub:\n${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `StudyNoteHub has made semester exam revision & project writing seamless. Check out verified study materials here:`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Gift className="w-4 h-4 text-emerald-600" />
            Campus Ambassador & Referral Program
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
            Invite Course Mates & Earn <span className="text-emerald-600">5% Lifetime Rewards</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Share your personal referral link. Whenever your university friends buy lecture notes or order custom assignment projects, you receive a 5% instant cash bonus!
          </p>
        </div>

        {/* Share Link Card */}
        <div className="p-6 sm:p-8 bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl shadow-2xl border border-emerald-800/40 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400">
              Your Unique Referral Link
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-xs sm:text-sm font-mono text-emerald-200 outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-300">Quick Share:</span>
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              💬 Share to WhatsApp Group
            </button>
            <button
              onClick={handleTwitterShare}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition-all flex items-center gap-1.5"
            >
              🐦 Share on X (Twitter)
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Referred</span>
              <Users className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">28 Students</p>
            <span className="text-[11px] text-emerald-600 font-semibold block">Across 3 universities</span>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Referral Earned</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-700 mt-2">{formatCurrency(16450)}</p>
            <span className="text-[11px] text-slate-500 font-semibold block">5% from 42 transactions</span>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Ambassador Status</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">Gold Tier</p>
            <span className="text-[11px] text-amber-600 font-semibold block">Top 5% Campus Leader</span>
          </div>
        </div>

        {/* How It Works */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="text-lg font-black text-slate-900">How the Ambassador Program Works:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-lg flex items-center justify-center">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Share Your Link</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Send your link in department WhatsApp groups, faculty chats, or on social media.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-lg flex items-center justify-center">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">Friends Download or Hire</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                When they sign up and unlock study materials or hire project writers, our system tags your ID.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 font-black text-lg flex items-center justify-center">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Instant 5% Commission</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                5% of every transaction is instantly deposited into your wallet, withdrawable anytime!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
