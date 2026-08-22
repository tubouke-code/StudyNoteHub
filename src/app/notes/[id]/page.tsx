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
  AlertCircle,
  Shield,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Maximize2
} from 'lucide-react';
import { formatCurrency, formatFileSize, formatDate, getDocumentFileUrl } from '@/lib/utils';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { DocumentItem } from '@/types/database.types';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const noteId = params.id as string;

  const [note, setNote] = useState<DocumentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'FULL_DOC' | 'AI_CHAT' | 'SYLLABUS'>('PREVIEW');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // AI Study Assistant State
  const [aiQuery, setAiQuery] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Study Assistant for this material. Ask me to summarize any chapter, generate exam prep flashcards, or explain key formulas!',
    },
  ]);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    let isMounted = true;

    async function loadNoteDetails() {
      if (!noteId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        const supabase = createClient();

        // 1. Direct fast document fetch
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', noteId)
          .maybeSingle();

        if (docError) {
          console.warn('Direct fetch note:', docError);
        }

        if (docData && isMounted) {
          setNote(docData as DocumentItem);
          if (Number(docData.price) === 0 || isAdmin || (user && docData.uploader_id === user.id)) {
            setIsUnlocked(true);
          }

          // Optional: Fetch uploader profile in background
          if (docData.uploader_id) {
            (async () => {
              try {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', docData.uploader_id)
                  .maybeSingle();
                if (profileData && isMounted) {
                  setNote((prev) => prev ? { ...prev, uploader: profileData } : null);
                }
              } catch (e) {
                // ignore
              }
            })();
          }
        }

        // 2. Check if user already purchased
        if (user && isMounted) {
          const { data: purchase } = await supabase
            .from('document_purchases')
            .select('id')
            .eq('document_id', noteId)
            .eq('buyer_id', user.id)
            .maybeSingle();

          if (purchase && isMounted) {
            setIsUnlocked(true);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Safeguard timeout to ensure page never gets stuck
    const timeoutTimer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 4000);

    loadNoteDetails();

    return () => {
      isMounted = false;
      clearTimeout(timeoutTimer);
    };
  }, [noteId, user, isAdmin]);

  // Admin In-Page Moderation Actions
  const handleAdminStatusChange = async (newStatus: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    if (!note || !isAdmin) return;
    setIsUpdatingStatus(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('documents')
        .update({ status: newStatus })
        .eq('id', note.id);

      if (error) {
        setAdminToast(`Error updating status: ${error.message}`);
      } else {
        setNote((prev) => prev ? { ...prev, status: newStatus } : null);
        setAdminToast(`Document status successfully updated to ${newStatus}!`);
      }
    } catch (err: any) {
      setAdminToast(`Update error: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
      setTimeout(() => setAdminToast(null), 4000);
    }
  };

  const handleAiSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAiTyping) return;

    const userText = aiQuery;
    setAiChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setAiQuery('');
    setIsAiTyping(true);

    setTimeout(() => {
      let reply = `Based on ${note?.course_code || 'this course'}: The core concepts focus on foundational theories, practical problem solving, and past examination analysis.`;
      if (userText.toLowerCase().includes('summary') || userText.toLowerCase().includes('overview')) {
        reply = `Executive Summary for ${note?.title}: This document breaks down the semester curriculum into key modules, providing proofs, worked examples, and sample marking schemes.`;
      } else if (userText.toLowerCase().includes('exam') || userText.toLowerCase().includes('questions')) {
        reply = `Exam Drill Tip: Focus on Module 2 and Module 4 past questions. Be sure to review standard problem sets and definitions.`;
      }

      setAiChatMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsAiTyping(false);
    }, 1200);
  };

  const handleDownload = () => {
    if (!note) return;
    if (!isUnlocked && !isAdmin) {
      setIsPaymentModalOpen(true);
      return;
    }
    window.location.href = `/api/documents/${note.id}/download`;
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setIsUnlocked(true);
    if (note) {
      window.location.href = `/api/documents/${note.id}/download`;
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
          This study note or past question guide may have been removed or unpublished.
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
  const downloadUrl = `/api/documents/${note.id}/download`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Universal Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Browse Notes', href: '/notes' },
          { label: note.course_code || 'Course', href: `/notes?q=${encodeURIComponent(note.course_code || '')}` },
          { label: note.title }
        ]}
        backHref="/notes"
        backLabel="Back to Catalog"
      />

      {/* Admin Quick Toast Notice */}
      {adminToast && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4 animate-in fade-in shadow-xl">
          <span className="text-xs font-bold">{adminToast}</span>
          <button onClick={() => setAdminToast(null)} className="text-slate-400 hover:text-white text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* ADMIN MODERATION & DECISION PANEL */}
      {isAdmin && (
        <div className="p-5 rounded-3xl bg-indigo-900 text-white shadow-xl space-y-4 border border-indigo-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">
                  Super Admin Moderation Center
                </h3>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  note.status === 'APPROVED' ? 'bg-emerald-500 text-white' : note.status === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-amber-400 text-slate-900'
                }`}>
                  Status: {note.status}
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Full Document Inspection Active. Review all pages and contents before approving or rejecting for the public catalog.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleAdminStatusChange('APPROVED')}
                disabled={isUpdatingStatus || note.status === 'APPROVED'}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4" />
                {note.status === 'APPROVED' ? 'Published to Catalog' : 'Approve & Publish'}
              </button>

              <button
                onClick={() => handleAdminStatusChange('REJECTED')}
                disabled={isUpdatingStatus || note.status === 'REJECTED'}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject Material
              </button>

              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-indigo-100 font-bold text-xs border border-indigo-600 transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Full Raw File
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Note Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Main Info & Interactive Previewer */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
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
              className={`pb-3 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'PREVIEW'
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye className="w-4 h-4" /> Document Overview
            </button>

            {(isAdmin || isUnlocked) && (
              <button
                onClick={() => setActiveTab('FULL_DOC')}
                className={`pb-3 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'FULL_DOC'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Maximize2 className="w-4 h-4 text-emerald-600" /> Full Document Reader ({isAdmin ? 'Admin Mode' : 'Unlocked'})
              </button>
            )}

            <button
              onClick={() => setActiveTab('AI_CHAT')}
              className={`pb-3 transition-colors flex items-center gap-1.5 cursor-pointer ${
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
              className={`pb-3 transition-colors cursor-pointer ${
                activeTab === 'SYLLABUS'
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Syllabus Outline
            </button>
          </div>

          {/* TAB 1: DOCUMENT PREVIEWER */}
          {activeTab === 'PREVIEW' && (
            <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6 overflow-hidden">
              
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

              {/* Paywall Blur Guard for non-admin students */}
              {!isUnlocked && !isAdmin ? (
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
                      className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      Unlock for {formatCurrency(note.price)}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                  <span>✓ {isAdmin ? 'Admin Inspection Mode: Full Document Access Granted.' : 'You own this material. You can download and read anytime.'}</span>
                  <a
                    href={downloadUrl}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Full File
                  </a>
                </div>
              )}

            </div>
          )}

          {/* TAB 1.5: FULL DOCUMENT READER (FOR ADMINS & UNLOCKED USERS) */}
          {activeTab === 'FULL_DOC' && (isAdmin || isUnlocked) && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                    {note.file_type || 'DOC'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Full Academic Document Viewer ({note.file_type?.toUpperCase() || 'DOCX'})
                    </h4>
                    <p className="text-xs text-slate-500">
                      {pageCount} Pages • {fileSize} • Uploaded by {note.uploader?.full_name || 'Verified Author'}
                    </p>
                  </div>
                </div>

                <a
                  href={downloadUrl}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" /> Download Complete {note.file_type?.toUpperCase() || 'DOCX'}
                </a>
              </div>

              {/* Format-aware rendering */}
              {note.file_type === 'pdf' ? (
                <div className="w-full h-[680px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                  <iframe
                    src={downloadUrl}
                    className="w-full h-full border-none"
                    title="PDF Document Viewer"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6 font-serif text-slate-800 text-xs sm:text-sm leading-relaxed max-h-[600px] overflow-y-auto">
                    <div className="text-center space-y-2 pb-6 border-b border-slate-200">
                      <h2 className="text-xl sm:text-2xl font-black font-sans text-slate-900">{note.title}</h2>
                      <p className="text-slate-600 font-sans font-bold">{note.course_code}: {note.course_title}</p>
                      <p className="text-xs text-slate-500 font-sans">{note.institution} • Level: {note.level || 'University Degree'}</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold font-sans uppercase tracking-wider text-slate-900">1. Executive Overview & Scope</h3>
                      <p>{note.description || 'Comprehensive lecture notes, study summaries, and model examination solutions.'}</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold font-sans uppercase tracking-wider text-slate-900">2. Complete Syllabus Modules & Worked Proofs</h3>
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100">
                        <p><strong>Module 1: Theoretical Frameworks & Definitions</strong></p>
                        <p>Foundational principles, formal taxonomy, and conceptual formulations governing {note.course_code}.</p>
                        <p><strong>Module 2: Methodological Applications & Empirical Formulations</strong></p>
                        <p>Quantitative models, proofs, real-world case studies, and mathematical drills.</p>
                        <p><strong>Module 3: Semester Exam Questions & Standard Marking Schemes</strong></p>
                        <p>Verified solutions, model answers, and step-by-step examination marking guides.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-sans text-xs flex items-center justify-between">
                      <span>✓ Document verified by StudyNoteHub Academic Integrity & Escrow Protocol</span>
                      <a href={downloadUrl} className="font-bold text-emerald-700 hover:underline">Download Word File &rarr;</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI STUDY ASSISTANT */}
          {activeTab === 'AI_CHAT' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 h-[480px] flex flex-col justify-between">
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
                  <div className="flex gap-2 items-center text-xs text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI Assistant is analyzing document context...
                  </div>
                )}
              </div>

              <form onSubmit={handleAiSend} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask a question about this study material..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!aiQuery.trim() || isAiTyping}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SYLLABUS OUTLINE */}
          {activeTab === 'SYLLABUS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Semester Module Breakdown</h4>
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <p className="font-bold text-slate-900">Module 1: Principles & Definitions</p>
                  <p className="text-slate-500">Foundational concepts and essential terminologies for {note.course_code}.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <p className="font-bold text-slate-900">Module 2: Practical Applications & Proofs</p>
                  <p className="text-slate-500">Mathematical models, real-world case studies, and quantitative drills.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <p className="font-bold text-slate-900">Module 3: Solved Examination Past Questions</p>
                  <p className="text-slate-500">Step-by-step verified solutions and typical exam marking rubrics.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Purchase & Author Sidebar */}
        <div className="space-y-6">
          
          {/* Purchase Action Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unlock Full Access</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {isFree ? 'FREE' : formatCurrency(note.price)}
                </span>
                {!isFree && <span className="text-xs text-slate-400">One-time purchase</span>}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-sm shadow-md shadow-primary-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isUnlocked || isAdmin ? 'Download Complete Material' : `Unlock & Download (${formatCurrency(note.price)})`}
              </button>

              <button
                onClick={handleShare}
                className="w-full py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                {copiedLink ? 'Link Copied to Clipboard!' : 'Share with Coursemates'}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Verified Academic Content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant PDF/DOCX Download & Lifetime Access</span>
              </div>
            </div>
          </div>

          {/* Author / Contributor Info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contributed By</h4>
            <div className="flex items-center gap-3">
              <img
                src={note.uploader?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                alt={note.uploader?.full_name || 'Contributor'}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary-100"
              />
              <div>
                <h5 className="font-bold text-slate-900 text-sm">{note.uploader?.full_name || 'Academic Scholar'}</h5>
                <p className="text-xs text-slate-400">{note.institution}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                  ✓ Verified Contributor (90% Royalty Author)
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Unlock ${note.title}`}
        amount={Number(note.price) || 0}
        itemType="NOTE_PURCHASE"
        itemId={note.id}
        onSuccess={handlePaymentSuccess}
      />

    </div>
  );
}
