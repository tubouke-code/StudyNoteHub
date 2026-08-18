'use client';

import React from 'react';
import Link from 'next/link';
import { 
  PenTool, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Star, 
  ArrowRight, 
  FileCheck, 
  BarChart3, 
  Code, 
  BookOpenCheck,
  Scale
} from 'lucide-react';
import { MOCK_WRITERS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

export default function HireWriterOverviewPage() {
  const serviceTypes = [
    {
      title: 'Coursework & Assignments',
      desc: 'Weekly problem sets, case study briefs, lab writeups, and essay responses formatted in APA/MLA/Harvard.',
      priceStarting: '₦8,000',
      icon: FileCheck,
      badge: '24h - 48h Turnaround',
    },
    {
      title: 'Final Year Capstone Projects',
      desc: 'Complete Chapters 1 to 5, questionnaire formulation, literature review, and implementation guides.',
      priceStarting: '₦45,000',
      icon: BookOpenCheck,
      badge: 'Comprehensive',
    },
    {
      title: 'SPSS & Data Analysis',
      desc: 'Descriptive statistics, Multiple Regression, ANOVA, Chi-Square, STATA, Python/R and results interpretation.',
      priceStarting: '₦20,000',
      icon: BarChart3,
      badge: 'High Precision',
    },
    {
      title: 'Software & Code Projects',
      desc: 'Web apps, Python machine learning models, MATLAB simulations, IoT Arduino prototypes with clean documentation.',
      priceStarting: '₦35,000',
      icon: Code,
      badge: 'Code + Documentation',
    },
    {
      title: 'Master\'s Thesis & Dissertation',
      desc: 'In-depth empirical research, theoretical framework analysis, and defense slide preparation.',
      priceStarting: '₦80,000',
      icon: Scale,
      badge: 'PhD/Postgrad Level',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* 1. Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            100% Escrow Protected Academic Writing Service
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Pay Verified Experts to Write Your <span className="text-emerald-400">Assignments & Projects</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Stuck with challenging deadlines or complex research? Submit your prompt and rubrics. Your funds stay locked in Escrow and are only released when you approve the completed draft.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/hire-writer/new"
              className="px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
            >
              Post an Assignment Order
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-4 text-xs">
          <p className="font-bold text-white uppercase tracking-wider text-[11px] text-emerald-300">
            StudyNoteHub Escrow Guarantees:
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero upfront payment to writers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Turnitin Plagiarism Report Included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Unlimited Revisions until satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Refund if deadline missed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Service Catalog */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Custom Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Academic Writing Services Offered
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceTypes.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.title}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {svc.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{svc.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{svc.desc}</p>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Starting from</span>
                    <span className="text-sm font-extrabold text-slate-900">{svc.priceStarting}</span>
                  </div>
                  <Link
                    href={`/hire-writer/new?service=${encodeURIComponent(svc.title)}`}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Verified Writers Directory */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Verified Researchers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Featured Academic Writers Ready to Work
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_WRITERS.map((writer) => (
            <div
              key={writer.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={writer.avatar_url}
                    alt={writer.full_name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-100"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                      {writer.full_name}
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </h3>
                    <p className="text-xs text-slate-500">{writer.department}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {writer.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {writer.writer_skills?.map((sk) => (
                    <span key={sk} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {writer.writer_rating} ({writer.total_completed_orders} orders)
                </div>
                <Link
                  href={`/hire-writer/new?writerId=${writer.id}`}
                  className="px-4 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all"
                >
                  Hire Directly
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
