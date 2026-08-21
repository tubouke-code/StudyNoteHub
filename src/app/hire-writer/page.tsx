'use client';

import React, { useState, useEffect } from 'react';
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
  FileCheck,
  Loader2,
  UserCheck
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';

const SERVICES = [
  {
    icon: '📚',
    title: 'Undergraduate Final Year Projects (B.Sc / HND)',
    desc: 'Complete Chapters 1 to 5: Introduction, Literature Review, Methodology, Data Analysis & Discussion.',
    startingPrice: 25000,
    unit: 'project',
    badge: 'Undergraduate Base',
    href: '/hire-writer/new?service=project',
  },
  {
    icon: '🎓',
    title: 'Post-Graduate Theses & Dissertations (M.Sc / MBA)',
    desc: 'Advanced empirical methodology, extensive theoretical framework & literature review for Masters candidates.',
    startingPrice: 50000,
    unit: 'project',
    badge: 'Postgraduate (Masters)',
    href: '/hire-writer/new?service=project',
  },
  {
    icon: '🏛️',
    title: 'Doctoral Dissertations (Ph.D / DBA)',
    desc: 'Novel research frameworks, peer-review publication rigor, and comprehensive doctoral defense deliverables.',
    startingPrice: 100000,
    unit: 'project',
    badge: 'Ph.D Tier (Highest Rigor)',
    href: '/hire-writer/new?service=project',
  },
  {
    icon: '🌾',
    title: 'Field Work & Primary Survey Sampling',
    desc: 'Physical or digital questionnaire administration, respondent sampling & empirical survey gathering.',
    startingPrice: 15000,
    unit: 'add-on',
    badge: 'Field Sampling',
    href: '/hire-writer/new?service=project',
  },
  {
    icon: '📈',
    title: 'Empirical Data Analysis (SPSS, STATA, SmartPLS, R)',
    desc: 'Multiple regression, ANOVA, econometric time-series modeling, reliability tests & descriptive tables.',
    startingPrice: 12000,
    unit: 'add-on',
    badge: 'Specialized Analysis',
    href: '/hire-writer/new?service=project',
  },
  {
    icon: '📊',
    title: 'Defense Slide Decks & Panel Scripts',
    desc: 'Executive PowerPoint slides with clean data visualizations and word-for-word panel defense speaker notes.',
    startingPrice: 6000,
    unit: 'deck',
    badge: 'Defense Ready',
    href: '/hire-writer/new?service=slides',
  },
];

export default function HireWriterPage() {
  const [writers, setWriters] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadWriters() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or('role.eq.WRITER,is_verified_writer.eq.true')
          .order('writer_rating', { ascending: false });

        if (data) {
          setWriters(data as Profile[]);
        }
      } catch (err) {
        console.error('Error fetching writers:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadWriters();
  }, []);

  const filteredWriters = writers.filter((w) => {
    const name = w.full_name?.toLowerCase() || '';
    const dept = w.department?.toLowerCase() || '';
    const inst = w.institution?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || dept.includes(query) || inst.includes(query);
  });

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Escrow Protection • Turnitin Originality Certified</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            Hire Verified PhD & Masters Researchers for Custom Projects
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            From complete final year projects and SPSS data analysis to defense slide decks. Your payment is held safely in escrow until you approve the final deliverable.
          </p>

          <div className="pt-2">
            <Link
              href="/hire-writer/new"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <PenTool className="w-4 h-4" />
              Order Custom Academic Project
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SERVICES CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Choose Your Academic Service</h2>
          <p className="text-xs text-slate-500">Every order includes free Turnitin similarity check & unlimited revisions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((srv) => (
            <Link
              key={srv.title}
              href={srv.href}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-emerald-400 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                    {srv.icon}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {srv.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {srv.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Starting at</span>
                  <p className="text-sm font-black text-slate-900">
                    {formatCurrency(srv.startingPrice)} <span className="text-xs font-normal text-slate-400">/{srv.unit}</span>
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Order Now <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. VERIFIED RESEARCHERS DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Verified Academic Researchers</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Vetted researchers with verified credentials, high ratings, and Turnitin accreditation
            </p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by researcher or field..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500 bg-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Loading verified researchers...</span>
          </div>
        ) : filteredWriters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWriters.map((writer) => (
              <div
                key={writer.id}
                className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={writer.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt={writer.full_name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-100"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm">{writer.full_name}</h3>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500">{writer.department || 'Academic Researcher'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{writer.institution}</p>
                    </div>
                  </div>

                  {writer.bio && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {writer.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {Number(writer.writer_rating || 5.0).toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>{writer.total_completed_orders || 0} completed projects</span>
                  </div>
                </div>

                <Link
                  href={`/hire-writer/new?writer_id=${writer.id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-all shadow-xs"
                >
                  Hire {writer.full_name.split(' ')[0]}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Are You an Academic Researcher?</h3>
            <p className="text-xs text-slate-500">
              Apply to become an accredited writer on StudyNoteHub and earn on custom student projects with 100% escrow protection.
            </p>
            <Link
              href="/writer-dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              Apply to Write & Earn
            </Link>
          </div>
        )}
      </section>

    </div>
  );
}
