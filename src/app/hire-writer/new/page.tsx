'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  PenTool, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  FileText, 
  DollarSign, 
  Layers, 
  Scale, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { MOCK_WRITERS, MOCK_CURRENT_USER } from '@/lib/mock-data';
import { PaymentModal } from '@/components/payments/PaymentModal';

function OrderWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWriterId = searchParams.get('writerId');
  const initialService = searchParams.get('service') || 'Coursework & Assignments';
  const initialTopic = searchParams.get('topic') || '';

  const [serviceType, setServiceType] = useState(initialService);
  const [academicLevel, setAcademicLevel] = useState('Undergraduate');
  const [title, setTitle] = useState(initialTopic);
  const [subjectArea, setSubjectArea] = useState('Economics & Finance');
  const [pagesCount, setPagesCount] = useState(5);
  const [citationStyle, setCitationStyle] = useState('APA 7th');
  const [deadlineDays, setDeadlineDays] = useState(5);
  const [instructions, setInstructions] = useState('');
  const [selectedWriterId, setSelectedWriterId] = useState(initialWriterId || '');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Dynamic Price Calculator
  const calculatedBudget = useMemo(() => {
    let ratePerPage = 2000;
    if (academicLevel === 'Post-Graduate (Masters)') ratePerPage = 3200;
    if (academicLevel === 'PhD') ratePerPage = 4500;
    if (serviceType.includes('Data Analysis')) ratePerPage = 3500;
    if (serviceType.includes('Project')) ratePerPage = 2500;

    let base = pagesCount * ratePerPage;

    // Urgency multiplier
    if (deadlineDays <= 2) base *= 1.4; // 40% rush fee
    else if (deadlineDays <= 3) base *= 1.2;

    return Math.round(base);
  }, [serviceType, academicLevel, pagesCount, deadlineDays]);

  const totalAmount = calculatedBudget;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !instructions) {
      alert('Please fill in the project title and instructions/guidelines.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = ({ reference, gateway }: { reference: string; gateway: string }) => {
    setIsPaymentModalOpen(false);
    router.push(`/hire-writer/orders/ord_101?new=true`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Milestone Escrow Protected
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Create Assignment or Project Order
        </h1>
        <p className="text-sm text-slate-600">
          Provide your assignment prompt and requirements. Your payment is safely held in Escrow until you review the completed paper.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form Wizard */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            
            {/* 1. Service Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500 bg-slate-50 focus:bg-white"
              >
                <option value="Coursework & Assignments">Coursework & Assignments</option>
                <option value="Final Year Capstone Projects">Final Year Capstone Project (Chapters 1 - 5)</option>
                <option value="Term Paper & Academic Essay">Term Paper / Critical Essay</option>
                <option value="SPSS / STATA Data Analysis">SPSS / STATA Empirical Data Analysis</option>
                <option value="Software / Coding Project">Software / Python / MATLAB Code Project</option>
                <option value="Master's Thesis / Dissertation">Master's Thesis / Dissertation</option>
              </select>
            </div>

            {/* 2. Topic / Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Assignment Topic / Research Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Econometric Evaluation of Mobile Money on Financial Inclusion in Nigeria"
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>

            {/* 3. Academic Level & Subject Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Academic Level</label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500 bg-white"
                >
                  <option value="High School / Diploma">High School / Diploma</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Post-Graduate (Masters)">Post-Graduate (Masters)</option>
                  <option value="PhD">PhD / Doctorate</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Subject Area</label>
                <input
                  type="text"
                  value={subjectArea}
                  onChange={(e) => setSubjectArea(e.target.value)}
                  placeholder="e.g. Economics, Law, Engineering"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* 4. Pages & Citation Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Number of Pages (~{pagesCount * 275} words)
                </label>
                <input
                  type="number"
                  min={1}
                  max={150}
                  value={pagesCount}
                  onChange={(e) => setPagesCount(Math.max(1, Number(e.target.value)))}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Citation Style</label>
                <select
                  value={citationStyle}
                  onChange={(e) => setCitationStyle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500 bg-white"
                >
                  <option value="APA 7th">APA 7th Edition</option>
                  <option value="Harvard">Harvard Referencing</option>
                  <option value="MLA 9th">MLA 9th Edition</option>
                  <option value="IEEE">IEEE (Engineering & CS)</option>
                  <option value="OSCOLA">OSCOLA (Law)</option>
                  <option value="Chicago / Turabian">Chicago / Turabian</option>
                </select>
              </div>
            </div>

            {/* 5. Deadline & Urgency */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Turnaround Time / Deadline</span>
                <span className="text-primary-600 font-extrabold">{deadlineDays} Days</span>
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="w-full accent-primary-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Urgent (24h - 48h)</span>
                <span>Standard (5-7 Days)</span>
                <span>Extended (14 - 30 Days)</span>
              </div>
            </div>

            {/* 6. Detailed Guidelines / Rubric */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Detailed Instructions & Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Include specific lecturer instructions, required case studies, statistical datasets, grading rubric or outline..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>

            {/* 7. Rubric File Attachment Dropzone */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2">
              <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                Attach Course Guidelines / Rubric PDF (Optional)
              </p>
              <input type="file" className="text-xs text-slate-400" />
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Proceed to Escrow Deposit ({formatCurrency(totalAmount)})
            <ArrowRight className="w-5 h-5" />
          </button>

        </form>

        {/* Right Col: Price Summary & Escrow Protection Widget */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 sticky top-24">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order Price Breakdown
              </span>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span>{pagesCount} Pages × Rate</span>
                <span className="font-semibold text-slate-900">{formatCurrency(calculatedBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span>Academic Level</span>
                <span className="font-semibold text-slate-900">{academicLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>Turnaround Time</span>
                <span className="font-semibold text-slate-900">{deadlineDays} Days</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Turnitin Plagiarism Report</span>
                <span>FREE</span>
              </div>
            </div>

            {/* Escrow Guarantee Highlight */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                How Escrow Protects You
              </div>
              <p className="text-[11px] leading-relaxed">
                Your <strong>{formatCurrency(totalAmount)}</strong> will be locked in the secure Escrow vault. The writer only receives payout after you confirm the submission meets all requirements.
              </p>
            </div>

            {/* Accepted Gateways */}
            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p className="font-semibold text-slate-500">Pay Safely With:</p>
              <p>Paystack • Flutterwave • In-App Wallet</p>
            </div>

          </div>

        </div>

      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Fund Escrow for "${title || 'Assignment Order'}"`}
        amount={totalAmount}
        itemType="ESCROW_FUNDING"
        onSuccess={handlePaymentSuccess}
      />

    </div>
  );
}

export default function NewOrderWizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <OrderWizardContent />
    </Suspense>
  );
}
