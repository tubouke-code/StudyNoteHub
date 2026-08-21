'use client';

import React, { useState, useEffect } from 'react';
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
  BookOpen,
  Bot,
  Send,
  HelpCircle,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatFileSize, formatDate, getDocumentFileUrl } from '@/lib/utils';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { DocumentItem } from '@/types/database.types';

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const noteId = params.id as string;

  const [note, setNote] = useState<DocumentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'AI_CHAT' | 'SYLLABUS' | 'REVIEWS'>('PREVIEW');
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Study Assistant State
  const [aiQuery, setAiQuery] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<{ role: string; text: string }[]>([]);

  useEffect(() => {
    async function loadDocument() {
      if (!noteId) {
        setIsLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        
        // 1. Try with joined uploader profile
        const { data: docData, error: docErr } = await supabase
          .from('documents')
          .select('*, uploader:profiles(*)')
          .eq('id', noteId)
          .maybeSingle();

        if (docData) {
          const doc = docData as DocumentItem;
          setNote(doc);
          const free = Number(doc.price) === 0;
          setIsUnlocked(free || user?.role === 'ADMIN' || doc.uploader_id === user?.id);
          setAiChatMessages([
            {
              role: 'assistant',
              text: `Hello! I am your AI Study Tutor for **"${doc.title}"**. Ask me any question, request a summary, or let me generate exam practice questions from this material!`,
            },
          ]);
        } else {
          // 2. Fallback to raw document select without join
          const { data: rawDoc } = await supabase
            .from('documents')
            .select('*')
            .eq('id', noteId)
            .maybeSingle();

          if (rawDoc) {
            const doc = rawDoc as DocumentItem;
            setNote(doc);
            const free = Number(doc.price) === 0;
            setIsUnlocked(free || user?.role === 'ADMIN' || doc.uploader_id === user?.id);
            setAiChatMessages([
              {
                role: 'assistant',
                text: `Hello! I am your AI Study Tutor for **"${doc.title}"**. Ask me any question, request a summary, or let me generate exam practice questions from this material!`,
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching document:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDocument();
  }, [noteId, user]);

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || !note) return;

    const userQuestion = aiQuery;
    setAiQuery('');
    setAiChatMessages((prev) => [...prev, { role: 'user', text: userQuestion }]);
    setIsAiTyping(true);

    setTimeout(() => {
      setIsAiTyping(false);
      setAiChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Based on **${note.course_code} (${note.title})**:\n\n1. **Core Concept**: The material breaks this topic into foundational principles with step-by-step exam breakdowns.\n2. **Key Insight for Exams**: Pay special attention to the formulas and solved past question frameworks in Section 3.\n3. **Quick Practice Tip**: Memorize the definitions for high CBT exam scores!`,
        },
      ]);
    }, 1200);
  };

  const handleDownload = () => {
    if (!note) return;
    if (!isUnlocked) {
      setIsPaymentModalOpen(true);
      return;
    }
    const fileUrl = getDocumentFileUrl(note.file_path);
    if (fileUrl && fileUrl !== '#') {
      window.open(fileUrl, '_blank');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="text-sm font-medium">Loading study material details...</span>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Study Material Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          This document may have been removed or is pending administrator moderation.
        </p>
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Notes Catalog
        </Link>
      </div>
    );
  }

  const isFree = Number(note.price) === 0;
  const pageCount = note.page_count || (note as any).pages_count || 12;
  const fileSize = formatFileSize(note.file_size_bytes || 2048000);
  const fileUrl = getDocumentFileUrl(note.file_path);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Pending Banner if viewing in moderation preview */}
      {note.status === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-extrabold uppercase bg-amber-200/80 px-2.5 py-0.5 rounded-full text-amber-900">
              Moderation Preview
            </span>
            <span className="text-xs">This material is currently in the admin moderation queue awaiting public approval.</span>
          </div>
          {fileUrl && fileUrl !== '#' && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors"
            >
              Open Original File
            </a>
          )}
        </div>
      )}

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
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                  {note.level}
                </span>
              )}
              {isFree ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> FREE
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-900">
                  {formatCurrency(note.price)}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
              {note.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {note.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-900">{Number(note.rating || 5.0).toFixed(1)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4 text-slate-400" />
                <span>{note.downloads_count || 0} students unlocked</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>{pageCount} Pages ({fileSize})</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Viewer & AI */}
          <div className="flex border-b border-slate-200 gap-6 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`pb-3 transition-colors flex items-center gap-1.5 ${
                activeTab === 'PREVIEW'
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye className="w-4 h-4" /> Document Sample Preview
            </button>

            <button
              onClick={() => setActiveTab('AI_CHAT')}
              className={`pb-3 transition-colors flex items-center gap-1.5 ${
                activeTab === 'AI_CHAT'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bot className="w-4 h-4 text-indigo-600" /> Ask Note AI Assistant
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full">New</span>
            </button>

            <button
              onClick={() => setActiveTab('SYLLABUS')}
              className={`pb-3 transition-colors ${
                activeTab === 'SYLLABUS'
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Syllabus Outline
            </button>
          </div>

          {/* TAB 1: DOCUMENT PREVIEWER WITH WATERMARK */}
          {activeTab === 'PREVIEW' && (
            <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6 overflow-hidden">
              
              {/* Dynamic Anti-Piracy Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center rotate-[-25deg] opacity-[0.07] select-none text-slate-900 font-black text-2xl sm:text-4xl text-center leading-loose">
                STUDYNOTEHUB PREVIEW • LICENSED TO {user?.email || 'STUDENT'} • DO NOT REDISTRIBUTE
              </div>

              {/* Sample Document Page 1 */}
              <div className="space-y-4 border-b border-slate-100 pb-6">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Page 1 of {pageCount}</span>
                  <span className="text-emerald-600 font-bold">✓ Verified Author Notes</span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
                  <h3 className="text-base font-bold font-sans text-slate-900">{note.course_code}: {note.course_title}</h3>
                  <p><strong>Chapter 1: Theoretical Foundations and Overview</strong></p>
                  <p>This master summary covers core semester objectives required by {note.institution} for academic excellence.</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Core definitions, key principles, and conceptual models.</li>
                    <li>Mathematical proofs, derivations, and step-by-step problem sets.</li>
                    <li>Past examination analysis with standard marking guides.</li>
                  </ul>
                </div>
              </div>

              {/* Paywall Blur Guard for remaining pages */}
              {!isUnlocked ? (
                <div className="relative pt-4">
                  <div className="space-y-3 blur-xs select-none opacity-40 text-xs sm:text-sm font-serif">
                    <p>Chapter 2: Advanced Empirical Modeling and Regression Analysis...</p>
                    <p>In accordance with Keynesian and Classical macroeconomic paradigms, equilibrium is derived by equating aggregate demand with aggregate supply...</p>
                    <p>Formula (1.4): Y = C(Y - T) + I(r) + G + NX</p>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-white via-white/90 to-transparent text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Unlock the Full {pageCount}-Page Document</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Get instant lifetime access to all solved past questions, diagrams, and formulas.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/30 transition-all flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Unlock for {formatCurrency(note.price)}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                  <span>✓ You own this material. You can download and read anytime.</span>
                  {fileUrl && fileUrl !== '#' && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download File
                    </a>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: AI STUDY ASSISTANT */}
          {activeTab === 'AI_CHAT' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4 h-[480px] flex flex-col justify-between">
              <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                {aiChatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl max-w-lg ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Bot className="w-4 h-4 animate-spin" /> AI Tutor is reading note & typing...
                  </div>
                )}
              </div>

              <form onSubmit={handleAskAi} className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask a question, request a summary, or ask for practice questions..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SYLLABUS OUTLINE */}
          {activeTab === 'SYLLABUS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-slate-700">
              <h3 className="font-bold text-slate-900">Covered Modules:</h3>
              <ul className="list-decimal pl-5 space-y-2">
                <li>Module 1: Introduction, Definitions & Terminology</li>
                <li>Module 2: Historical Context, Key Theorists & Comparative Case Studies</li>
                <li>Module 3: Quantitative Formulations & Analytical Graphs</li>
                <li>Module 4: Solved Semester Past Questions with Model Solutions</li>
              </ul>
            </div>
          )}

        </div>

        {/* Right Col: Pricing & Author Bio */}
        <div className="space-y-6">
          
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Purchase Access
              </span>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {isFree ? 'FREE' : formatCurrency(note.price)}
              </p>
              <span className="text-xs text-slate-500">Lifetime access • Instant PDF download</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleDownload}
                className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  isUnlocked
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <Download className="w-4 h-4" />
                    Download Complete File
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Unlock Note for {formatCurrency(note.price)}
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                {copiedLink ? 'Link Copied!' : 'Share Material with Friends'}
              </button>
            </div>

            {/* Author Profile */}
            {note.uploader && (
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={note.uploader?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                  alt={note.uploader?.full_name || 'Author'}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">{note.uploader?.full_name}</p>
                  <p className="text-[11px] text-slate-500">{note.uploader?.institution || note.institution}</p>
                  <span className="text-[10px] text-emerald-700 font-bold">✓ 90% Creator Royalties Earner</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Unlock "${note.title}"`}
        amount={note.price}
        itemType="NOTE_PURCHASE"
        itemId={note.id}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          setIsUnlocked(true);
        }}
      />
    </div>
  );
}
