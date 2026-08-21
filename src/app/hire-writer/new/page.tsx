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

// Academic Degree Levels & Fixed Pricing Matrix (PhD > MSc > BSc)
interface DegreeLevel {
  id: 'undergrad' | 'postgrad' | 'phd';
  name: string;
  shortLabel: string;
  badge: string;
  desc: string;
  pricing: {
    project: number;        // Complete Project / Thesis / Dissertation (Chapters 1-5)
    coursework: number;     // Assignment / Term Paper / Essay
    proposal: number;       // Research Proposal / Seminar Paper
    defense_slides: number; // Defense Slide Deck
    proofreading: number;   // Proofreading & Plagiarism Reduction
  };
}

const ACADEMIC_LEVELS: DegreeLevel[] = [
  {
    id: 'undergrad',
    name: 'Undergraduate (B.Sc / B.A / B.Tech / HND / OND)',
    shortLabel: 'B.Sc / Undergraduate',
    badge: 'Undergrad Tier',
    desc: '100L - 500L University & Polytechnic degree projects and coursework',
    pricing: {
      project: 25000,
      coursework: 7000,
      proposal: 12000,
      defense_slides: 6000,
      proofreading: 5000,
    },
  },
  {
    id: 'postgrad',
    name: 'Post-Graduate (Masters / M.Sc / MBA / M.Phil / PGD)',
    shortLabel: 'M.Sc / Masters',
    badge: 'Masters Tier',
    desc: 'Advanced post-graduate research, extensive literature review and empirical methodology',
    pricing: {
      project: 50000,
      coursework: 15000,
      proposal: 22000,
      defense_slides: 10000,
      proofreading: 9000,
    },
  },
  {
    id: 'phd',
    name: 'Doctorate / Ph.D / DBA / Professional Fellowship',
    shortLabel: 'Ph.D / Doctorate',
    badge: 'Ph.D Tier (Highest Rigor)',
    desc: 'Novel doctoral research frameworks, publication-standard dissertations and defense',
    pricing: {
      project: 100000,
      coursework: 28000,
      proposal: 40000,
      defense_slides: 16000,
      proofreading: 15000,
    },
  },
];

const SERVICE_TYPES = [
  {
    id: 'project',
    name: 'Complete Project / Thesis / Dissertation (Chapters 1–5)',
    desc: 'Full research work: Introduction, Literature Review, Methodology, Results & Discussion',
    icon: '📚',
  },
  {
    id: 'coursework',
    name: 'Assignment / Coursework / Term Paper',
    desc: 'Comprehensive academic essays, case studies, and structured course assignments',
    icon: '📝',
  },
  {
    id: 'proposal',
    name: 'Research Proposal / Seminar Paper',
    desc: 'Rigorous research concepts, chapter 1-3 synopses, and seminar presentations',
    icon: '🎓',
  },
  {
    id: 'defense_slides',
    name: 'PowerPoint Defense Presentation & Speaker Script',
    desc: 'Executive slide deck with visual charts, data graphs, and panel defense notes',
    icon: '📊',
  },
  {
    id: 'proofreading',
    name: 'Proofreading, Formatting & Turnitin Paraphrasing',
    desc: 'Grammar review, institutional style formatting, and similarity score reduction',
    icon: '✨',
  },
];

// Field Work & Extra Complexity Add-ons
const PROJECT_ADDONS = [
  {
    id: 'field_work',
    name: 'Field Work & Primary Survey Sampling',
    desc: 'Physical or online questionnaire administration, respondent sampling & field interviews',
    price: 15000,
    icon: '🌾',
  },
  {
    id: 'data_analysis',
    name: 'Advanced Statistical Data Analysis (SPSS, STATA, SmartPLS, R, Python)',
    desc: 'Hypothesis testing, regression models, ANOVA, reliability tests & descriptive tables',
    price: 12000,
    icon: '📈',
  },
  {
    id: 'lab_software',
    name: 'Laboratory Experiment / Software Prototype / Simulation',
    desc: 'Engineering prototypes, MATLAB / AutoCAD simulations, or custom software coding',
    price: 20000,
    icon: '🔬',
  },
  {
    id: 'turnitin_cert',
    name: 'Guaranteed Turnitin Originality Certificate (<10%)',
    desc: 'Official Turnitin scanner report with zero repository collision guarantee',
    price: 2500,
    icon: '🛡️',
  },
];

