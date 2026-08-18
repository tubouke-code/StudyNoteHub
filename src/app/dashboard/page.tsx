'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  PenTool, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ChevronRight, 
  UploadCloud,
  FileText,
  DollarSign,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_ORDERS, MOCK_DOCUMENTS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { WriterVerificationModal } from '@/components/writer/WriterVerificationModal';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'notes' | 'uploads'>('orders');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Active assignment orders placed by the student
  const studentOrders = MOCK_ORDERS.filter((o) => o.student_id === 'usr_student_01');

  // Purchased notes library
  const purchasedNotes = MOCK_DOCUMENTS.slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Student Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Welcome back, {user?.full_name || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track your active assignment projects, access purchased notes, and manage your wallet
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/hire-writer/new"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/20 transition-all"
            >
              <PenTool className="w-4 h-4" />
              Order New Assignment
            </Link>

            <Link
              href="/wallet"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              Fund Wallet
            </Link>
          </div>
        </div>

        {/* Upgrade to Verified Writer Callout Banner */}
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-800/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-3 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Earn Up to ₦150,000 / Month
            </span>
            <h2 className="text-lg sm:text-xl font-black">
              Want to write projects for other students?
            </h2>
            <p className="text-xs text-slate-300">
              Pay your one-time <strong>₦3,500 verification token</strong> to become an accredited academic writer and unlock high-paying assignment jobs!
            </p>
          </div>

          <button
            onClick={() => setShowVerificationModal(true)}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all shrink-0 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Get Verified for ₦3,500
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Wallet Balance</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {formatCurrency(user?.wallet_balance || 18500)}
            </p>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Instant note unlocks
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Active Orders</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {studentOrders.length}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Protected by Escrow
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Saved Notes</span>
              <BookOpen className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {purchasedNotes.length}
            </p>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Available offline
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {formatCurrency(63500)}
            </p>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Projects & Notes
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'orders'
                ? 'text-primary-700 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            My Writing Orders ({studentOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'notes'
                ? 'text-primary-700 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            My Downloaded Notes ({purchasedNotes.length})
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {studentOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-primary-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        order.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'IN_REVIEW'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {order.service_type}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {order.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span><strong>Assigned Writer:</strong> {order.writer?.full_name}</span>
                    <span>•</span>
                    <span><strong>Deadline:</strong> {formatDate(order.deadline)}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">
                      <strong>Escrow:</strong> {formatCurrency(order.budget)} HELD
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    href={`/hire-writer/orders/${order.id}`}
                    className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition-all flex items-center gap-1.5"
                  >
                    Open Workspace & Chat
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Notes Library */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchasedNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-50 text-primary-700">
                    {note.course_code}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{note.title}</h4>
                  <p className="text-xs text-slate-500">{note.institution} • {note.page_count} Pages</p>
                </div>

                <Link
                  href={`/notes/${note.id}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Read
                </Link>
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
