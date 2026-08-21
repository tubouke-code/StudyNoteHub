import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Lock, CreditCard, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo.jpg"
                alt="StudyNoteHub"
                className="h-12 w-auto object-contain rounded-xl bg-white p-1 shadow-sm"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The premier platform for university and college students to access peer-reviewed lecture notes, exam past questions, and hire vetted academic research writers with guaranteed milestone escrow protection.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Escrow Protection
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                <Lock className="w-4 h-4 text-primary-400" /> SSL Secured Payments
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Study Notes</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/notes" className="hover:text-white transition-colors">Browse Materials</Link></li>
              <li><Link href="/notes?price=free" className="hover:text-white transition-colors">Free Lecture Notes</Link></li>
              <li><Link href="/notes/upload" className="hover:text-white transition-colors">Upload & Monetize</Link></li>
              <li><Link href="/notes?category=engineering" className="hover:text-white transition-colors">Engineering & Tech</Link></li>
              <li><Link href="/notes?category=law" className="hover:text-white transition-colors">Law & Case Summaries</Link></li>
            </ul>
          </div>

          {/* Hire a Writer */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Writing Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/hire-writer/new?type=assignment" className="hover:text-white transition-colors">Assignment Writing</Link></li>
              <li><Link href="/hire-writer/new?type=project" className="hover:text-white transition-colors">Final Year Projects</Link></li>
              <li><Link href="/hire-writer/new?type=thesis" className="hover:text-white transition-colors">Thesis & Dissertation</Link></li>
              <li><Link href="/hire-writer/new?type=data_analysis" className="hover:text-white transition-colors">SPSS / STATA Analysis</Link></li>
              <li><Link href="/hire-writer" className="hover:text-white transition-colors">How Escrow Works</Link></li>
            </ul>
          </div>

          {/* Payment Gateways & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Supported Payments</h4>
            <p className="text-xs text-slate-400 mb-3">
              Instant checkout with multiple currencies via Africa & Global gateways.
            </p>
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Paystack</span>
                <span className="text-[10px] text-emerald-400 font-mono">Cards • Bank Transfer • USSD</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Flutterwave</span>
                <span className="text-[10px] text-amber-400 font-mono">Multi-currency • Mobile Money</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} StudyNoteHub Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/academic-integrity" className="hover:text-slate-400">Academic Integrity Policy</Link>
            <Link href="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms of Escrow Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
