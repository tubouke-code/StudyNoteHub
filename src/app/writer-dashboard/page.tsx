'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PenTool, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  BookOpen, 
  UploadCloud, 
  Sparkles,
  FileText,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Lock,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_ORDERS, MOCK_DOCUMENTS, MOCK_WRITERS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { WriterVerificationModal } from '@/components/writer/WriterVerificationModal';

export default function WriterDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'assigned' | 'open_jobs' | 'notes'>('open_jobs');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Check if user is a verified writer or admin
  const isVerified = user?.role === 'WRITER' || user?.role === 'ADMIN' || user?.is_verified_writer;

  // Filter assigned projects for the current writer
  const assignedOrders = MOCK_ORDERS.filter(
    (o) => o.writer_id === 'usr_writer_01' || o.writer?.email === user?.email
  );

  // Open jobs available for bidding
  const openJobs = [
    {
      id: 'job_open_01',
      title: 'Implementation of Machine Learning Model for Credit Card Fraud Detection',
      subject: 'Computer Science & AI',
      level: 'Undergraduate (Final Year)',
      pages: 25,
      words: 6500,
      deadline: '2025-03-08T18:00:00Z',
      budget: 45000.00,
      bids_count: 3,
      urgent: true,
    },
    {
      id: 'job_open_02',
      title: 'Critique of Corporate Governance & Shareholder Rights under CAMA 2020',
      subject: 'Commercial Law',
      level: 'Post-Graduate (LLM)',
      pages: 15,
      words: 4000,
      deadline: '2025-03-12T23:59:00Z',
      budget: 30000.00,
      bids_count: 1,
      urgent: false,
    },
    {
      id: 'job_open_03',
      title: 'Time Series ARIMA & GARCH Forecasting on Naira-USD Exchange Volatility',
      subject: 'Financial Economics / STATA',
      level: 'Masters / M.Sc',
      pages: 20,
      words: 5000,
      deadline: '2025-03-04T12:00:00Z',
      budget: 40000.00,
      bids_count: 5,
      urgent: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Writer & Creator Hub
              </h1>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Writer
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <Lock className="w-3.5 h-3.5" /> Accreditation Pending
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Bid on high-paying academic assignments, manage project deliverables, and track note royalties
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notes/upload"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Study Note (85% Cut)
            </Link>
          </div>
        </div>

        {/* If user is NOT yet verified: Display Locked Accreditation Banner */}
        {!isVerified && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-800/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                <GraduationCap className="w-4 h-4" /> Academic Writer Accreditation
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Pay a small token (₦3,500) to start taking jobs & earning!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                To guarantee 100% academic quality and protect students, all writers pay a one-time accreditation token. Once verified, you can immediately bid on projects worth ₦15,000 to ₦80,000+!
              </p>
            </div>

            <button
              onClick={() => setShowVerificationModal(true)}
              className="px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 transition-all shrink-0 flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              Pay ₦3,500 Token & Get Verified
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Earned</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {formatCurrency(isVerified ? 145000 : 0)}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              +₦35,000 pending in escrow
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {isVerified ? assignedOrders.length : 0}
            </p>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              In progress / review
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Note Royalties</span>
              <TrendingUp className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {formatCurrency(isVerified ? 28500 : 0)}
            </p>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              342 downloads this month
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Quality Score</span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">4.98 ★</p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Top 1% Rated Tutor
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('open_jobs')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'open_jobs'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Available Writing Jobs ({openJobs.length})
          </button>

          <button
            onClick={() => setActiveTab('assigned')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'assigned'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            My In-Progress Projects ({assignedOrders.length})
          </button>
        </div>

        {/* Tab 1: Available Open Jobs */}
        {activeTab === 'open_jobs' && (
          <div className="space-y-4">
            {openJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {job.urgent && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
                        Urgent Deadline
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {job.subject}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {job.level}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span><strong>Pages:</strong> {job.pages} (~{job.words.toLocaleString()} words)</span>
                    <span>•</span>
                    <span><strong>Deadline:</strong> {formatDate(job.deadline)}</span>
                    <span>•</span>
                    <span><strong>Proposals:</strong> {job.bids_count} writers applied</span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block md:text-right">
                      Client Escrow Budget
                    </span>
                    <p className="text-xl font-black text-emerald-700">
                      {formatCurrency(job.budget)}
                    </p>
                  </div>

                  {isVerified ? (
                    <button
                      onClick={() => alert(`Bid submitted for ${job.title}! Client will be notified.`)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                    >
                      Submit Proposal
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowVerificationModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" /> Unlock to Bid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Assigned Projects */}
        {activeTab === 'assigned' && (
          <div className="space-y-4">
            {assignedOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {order.status}
                    </span>
                    <span className="text-xs text-slate-400">Order ID: #{order.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{order.title}</h3>
                  <p className="text-xs text-slate-500">
                    Client: {order.student?.full_name} • Due {formatDate(order.deadline)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Locked in Escrow</span>
                    <p className="text-lg font-black text-emerald-700">{formatCurrency(order.budget)}</p>
                  </div>
                  <Link
                    href={`/hire-writer/orders/${order.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    Open Workspace & Submit Draft
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Writer Verification Token Modal */}
      <WriterVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => setShowVerificationModal(false)}
      />
    </div>
  );
}
