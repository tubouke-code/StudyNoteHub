'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PenTool, 
  Wallet, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  Sparkles,
  Send,
  Building2
} from 'lucide-react';
import { MOCK_WRITERS, MOCK_ORDERS, MOCK_DOCUMENTS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function WriterDashboardPage() {
  const currentWriter = MOCK_WRITERS[0]; // Dr. Emeka Okafor
  const [activeTab, setActiveTab] = useState<'ASSIGNED' | 'AVAILABLE_JOBS' | 'ROYALTIES'>('ASSIGNED');

  // Orders assigned to this writer
  const myAssignedOrders = MOCK_ORDERS.filter(o => o.writer_id === currentWriter.id);
  // Orders open for bidding / taking
  const openOrders = MOCK_ORDERS.filter(o => o.status === 'OPEN');
  // Notes uploaded by writer
  const myNotes = MOCK_DOCUMENTS.filter(d => d.uploader_id === currentWriter.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-emerald-900/40">
        <div className="flex items-center gap-4">
          <img
            src={currentWriter.avatar_url}
            alt={currentWriter.full_name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{currentWriter.full_name}</h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                Verified Writer
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentWriter.department} • {currentWriter.institution}
            </p>
          </div>
        </div>

        {/* Writer Earnings & Withdraw Button */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-300">Available Earnings</span>
            <p className="text-lg font-black text-white">{formatCurrency(currentWriter.wallet_balance)}</p>
          </div>
          <Link
            href="/wallet"
            className="ml-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-xs"
          >
            Withdraw
          </Link>
        </div>
      </div>

      {/* Writer Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Active Writing Projects</span>
          <p className="text-2xl font-black text-slate-900">{myAssignedOrders.length}</p>
          <span className="text-[11px] text-emerald-600 font-bold">All Backed in Escrow</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Completed Projects</span>
          <p className="text-2xl font-black text-primary-600">{currentWriter.total_completed_orders}</p>
          <span className="text-[11px] text-slate-500 font-medium">100% On-Time Delivery</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Note Royalty Sales</span>
          <p className="text-2xl font-black text-emerald-600">₦452,000.00</p>
          <span className="text-[11px] text-emerald-700 font-medium">85% creator cut</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Writer Rating</span>
          <p className="text-2xl font-black text-amber-500 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400" /> {currentWriter.writer_rating}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">{currentWriter.total_reviews} verified reviews</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('ASSIGNED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ASSIGNED'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            My Active Orders ({myAssignedOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('AVAILABLE_JOBS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'AVAILABLE_JOBS'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Available Jobs to Accept ({openOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('ROYALTIES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ROYALTIES'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Published Notes & Royalties ({myNotes.length})
          </button>
        </div>

        {/* Tab 1: Assigned Projects */}
        {activeTab === 'ASSIGNED' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Projects Currently in Progress</h3>

            <div className="space-y-3">
              {myAssignedOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {order.id}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        ESCROW: {formatCurrency(order.budget * 0.85)} (Net Payout)
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{order.title}</h4>
                    <p className="text-xs text-slate-500">
                      Client: <strong>{order.student?.full_name}</strong> • Deadline: {formatDate(order.deadline)} • {order.citation_style}
                    </p>
                  </div>

                  <Link
                    href={`/hire-writer/orders/${order.id}`}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 self-end sm:self-center"
                  >
                    Open Workspace & Submit Draft <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Available Jobs to Accept */}
        {activeTab === 'AVAILABLE_JOBS' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Open Academic Writing Requests</h3>

            <div className="space-y-3">
              {openOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {order.service_type}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{order.academic_level}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{order.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{order.instructions}</p>
                    <p className="text-[11px] text-slate-400">Length: {order.pages_count} Pages • Deadline: {formatDate(order.deadline)}</p>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-3">
                    <div>
                      <span className="text-base font-black text-emerald-600 block">{formatCurrency(order.budget * 0.85)}</span>
                      <span className="text-[10px] text-slate-400">Writer Earning</span>
                    </div>
                    <button
                      onClick={() => alert(`You have accepted Order #${order.id}! Funds are locked in Escrow.`)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    >
                      Accept Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Published Notes */}
        {activeTab === 'ROYALTIES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Study Materials You Monetize</h3>
              <Link
                href="/notes/upload"
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                + Upload Another Note
              </Link>
            </div>

            <div className="space-y-3">
              {myNotes.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.title}</h4>
                      <p className="text-xs text-slate-500">{doc.course_code} • {doc.downloads_count} downloads • Price: {formatCurrency(doc.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600 block">
                      {formatCurrency(doc.downloads_count * doc.price * 0.85)}
                    </span>
                    <span className="text-[10px] text-slate-400">Total Earned</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
