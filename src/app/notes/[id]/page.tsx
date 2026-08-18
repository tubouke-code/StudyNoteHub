'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  Download, 
  Star, 
  Share2, 
  ShieldCheck, 
  Eye, 
  Lock, 
  School, 
  ArrowLeft, 
  CheckCircle, 
  User, 
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { MOCK_DOCUMENTS, MOCK_CURRENT_USER } from '@/lib/mock-data';
import { formatCurrency, formatFileSize, formatDate } from '@/lib/utils';
import { PaymentModal } from '@/components/payments/PaymentModal';

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const note = MOCK_DOCUMENTS.find((d) => d.id === noteId) || MOCK_DOCUMENTS[0];
  const isFree = Number(note.price) === 0;

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(isFree);
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'SYLLABUS' | 'REVIEWS'>('PREVIEW');

  const handleDownload = () => {
    if (!isUnlocked) {
      setIsPaymentModalOpen(true);
      return;
    }
    alert(`Downloading "${note.title}" (${formatFileSize(note.file_size_bytes)})... File delivered!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Materials
      </button>

      {/* Note Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Main Info & Interactive Previewer */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-primary-50 text-primary-700 border border-primary-100">
                {note.course_code}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                {note.institution}
              </span>
              {note.level && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800">
                  {note.level} Level
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {note.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {note.description}
            </p>

            {/* Author bar */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <img
                src={note.uploader?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                alt={note.uploader?.full_name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-100"
              />
              <div>
                <p className="font-bold text-slate-900">{note.uploader?.full_name}</p>
                <p className="text-[11px] text-slate-400">Uploaded {formatDate(note.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Interactive Document Viewer / Preview Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('PREVIEW')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'PREVIEW' ? 'bg-white text-primary-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Document Preview ({note.page_count} Pages)
                </button>
                <button
                  onClick={() => setActiveTab('REVIEWS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'REVIEWS' ? 'bg-white text-primary-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Student Reviews (★ {note.rating})
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                PDF • {formatFileSize(note.file_size_bytes)}
              </span>
            </div>

            {/* Reader Container */}
            <div className="p-6 sm:p-8 min-h-[420px] bg-slate-100/60 flex flex-col items-center justify-center relative">
              
              {/* Document Pages Container */}
              <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6 text-slate-800 text-sm relative">
                
                {/* Page Header */}
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center text-xs text-slate-400">
                  <span className="font-bold text-slate-700">{note.course_code}: {note.course_title || 'Lecture Summary'}</span>
                  <span>Page 1 of {note.page_count}</span>
                </div>

                {/* Sample Lecture Text Content */}
                <div className="space-y-4 font-serif leading-relaxed text-slate-700">
                  <h3 className="font-bold text-base text-slate-900 font-sans">
                    Module 1: Foundational Frameworks & Definitions
                  </h3>
                  <p>
                    In this lecture module, we review the fundamental equilibrium conditions that govern macro-systems and empirical modeling methodologies.
                  </p>
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                    Key Equation: Y = C(Y - T) + I(r) + G + NX
                  </p>
                  <p>
                    When evaluating comparative static changes in exogenous variables, it is crucial to account for transmission mechanisms and inflation elasticity coefficients.
                  </p>
                </div>

                {/* Watermark / Blur overlay for locked documents */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white rounded-2xl flex flex-col items-center justify-end p-8 text-center backdrop-blur-[2px]">
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-full mb-3">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      Preview Restricted to First Pages
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
                      Unlock the complete {note.page_count}-page verified study document and solutions manual.
                    </p>
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md"
                    >
                      Unlock Full Document ({formatCurrency(note.price)})
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right Col: Purchase / Download Action Card */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 sticky top-24">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Access Tier
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {isFree ? 'FREE' : formatCurrency(note.price)}
                </span>
                {!isFree && (
                  <span className="text-xs text-slate-400">One-time payment</span>
                )}
              </div>
            </div>

            {/* Feature checklist */}
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Full {note.page_count}-page high-resolution PDF file</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified by departmental peer reviewers</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Lifetime download & offline access</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Printable with clean margins & solved past exams</span>
              </li>
            </ul>

            {/* Action Button */}
            <button
              onClick={handleDownload}
              className={`w-full py-4 rounded-2xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                isUnlocked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30'
              }`}
            >
              {isUnlocked ? (
                <>
                  <Download className="w-4 h-4" />
                  Download Complete PDF ({formatFileSize(note.file_size_bytes)})
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay & Download ({formatCurrency(note.price)})
                </>
              )}
            </button>

            {/* Guarantee */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure Checkout with Paystack, Flutterwave & Wallet
            </div>

            {/* Need Project / Assignment Assistance CTA */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-800 mb-1">Need a custom paper or project?</p>
              <p className="text-[11px] text-slate-500 mb-3">Hire a verified academic writer to handle this topic with 100% Escrow safety.</p>
              <Link
                href={`/hire-writer/new?topic=${encodeURIComponent(note.title)}`}
                className="w-full block text-center py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-xs border border-primary-200 transition-colors"
              >
                Hire Writer for this Course
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Purchase "${note.title}"`}
        amount={note.price}
        itemType="NOTE_PURCHASE"
        itemId={note.id}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          setIsUnlocked(true);
          alert('Payment confirmed! Your full document is now unlocked for download.');
        }}
      />

    </div>
  );
}
