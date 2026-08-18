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

const SERVICE_TYPES = [
  { id: 'essay', name: 'Assignment / Essay / Term Paper', multiplier: 1.0, icon: '📝' },
  { id: 'project', name: 'Final Year Project (Chapters 1-5)', multiplier: 1.3, icon: '📚' },
  { id: 'slides', name: 'PowerPoint Slide Presentation & Defense Deck', multiplier: 0.9, icon: '📊', isSlide: true },
  { id: 'data_analysis', name: 'Data Analysis (SPSS, STATA, Python, R)', multiplier: 1.5, icon: '📈' },
  { id: 'thesis', name: 'Thesis / Dissertation & Proposal', multiplier: 1.4, icon: '🎓' },
  { id: 'proofreading', name: 'Editing, Proofreading & Turnitin Paraphrasing', multiplier: 0.7, icon: '✨' },
];

const ACADEMIC_LEVELS = [
  { id: 'undergrad', name: 'Undergraduate (100L - 500L)', rate: 1000 },
  { id: 'postgrad', name: 'Post-Graduate (Masters / MBA / M.Sc)', rate: 2000 },
  { id: 'phd', name: 'Doctorate / Ph.D / Professional', rate: 3000 },
];

const URGENCY_OPTIONS = [
  { id: 'relaxed', name: '7+ Days (Standard)', multiplier: 1.0, badge: 'No Rush Fee' },
  { id: 'normal', name: '3 - 6 Days (Moderate)', multiplier: 1.2, badge: '+20% Rush' },
  { id: 'urgent', name: '24 - 48 Hours (Urgent)', multiplier: 1.6, badge: '+60% Priority' },
  { id: 'emergency', name: '12 Hours (Emergency Rush)', multiplier: 2.0, badge: '2x Rush' },
];

const CITATION_STYLES = ['APA 7th', 'Harvard', 'IEEE', 'MLA 9th', 'Chicago', 'OSCOLA (Law)'];

function OrderWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get('service');
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

  // Dynamic Price Calculations
  const selectedServiceObj = SERVICE_TYPES.find((s) => s.id === serviceType) || SERVICE_TYPES[0];
  const selectedLevelObj = ACADEMIC_LEVELS.find((l) => l.id === academicLevel) || ACADEMIC_LEVELS[0];
  const selectedUrgencyObj = URGENCY_OPTIONS.find((u) => u.id === urgency) || URGENCY_OPTIONS[0];

  const isSlideService = selectedServiceObj.id === 'slides';
  const unitCount = isSlideService ? slidesCount : pagesCount;
  
  // Base cost calculation with updated rates: 1k (undergrad), 2k (postgrad), 3k (phd)
  const baseRate = isSlideService ? 1000 : selectedLevelObj.rate;
  const rawCost = unitCount * baseRate * selectedServiceObj.multiplier;
  const speakerNotesFee = isSlideService && includeSpeakerNotes ? slidesCount * 300 : 0;
  
  const subtotalBeforeRush = rawCost + speakerNotesFee;
  const totalBudget = Math.round(subtotalBeforeRush * selectedUrgencyObj.multiplier);
  
  // Escrow & Commission Breakdown (15% Platform Commission)
  const platformFee = Math.round(totalBudget * 0.15);
  const writerEarnings = totalBudget - platformFee;

  const handleProceedToEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push(`/login?redirect=/hire-writer/new`);
      return;
    }
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Escrow Protected Order
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Order Custom Academic Work or Slide Deck
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Funds remain safely locked in Escrow. Zero risk — writer is only paid after you review and approve the Turnitin report.
          </p>
        </div>

        <form onSubmit={handleProceedToEscrow} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Wizard Configuration */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Service Type */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                1. Select Academic Service Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SERVICE_TYPES.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setServiceType(service.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      serviceType === service.id
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{service.icon}</span>
                      <span className="text-xs font-bold leading-snug">{service.name}</span>
                    </div>
                    {serviceType === service.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Academic Level & Scope (Pages / Slides) */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                2. Academic Level & Rates
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {ACADEMIC_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setAcademicLevel(level.id)}
                    className={`p-3.5 rounded-2xl border-2 text-center transition-all ${
                      academicLevel === level.id
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 text-xs'
                    }`}
                  >
                    <span className="block text-xs font-black">{level.name.split('(')[0]}</span>
                    <span className="text-sm font-black text-emerald-700 block mt-0.5">{formatCurrency(level.rate)}<span className="text-[10px] font-normal text-slate-500"> / pg</span></span>
                  </button>
                ))}
              </div>

              {/* Slider: Page Count or Slide Count */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700">
                    {isSlideService ? 'Number of Slides (PowerPoint):' : 'Number of Pages (Double-Spaced):'}
                  </span>
                  <span className="text-base font-black text-emerald-700">
                    {isSlideService ? `${slidesCount} Slides` : `${pagesCount} Pages (~${pagesCount * 275} words)`}
                  </span>
                </div>
                <input
                  type="range"
                  min={isSlideService ? 5 : 1}
                  max={isSlideService ? 50 : 100}
                  value={isSlideService ? slidesCount : pagesCount}
                  onChange={(e) => isSlideService ? setSlidesCount(Number(e.target.value)) : setPagesCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Slide Extra: Speaker Notes Toggle */}
              {isSlideService && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Include Speaker Defense Notes</p>
                    <p className="text-[11px] text-slate-500">Includes word-for-word presentation speech in slide notes (+₦300/slide)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeSpeakerNotes}
                    onChange={(e) => setIncludeSpeakerNotes(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Step 3: Urgency & Citation Style */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                3. Deadline & Formatting Format
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {URGENCY_OPTIONS.map((urg) => (
                  <button
                    key={urg.id}
                    type="button"
                    onClick={() => setUrgency(urg.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      urgency === urg.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 text-xs'
                    }`}
                  >
                    <span className="block text-xs font-bold leading-tight">{urg.name.split('(')[0]}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">{urg.badge}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Citation Style</label>
                  <select
                    value={citationStyle}
                    onChange={(e) => setCitationStyle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
                  >
                    {CITATION_STYLES.map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subject / Department</label>
                  <input
                    type="text"
                    required
                    value={subjectArea}
                    onChange={(e) => setSubjectArea(e.target.value)}
                    placeholder="e.g. Economics, Law, Nursing, CompSci"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Topic & Instructions */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                4. Project Topic & Specific Guidelines
              </label>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Project / Topic Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Comparative Analysis of Corporate Law in Nigeria and the UK"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Detailed Instructions & Rubric</label>
                <textarea
                  rows={4}
                  required
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe chapters needed, software requirements (e.g. SPSS version), case studies, or specific dataset..."
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-500"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Live Service Charge Breakdown Card */}
          <div className="space-y-6">
            
            <div className="sticky top-24 p-6 bg-white rounded-3xl border-2 border-emerald-600/30 shadow-xl space-y-6">
              
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                  Escrow Price Breakdown
                </span>
                <h3 className="text-lg font-black text-slate-900">Total Project Cost</h3>
                <p className="text-3xl font-black text-emerald-700 mt-1">
                  {formatCurrency(totalBudget)}
                </p>
                <span className="text-[11px] text-slate-400">100% Refund Guarantee if criteria are unmet</span>
              </div>

              {/* Line Item Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Service Type:</span>
                  <span className="font-bold text-slate-900">{selectedServiceObj.name.split('(')[0]}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Academic Level:</span>
                  <span className="font-bold text-slate-900">{selectedLevelObj.name.split('(')[0]}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Scope:</span>
                  <span className="font-bold text-slate-900">
                    {isSlideService ? `${slidesCount} Slides` : `${pagesCount} Pages`}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Base Rate:</span>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(baseRate)} / {isSlideService ? 'slide' : 'page'}
                  </span>
                </div>

                {isSlideService && includeSpeakerNotes && (
                  <div className="flex justify-between text-slate-600">
                    <span>Speaker Notes (+₦300/slide):</span>
                    <span className="font-medium text-emerald-700">+{formatCurrency(speakerNotesFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Deadline Multiplier:</span>
                  <span className="font-bold text-slate-900">{selectedUrgencyObj.badge}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-600">
                  <span>Turnitin Originality Check:</span>
                  <span className="font-bold text-emerald-600">FREE (Included)</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Turnitin AI Detection:</span>
                  <span className="font-bold text-emerald-600">FREE (Included)</span>
                </div>
              </div>

              {/* Trust Transparency Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>How Escrow Protects You:</span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  Your <strong>{formatCurrency(totalBudget)}</strong> is safely held by StudyNoteHub. The writer receives their 85% cut (<strong>{formatCurrency(writerEarnings)}</strong>) only after you inspect and accept the final deliverable.
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

      </div>

      {/* Checkout Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        documentTitle={title || 'Custom Assignment Order'}
        amount={totalBudget}
        onSuccess={() => {
          setShowPaymentModal(false);
          router.push('/dashboard');
        }}
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