const URGENCY_OPTIONS = [
  { id: 'relaxed', name: '7+ Days (Standard)', multiplier: 1.0, badge: 'Standard (No Rush Fee)' },
  { id: 'normal', name: '3 - 6 Days (Moderate)', multiplier: 1.2, badge: '+20% Moderate Rush' },
  { id: 'urgent', name: '24 - 48 Hours (Urgent)', multiplier: 1.5, badge: '+50% Urgent Priority' },
  { id: 'emergency', name: '12 - 24 Hours (Emergency)', multiplier: 1.8, badge: '+80% Emergency Rush' },
];

const CITATION_STYLES = ['APA 7th', 'Harvard', 'IEEE', 'MLA 9th', 'Chicago', 'OSCOLA (Law)'];

function OrderWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get('service');
  const assignedWriterId = searchParams.get('writer_id');
  const { user, isLoggedIn } = useAuth();

  const [academicLevel, setAcademicLevel] = useState<'undergrad' | 'postgrad' | 'phd'>('undergrad');
  const [serviceType, setServiceType] = useState<string>(
    preselectedService === 'slides' ? 'defense_slides' : 'project'
  );
  
  // Selected Add-ons (Field work, data analysis, lab work, etc.)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [urgency, setUrgency] = useState('relaxed');
  const [citationStyle, setCitationStyle] = useState('APA 7th');

  // Form Fields
  const [title, setTitle] = useState('');
  const [subjectArea, setSubjectArea] = useState('');
  const [instructions, setInstructions] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Dynamic Price Calculations based on Degree Level & Add-ons
  const selectedLevelObj = ACADEMIC_LEVELS.find((l) => l.id === academicLevel) || ACADEMIC_LEVELS[0];
  const selectedServiceObj = SERVICE_TYPES.find((s) => s.id === serviceType) || SERVICE_TYPES[0];
  const selectedUrgencyObj = URGENCY_OPTIONS.find((u) => u.id === urgency) || URGENCY_OPTIONS[0];

  // Base fixed price for this degree level and project type
  const basePrice = selectedLevelObj.pricing[serviceType as keyof typeof selectedLevelObj.pricing] || selectedLevelObj.pricing.project;

  // Add-ons Total
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = PROJECT_ADDONS.find((a) => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const rawSubtotal = basePrice + addonsTotal;
  const totalBudget = Math.round(rawSubtotal * selectedUrgencyObj.multiplier);
  const urgencyFee = totalBudget - rawSubtotal;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => 
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      router.push('/login?redirect=/hire-writer/new');
      return;
    }

    try {
      const supabase = createClient();
      
      // Ensure user profile exists
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.full_name || user.email.split('@')[0],
        role: user.role || 'STUDENT',
        is_email_verified: true,
      }, { onConflict: 'id' });

      const { data: newOrder, error } = await supabase.from('orders').insert({
        client_id: user.id,
        writer_id: assignedWriterId || null,
        title: title.trim() || `${selectedServiceObj.name} (${selectedLevelObj.shortLabel})`,
        service_type: selectedServiceObj.name,
        subject_area: subjectArea.trim() || 'General Academic',
        academic_level: selectedLevelObj.name,
        pages_count: 1,
        word_count: serviceType === 'project' ? 12000 : 3500,
        deadline: new Date(Date.now() + (urgency === 'emergency' ? 1 : urgency === 'urgent' ? 2 : 7) * 24 * 60 * 60 * 1000).toISOString(),
        citation_style: citationStyle,
        instructions: `${instructions.trim() || 'Standard academic guidelines and research.'}\n\n[Required Add-ons]: ${selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None'}`,
        budget: totalBudget, // Estimated/Guide Budget
        escrow_status: 'UNPAID',
        status: 'OPEN',
      }).select().single();

      if (newOrder) {
        router.push(`/hire-writer/orders/${newOrder.id}`);
        return;
      }
    } catch (err) {
      console.error('Error creating order in Supabase:', err);
    }
    router.push('/dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Escrow Protected • Transparent Fixed Rates
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          Commission a Custom Academic Project
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Fixed project pricing based on academic degree (B.Sc, M.Sc, Ph.D). Funds stay safely in escrow until you approve the final deliverable.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Academic Degree Level Selection (PhD > MSc > BSc) */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                1. Select Academic Degree Level
              </label>
              <span className="text-[11px] font-bold text-emerald-700">
                {selectedLevelObj.shortLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ACADEMIC_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setAcademicLevel(lvl.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    academicLevel === lvl.id
                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {lvl.badge}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-2 leading-snug">{lvl.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{lvl.desc}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Project from:</span>
                    <span className="text-xs font-black text-emerald-800">
                      {formatCurrency(lvl.pricing.project)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Service & Project Type Selection */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              2. Select Academic Project Type
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICE_TYPES.map((srv) => {
                const srvPrice = selectedLevelObj.pricing[srv.id as keyof typeof selectedLevelObj.pricing] || selectedLevelObj.pricing.project;

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
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        {formatCurrency(srvPrice)}
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

          {/* 3. Field Work & Extra Complexity Add-ons */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                3. Field Work & Special Requirements (Add-ons)
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Check any special scopes that require extra resources, field sampling, or software modeling:
              </p>
            </div>

            <div className="space-y-2.5">
              {PROJECT_ADDONS.map((addon) => {
                const isSelected = selectedAddons.includes(addon.id);

                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{addon.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">{addon.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{addon.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black text-slate-900">
                        +{formatCurrency(addon.price)}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Formatting & Turnaround */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              4. Citation Format & Turnaround Time
            </label>

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

            {/* Urgency */}
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

          {/* 5. Project Details & Instructions */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              5. Project Details & Supervisor Rubric
            </label>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Project / Research Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Impact of Central Bank Digital Currency (eNaira) on Financial Inclusion in Nigeria"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Discipline / Academic Department</label>
              <input
                type="text"
                required
                value={subjectArea}
                onChange={(e) => setSubjectArea(e.target.value)}
                placeholder="e.g. Economics, Computer Science, Public Health, Mechanical Engineering..."
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
                placeholder="Specify chapter breakdowns, case study organizations, target survey locations, software versions..."
                className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-500"
              />
            </div>
          </div>

        </div>

        {/* Right Col: Live Escrow Invoice Summary */}
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

            {/* Price Breakdown */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="font-medium">Degree Level:</span>
                <span className="font-bold text-slate-900">{selectedLevelObj.shortLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Project Base Cost:</span>
                <span className="font-bold text-slate-900">{formatCurrency(basePrice)}</span>
              </div>

              {selectedAddons.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 block">Selected Add-ons:</span>
                  {selectedAddons.map((addonId) => {
                    const addon = PROJECT_ADDONS.find((a) => a.id === addonId);
                    if (!addon) return null;
                    return (
                      <div key={addon.id} className="flex justify-between text-[11px] text-emerald-800">
                        <span>• {addon.name}</span>
                        <span className="font-bold">+{formatCurrency(addon.price)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {urgencyFee > 0 && (
                <div className="flex justify-between text-amber-700 pt-1">
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
                <span>Escrow Milestone Protection:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                Payment is locked safely in StudyNoteHub Escrow. The researcher is only credited when you inspect the final research chapters and approve the Turnitin originality report.
              </p>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              Post Project for Writer Bids (Free to Post)
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
              <span>⚡ Verified PhD & Masters Bidders</span>
              <span>•</span>
              <span>🔒 Sealed Bidding Privacy</span>
            </div>

          </div>
        </div>

      </form>
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
