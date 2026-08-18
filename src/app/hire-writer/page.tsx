'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PenTool, 
  BookOpen, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  GraduationCap, 
  Clock, 
  DollarSign, 
  Sparkles,
  Presentation,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';
import { MOCK_WRITERS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

const SERVICES = [
  {
    icon: '📊',
    title: 'Slide Presentation & Defense Decks',
    desc: 'Professional PowerPoint / Google Slides with executive slide layouts, charts, and word-for-word speaker defense notes.',
    startingPrice: 1200,
    unit: 'slide',
    badge: 'Popular',
    href: '/hire-writer/new?service=slides',
  },
  {
    icon: '🎓',
    title: 'Final Year Capstone Projects & Theses',
    desc: 'Complete Chapter 1 to 5 project writing with rigorous methodology, literature reviews, and 100% Turnitin similarity certification.',
    startingPrice: 1950,
    unit: 'page',
    badge: 'High Demand',
    href: '/hire-writer/new?service=project',
  },
  {
    icon: '📈',
    title: 'Data Analysis & Empirical Statistics',
    desc: 'Multiple regression, ANOVA, econometric time-series models using SPSS, STATA, Python, R, and EViews.',
    startingPrice: 2500,
    unit: 'page',
    badge: 'Specialized',
    href: '/hire-writer/new?service=data_analysis',
  },
  {
    icon: '📝',
    title: 'Term Papers, Essays & Assignments',
    desc: 'Structured academic arguments in APA 7th, Harvard, IEEE, or OSCOLA citation formats. Zero plagiarism guaranteed.',
    startingPrice: 1500,
    unit: 'page',
    badge: '24hr Express',
    href: '/hire-writer/new?service=essay',
  },
  {
    icon: '✨',
    title: 'Proofreading & Turnitin Paraphrasing',
    desc: 'Grammar polish, style refinement, and rewriting to reduce similarity index below 10% on Turnitin.',
    startingPrice: 1050,
    unit: 'page',
    badge: 'Quick Turnaround',
    href: '/hire-writer/new?service=proofreading',
  },
  {
    icon: '📑',
    title: 'Dissertation Proposals & Synopses',
    desc: 'High-impact research concept notes, problem statements, and theoretical frameworks for Masters and PhD candidates.',
    startingPrice: 3500,
    unit: 'page',
    badge: 'Postgrad',
    href: '/hire-writer/new?service=thesis',
  },
];

export default function HireWriterPage() {
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Escrow Protection • Turnitin Certified
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Hire Verified Academic Writers, Analysts & Slide Designers
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Get your final year projects, SPSS data analysis, seminar papers, and defense presentation slides prepared by top university researchers. Your funds stay safe in Escrow until you approve the work.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/hire-writer/new"
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              Order Custom Project / Slides
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="#services"
              className="px-6 py-3.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-all"
            >
              Explore Services & Rates
            </Link>
          </div>
        </div>

        {/* Services Matrix with Slide Presentations */}
        <div id="services" className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Academic & Presentation Services</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear, transparent pricing calculated automatically with zero hidden charges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                      {service.icon}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Starting from</span>
                    <p className="text-base font-black text-emerald-700">
                      {formatCurrency(service.startingPrice)} <span className="text-xs font-normal text-slate-500">/ {service.unit}</span>
                    </p>
                  </div>

                  <Link
                    href={service.href}
                    className="p-2.5 rounded-xl bg-slate-900 group-hover:bg-emerald-600 text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Researchers Directory */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Featured Verified Researchers</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Top-rated PhD and Masters degree holders accredited through our 4-stage vetting engine
              </p>
            </div>
            <Link
              href="/hire-writer/new"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              Post a project for open writer bidding <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_WRITERS.map((writer) => (
              <div
                key={writer.id}
                className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={writer.avatar_url}
                    alt={writer.full_name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-100"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900">{writer.full_name}</h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-500">{writer.institution}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold">{writer.department}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {writer.bio}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {writer.writer_skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{writer.writer_rating}</span>
                    <span className="text-slate-400 font-normal">({writer.total_reviews})</span>
                  </div>

                  <Link
                    href={`/hire-writer/new`}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs transition-colors"
                  >
                    Hire Writer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
