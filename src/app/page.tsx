'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  BookOpen, 
  PenTool, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Star, 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  Lock, 
  FileText, 
  GraduationCap, 
  Users, 
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { MOCK_DOCUMENTS, MOCK_WRITERS, CATEGORIES, INSTITUTIONS } from '@/lib/mock-data';
import { NoteCard } from '@/components/notes/NoteCard';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Materials');

  const filteredNotes = MOCK_DOCUMENTS.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.institution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 gradient-hero border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Top Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100/80 border border-primary-200 text-primary-800 text-xs sm:text-sm font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>The #1 Academic Resource & Project Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Ace Your Exams with <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">Top Study Notes</span> or Hire a Vetted Writer.
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Download verified lecture notes, exam past questions, and project templates. Need urgent help? Pay vetted researchers to write your assignments and capstone projects with <strong className="text-slate-800">100% Escrow Protection</strong>.
            </p>

            {/* Dual CTA Hero Search Box */}
            <div className="pt-2 max-w-2xl mx-auto">
              <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-2.5 px-3 flex-1 w-full">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Course Code (e.g. ECO 201, CSC 301) or University..."
                    className="w-full text-sm sm:text-base outline-none text-slate-800 placeholder-slate-400 bg-transparent py-1.5"
                  />
                </div>
                <Link
                  href={`/notes?q=${encodeURIComponent(searchQuery)}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md shadow-primary-600/30 transition-all flex items-center justify-center gap-2"
                >
                  Search Notes
                </Link>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Popular:</span>
                <Link href="/notes?q=ECO+201" className="hover:text-primary-600 underline">ECO 201</Link>
                <span>•</span>
                <Link href="/notes?q=CSC+301" className="hover:text-primary-600 underline">CSC 301 (DSA)</Link>
                <span>•</span>
                <Link href="/notes?q=LAW+203" className="hover:text-primary-600 underline">Contract Law</Link>
                <span>•</span>
                <Link href="/notes?q=SPSS" className="hover:text-primary-600 underline">SPSS Data Analysis</Link>
              </div>
            </div>

            {/* Hero Trust Badges */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-200/60 mt-8">
              <div className="p-3 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">12,500+</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Study Materials</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">450+</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Verified Writers</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Escrow Guarantee</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-600">4.9/5</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Student Rating</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. DUAL VALUE PROPOSITIONS (UPLOAD & EARN vs HIRE A WRITER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Study Notes Hub */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden shadow-2xl flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Study Materials & Lecture Notes
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Access thousands of verified lecture summaries, past questions, and project manuals. Upload your own notes to earn passive income every time a classmate downloads them!
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Instant high-speed PDF downloads & in-browser preview
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Free and premium student-uploaded resources
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Earn 80% royalty per download straight to your wallet
                </li>
              </ul>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-3 relative z-10">
              <Link
                href="/notes"
                className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg"
              >
                Browse Materials
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/notes/upload"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20 flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                Upload & Earn
              </Link>
            </div>
          </div>

          {/* Card 2: Hire an Assignment Writer */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white overflow-hidden shadow-2xl flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
                <PenTool className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Pay to Write: Assignments & Projects
                </h2>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Stuck with a tight deadline? Hire top-rated Masters and PhD academic writers for assignments, term papers, dissertations, and data analysis with milestone escrow safety.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  100% Plagiarism-free & Turnitin-verified deliverables
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Funds held in Escrow until you review & approve the draft
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Direct real-time chat with your assigned researcher
                </li>
              </ul>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-3 relative z-10">
              <Link
                href="/hire-writer/new"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30"
              >
                Post Project Order
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/hire-writer"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20"
              >
                View Writing Services
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURED STUDY NOTES & LECTURE MATERIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary-600 text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              Top Rated Materials
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Popular Study Notes & Past Questions
            </h2>
          </div>
          <Link
            href="/notes"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 group"
          >
            Explore all materials
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Note Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.slice(0, 6).map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </section>

      {/* 4. HOW THE ESCROW & WRITING SYSTEM WORKS */}
      <section className="bg-slate-900 text-white py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Escrow Protection Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              How You Pay & Get Your Assignment Done Safely
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              We eliminate scams and low-quality submissions. Your money is never sent to the writer until you personally inspect and approve the completed work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700/80 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary-600/30">
                1
              </div>
              <h3 className="text-xl font-bold text-white">Post Guidelines & Fund Escrow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Specify your assignment topic, word count, academic level, and deadline. Pay via Paystack, Flutterwave, or Wallet. Your payment is safely locked in Escrow.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700/80 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/30">
                2
              </div>
              <h3 className="text-xl font-bold text-white">Writer Researches & Submits Draft</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A verified subject expert handles your paper. You can chat live with the writer, provide extra rubrics, and track real-time progress.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700/80 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-xl font-bold text-white">Review & Release Funds</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Review the completed draft and plagiarism report. Request unlimited free revisions or click "Approve" to release payment to the writer.
              </p>
            </div>

          </div>

          {/* Payment Gateways Bar */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Seamless Multi-Gateway Checkout</p>
                <p className="text-xs text-slate-400">Powered by Paystack & Flutterwave for African & Global bank cards.</p>
              </div>
            </div>
            <Link
              href="/hire-writer/new"
              className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-md transition-all shrink-0"
            >
              Post an Order Now
            </Link>
          </div>

        </div>
      </section>

      {/* 5. TOP VERIFIED WRITERS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              Academic Specialists
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Meet Our Verified Writers & Researchers
            </h2>
          </div>
          <Link
            href="/hire-writer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 group"
          >
            View all writers
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_WRITERS.map((writer) => (
            <div
              key={writer.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src={writer.avatar_url}
                    alt={writer.full_name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-100"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-base">{writer.full_name}</h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-500">{writer.department}</p>
                    <p className="text-[11px] font-medium text-slate-400">{writer.institution}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {writer.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {writer.writer_skills?.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs font-extrabold text-slate-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {writer.writer_rating} ({writer.total_reviews} reviews)
                  </div>
                  <p className="text-[10px] text-slate-400">{writer.total_completed_orders} projects completed</p>
                </div>

                <Link
                  href={`/hire-writer/new?writerId=${writer.id}`}
                  className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all border border-emerald-200"
                >
                  Hire Directly
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 text-white shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Upgrade Your Academic Performance?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Join thousands of undergraduate, masters, and college students sharing notes, solving past questions, and completing assignments without stress.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/notes"
              className="px-7 py-3.5 rounded-xl bg-white text-slate-900 font-extrabold text-sm hover:bg-slate-100 transition-all shadow-lg"
            >
              Browse Study Materials
            </Link>
            <Link
              href="/hire-writer/new"
              className="px-7 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-primary-600/40"
            >
              Hire an Assignment Writer
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
