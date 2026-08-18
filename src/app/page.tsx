'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  PenTool, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  Search, 
  GraduationCap, 
  Clock, 
  DollarSign, 
  UploadCloud, 
  TrendingUp, 
  Lock,
  FileText,
  Presentation,
  Check
} from 'lucide-react';
import { MOCK_DOCUMENTS, MOCK_WRITERS, CATEGORIES, INSTITUTIONS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { NoteCard } from '@/components/notes/NoteCard';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'writers'>('notes');

  const popularNotes = MOCK_DOCUMENTS.slice(0, 4);
  const featuredWriters = MOCK_WRITERS.slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-xs animate-in fade-in zoom-in duration-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Escrow Protected Projects • 90% Creator Royalties • Turnitin Certified</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.15] max-w-4xl mx-auto">
            The Academic Marketplace for <span className="text-primary-600">Study Notes</span> & Verified <span className="text-emerald-600">Escrow Projects</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Download syllabus-specific university notes, sell your academic work for 90% royalties, or hire verified PhD & Masters researchers with 100% money-back escrow protection.
          </p>

          {/* Dual Action CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto pt-2">
            
            {/* Card 1: Notes Marketplace */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:shadow-xl hover:border-primary-300 transition-all text-left space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary-100 text-primary-800">
                  90% Royalties
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                  Browse & Sell Study Notes
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Access lecture notes, past questions, and complete pre-written final year projects.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/notes"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-primary-600 group-hover:translate-x-1 transition-transform"
                >
                  Explore Notes Catalog <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/notes/upload"
                  className="text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Upload & Earn
                </Link>
              </div>
            </div>

            {/* Card 2: Custom Assignment & Escrow Projects */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:shadow-xl hover:border-emerald-300 transition-all text-left space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <PenTool className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  100% Escrow
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Hire Academic Writers & Analysts
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Order custom term papers, SPSS data analysis, theses, and defense presentation slides.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/hire-writer/new"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 group-hover:translate-x-1 transition-transform"
                >
                  Order Custom Project <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/hire-writer"
                  className="text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Browse Writers
                </Link>
              </div>
            </div>

          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-center">
            <div className="p-4 bg-white/70 rounded-2xl border border-slate-200/60 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">12,400+</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Study Materials</p>
            </div>
            <div className="p-4 bg-white/70 rounded-2xl border border-slate-200/60 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-emerald-700">100%</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Escrow Money-Back</p>
            </div>
            <div className="p-4 bg-white/70 rounded-2xl border border-slate-200/60 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">450+</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Verified Researchers</p>
            </div>
            <div className="p-4 bg-white/70 rounded-2xl border border-slate-200/60 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-primary-600">90%</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Creator Royalties</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. HOW ESCROW WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white space-y-8 shadow-2xl">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Zero Risk Guarantee
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">How Our 3-Step Escrow Works</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Writers are never paid until you inspect the work, verify the Turnitin report, and click approve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-lg flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-white">Order & Lock Funds in Escrow</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Specify pages, citation format, and deadline. Your payment is held safely by StudyNoteHub in escrow.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-lg flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-white">Writer Submits Draft & Turnitin</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your verified researcher completes the project and uploads the final draft with Turnitin originality certification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-black text-lg flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-white">Approve or Request Revisions</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Review the deliverable. If 100% satisfied, click release escrow. If not, request free revisions or claim a refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR NOTES & PRE-WRITTEN PROJECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Featured Notes & Solved Projects</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Verified study materials from top universities with sample previews
            </p>
          </div>
          <Link
            href="/notes"
            className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
          >
            View all 12,400+ materials <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularNotes.map((doc) => (
            <NoteCard key={doc.id} note={doc} />
          ))}
        </div>
      </section>

    </div>
  );
}
