'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  PenTool, 
  Clock, 
  FileText, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  UploadCloud, 
  ChevronRight, 
  Calculator, 
  Info,
  Presentation,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { createClient } from '@/lib/supabase/client';

// Each service has its own distinct complexity multiplier
const SERVICE_TYPES = [
  { 
    id: 'essay', 
    name: 'Assignment / Essay / Term Paper', 
    desc: 'Standard academic coursework and essays',
    multiplier: 1.0, 
    icon: '📝' 
  },
  { 
    id: 'project', 
    name: 'Final Year Project (Chapters 1-5)', 
    desc: 'Full research methodology & literature review (+40%)',
    multiplier: 1.4, 
    icon: '📚' 
  },
  { 
    id: 'data_analysis', 
    name: 'Data Analysis (SPSS, STATA, Python, R)', 
    desc: 'Empirical data modeling, ANOVA & regressions (+80%)',
    multiplier: 1.8, 
    icon: '📈' 
  },
  { 
    id: 'slides', 
    name: 'PowerPoint Slide Presentation & Defense Deck', 
    desc: 'Executive slide design with charts',
    multiplier: 1.0, 
    icon: '📊', 
    isSlide: true 
  },
  { 
    id: 'thesis', 
    name: 'Thesis / Dissertation Proposal', 
    desc: 'Comprehensive research concept & synopses (+50%)',
    multiplier: 1.5, 
    icon: '🎓' 
  },
  { 
    id: 'proofreading', 
    name: 'Proofreading, Formatting & Turnitin Paraphrasing', 
    desc: 'Grammar review and plagiarism reduction (-40%)',
    multiplier: 0.6, 
    icon: '✨' 
  },
];

// Academic Level Base Rates
const ACADEMIC_LEVELS = [
  { id: 'undergrad', name: 'Undergraduate (100L - 500L)', rate: 1000 },
  { id: 'postgrad', name: 'Post-Graduate (Masters / MBA / M.Sc)', rate: 2000 },
  { id: 'phd', name: 'Doctorate / Ph.D / Professional', rate: 3000 },
];

const URGENCY_OPTIONS = [
  { id: 'relaxed', name: '7+ Days (Standard)', multiplier: 1.0, badge: 'Standard (No Rush Fee)' },
  { id: 'normal', name: '3 - 6 Days (Moderate)', multiplier: 1.2, badge: '+20% Moderate Rush' },
  { id: 'urgent', name: '24 - 48 Hours (Urgent)', multiplier: 1.6, badge: '+60% Urgent Priority' },
  { id: 'emergency', name: '12 Hours (Emergency Rush)', multiplier: 2.0, badge: '2x Emergency Rush' },
];

const CITATION_STYLES = ['APA 7th', 'Harvard', 'IEEE', 'MLA 9th', 'Chicago', 'OSCOLA (Law)'];

function OrderWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get('service');
  const assignedWriterId = searchParams.get('writer_id');
  const { user, isLoggedIn } = useAuth();

  const [serviceType, setServiceType] = useState(
    preselectedService === 'slides' ? 'slides' : 'project'
  );
  const [academicLevel, setAcademicLevel] = useState('undergrad');
  const [urgency, setUrgency] = useState('normal');
  const [pagesCount, setPagesCount] = useState(15);
  const [slidesCount, setSlidesCount] = useState(12);
  const [citationStyle, setCitationStyle] = useState('APA 7th');
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subjectArea, setSubjectArea] = useState('');
  const [instructions, setInstructions] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Dynamic Calculations based on chosen Service AND Academic Level
  const selectedServiceObj = SERVICE_TYPES.find((s) => s.id === serviceType) || SERVICE_TYPES[0];
  const selectedLevelObj = ACADEMIC_LEVELS.find((l) => l.id === academicLevel) || ACADEMIC_LEVELS[0];
  const selectedUrgencyObj = URGENCY_OPTIONS.find((u) => u.id === urgency) || URGENCY_OPTIONS[0];

  const isSlideService = selectedServiceObj.id === 'slides';
  const unitCount = isSlideService ? slidesCount : pagesCount;
  
  // Specific Rate per unit for this exact service and level
  const effectiveBaseRate = isSlideService 
    ? 1000 
    : Math.round(selectedLevelObj.rate * selectedServiceObj.multiplier);

  // Additional speaker notes add-on for slides (+₦300/slide)
  const speakerNotesFee = (isSlideService && includeSpeakerNotes) ? slidesCount * 300 : 0;

  // Base raw subtotal
  const rawSubtotal = (unitCount * effectiveBaseRate) + speakerNotesFee;

  // Urgency multiplier
  const totalBudget = Math.round(rawSubtotal * selectedUrgencyObj.multiplier);
  const urgencyFee = totalBudget - rawSubtotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login?redirect=/hire-writer/new');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    try {
      if (user) {
        const supabase = createClient();
        const { data: newOrder } = await supabase.from('orders').insert({
          client_id: user.id,
          writer_id: assignedWriterId || null,
          title: title || `${selectedServiceObj.name} Project`,
          service_type: selectedServiceObj.name,
          subject_area: subjectArea || 'General Academic',
          academic_level: selectedLevelObj.name,
          pages_count: unitCount,
          word_count: isSlideService ? 0 : unitCount * 275,
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          citation_style: citationStyle,
          instructions: instructions || 'Standard academic guidelines and research.',
          budget: totalBudget,
          escrow_status: 'HELD_IN_ESCROW',
          status: 'PENDING',
        }).select().single();

        if (newOrder) {
          router.push(`/hire-writer/orders/${newOrder.id}`);
          return;
        }
      }
    } catch (err) {
      console.error('Error creating order in Supabase:', err);
    }
    router.push('/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Escrow Protected Order
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          Commission a Custom Academic Project
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Transparent per-page & per-slide rates. Your money stays locked safely in escrow until you approve the Turnitin report.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Academic Service Selection */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                1. Select Academic Service
              </label>
              <span className="text-[11px] font-bold text-emerald-700">
                {isSlideService ? 'Slide-based' : 'Page-based'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICE_TYPES.map((srv) => {
                const serviceUnitRate = srv.isSlide 
                  ? 1000 
                  : Math.round(selectedLevelObj.rate * srv.multiplier);

                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setServiceType(srv.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      serviceType === srv.id
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-2xl">{srv.icon}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {formatCurrency(serviceUnitRate)}/{srv.isSlide ? 'slide' : 'pg'}
                      </span>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-xs font-bold leading-tight">{srv.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{srv.desc}</p>
                    </div>

                    {serviceType === srv.id && (
                      <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Academic Level & Base Rate */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              2. Academic Level
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ACADEMIC_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setAcademicLevel(lvl.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    academicLevel === lvl.id
                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold">{lvl.name}</p>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    {formatCurrency(lvl.rate)} <span className="text-[10px] font-normal text-slate-500">/ base pg</span>
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Project Volume & Settings */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              3. Project Scope & Specifications
            </label>

            {isSlideService ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Number of Slides</span>
                    <span className="text-sm font-black text-emerald-700">{slidesCount} Slides</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    value={slidesCount}
                    onChange={(e) => setSlidesCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>5 Slides (Short Pitch)</span>
                    <span>30 Slides (Full Defense)</span>
                    <span>60 Slides (Master Class)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">Include Defense Speaker Notes</span>
                    <span className="text-[11px] text-slate-500">Word-for-word presentation script for defense (+₦300/slide)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeSpeakerNotes}
                    onChange={(e) => setIncludeSpeakerNotes(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Page Count (~275 words/page)</span>
                  <span className="text-sm font-black text-emerald-700">{pagesCount} Pages (~{pagesCount * 275} words)</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={120}
                  value={pagesCount}
                  onChange={(e) => setPagesCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 Page (~275 words)</span>
                  <span>50 Pages (Full Project)</span>
                  <span>120 Pages (Dissertation)</span>
                </div>
              </div>
            )}

            {/* Citation Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Citation & Referencing Format</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CITATION_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setCitationStyle(style)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      citationStyle === style
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency / Turnaround Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Turnaround Time / Deadline</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {URGENCY_OPTIONS.map((urg) => (
                  <button
                    key={urg.id}
                    type="button"
                    onClick={() => setUrgency(urg.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      urgency === urg.id
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{urg.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{urg.badge}</p>
                    </div>
                    {urgency === urg.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Project Details & Instructions */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              4. Project Details & Research Rubric
            </label>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Project / Topic Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Econometric Analysis of Foreign Direct Investment on GDP Growth in Nigeria (2010 - 2024)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Discipline / Subject Field</label>
              <input
                type="text"
                required
                value={subjectArea}
                onChange={(e) => setSubjectArea(e.target.value)}
                placeholder="e.g. Economics, Computer Science, Commercial Law, Nursing..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Detailed Guidelines & Supervisor Requirements</label>
              <textarea
                rows={4}
                required
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="List required chapters, survey sample size, specific theoretical frameworks, or dataset links..."
                className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-500"
              />
            </div>
          </div>

        </div>

        {/* Right Col: Live Escrow Price Breakdown Card */}
        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-lg space-y-6 sticky top-24">
            
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Live Escrow Invoice
              </span>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {formatCurrency(totalBudget)}
              </p>
              <span className="text-xs text-slate-500">100% Refundable if deliverable is not approved</span>
            </div>

            {/* Service Breakdown */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="font-medium">Selected Service:</span>
                <span className="font-bold text-slate-900">{selectedServiceObj.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Unit Rate:</span>
                <span className="font-bold text-slate-900">{formatCurrency(effectiveBaseRate)}/{isSlideService ? 'slide' : 'page'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Volume:</span>
                <span className="font-bold text-slate-900">{unitCount} {isSlideService ? 'Slides' : 'Pages'}</span>
              </div>

              {isSlideService && includeSpeakerNotes && (
                <div className="flex justify-between text-emerald-700">
                  <span>Speaker Notes:</span>
                  <span className="font-bold">+{formatCurrency(speakerNotesFee)}</span>
                </div>
              )}

              {urgencyFee > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Rush Turnaround:</span>
                  <span className="font-bold">+{formatCurrency(urgencyFee)}</span>
                </div>
              )}

              <div className="flex justify-between text-emerald-600 font-bold pt-2 border-t border-slate-100">
                <span>Turnitin Originality Report:</span>
                <span>FREE (Included)</span>
              </div>
            </div>

            {/* Escrow Guarantee Box */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>How Escrow Protects You:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                Your payment is held safely by StudyNoteHub. The researcher is only paid when you review the draft and click approve.
              </p>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Deposit {formatCurrency(totalBudget)} & Lock Escrow
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
              <span>⚡ Instant Writer Match</span>
              <span>•</span>
              <span>🔒 Paystack & Flutterwave</span>
            </div>

          </div>
        </div>

      </form>

      {/* Checkout Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={title || 'Custom Assignment Order'}
        amount={totalBudget}
        itemType="ESCROW_FUNDING"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default function OrderWizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <OrderWizardContent />
    </Suspense>
  );
}
