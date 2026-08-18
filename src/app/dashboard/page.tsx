'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  PenTool, 
  Wallet, 
  UploadCloud, 
  Download, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Star, 
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { MOCK_CURRENT_USER, MOCK_ORDERS, MOCK_DOCUMENTS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'MY_NOTES' | 'DOWNLOADS'>('ORDERS');

  const myUploadedNotes = MOCK_DOCUMENTS.filter(d => d.uploader_id === MOCK_CURRENT_USER.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={MOCK_CURRENT_USER.avatar_url}
            alt={MOCK_CURRENT_USER.full_name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary-50"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Welcome back, {MOCK_CURRENT_USER.full_name}!
              </h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-700">
                {MOCK_CURRENT_USER.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {MOCK_CURRENT_USER.department} • {MOCK_CURRENT_USER.institution}
            </p>
          </div>
        </div>

        {/* Wallet Quick Widget */}
        <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Wallet Balance</span>
            <p className="text-lg font-black text-slate-900">{formatCurrency(MOCK_CURRENT_USER.wallet_balance)}</p>
          </div>
          <Link
            href="/wallet"
            className="ml-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Top-Up
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Active Orders</span>
          <p className="text-2xl font-black text-slate-900">{MOCK_ORDERS.length}</p>
          <span className="text-[11px] text-emerald-600 font-bold">In Escrow / In Progress</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Uploaded Notes</span>
          <p className="text-2xl font-black text-slate-900">{myUploadedNotes.length}</p>
          <span className="text-[11px] text-primary-600 font-bold">1,240 Total Downloads</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Notes Royalties Earned</span>
          <p className="text-2xl font-black text-emerald-600">₦0.00</p>
          <span className="text-[11px] text-slate-500 font-medium">Free notes published</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Academic Rating</span>
          <p className="text-2xl font-black text-amber-500 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400" /> 4.9
          </p>
          <span className="text-[11px] text-slate-500 font-medium">14 Verified Reviews</span>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ORDERS'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Assignment Orders ({MOCK_ORDERS.length})
          </button>
          <button
            onClick={() => setActiveTab('MY_NOTES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MY_NOTES'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            My Uploaded Notes ({myUploadedNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('DOWNLOADS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'DOWNLOADS'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Saved & Downloaded Materials
          </button>
        </div>

        {/* Tab Content 1: Orders */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Your Active Project Orders</h3>
              <Link
                href="/hire-writer/new"
                className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
              >
                + New Assignment Order
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_ORDERS.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-primary-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {order.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {order.escrow_status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{order.title}</h4>
                    <p className="text-xs text-slate-500">
                      Writer: <strong>{order.writer?.full_name || 'Finding matching expert...'}</strong> • Deadline: {formatDate(order.deadline)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">{formatCurrency(order.budget)}</span>
                      <span className="text-[10px] text-slate-400">{order.pages_count} Pages</span>
                    </div>
                    <Link
                      href={`/hire-writer/orders/${order.id}`}
                      className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                    >
                      Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 2: My Uploaded Notes */}
        {activeTab === 'MY_NOTES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Study Materials You Published</h3>
              <Link
                href="/notes/upload"
                className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
              >
                + Upload New Note
              </Link>
            </div>

            {myUploadedNotes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
                <UploadCloud className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">You haven't uploaded any study materials yet</p>
                <Link
                  href="/notes/upload"
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs inline-block"
                >
                  Upload & Start Earning
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myUploadedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{note.title}</h4>
                        <p className="text-xs text-slate-500">{note.course_code} • {note.downloads_count} downloads</p>
                      </div>
                    </div>
                    <Link
                      href={`/notes/${note.id}`}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Note
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Downloads */}
        {activeTab === 'DOWNLOADS' && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Download className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Your Downloaded Library</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All free and unlocked study materials remain accessible for lifetime offline re-download.
            </p>
            <Link
              href="/notes"
              className="px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs inline-block"
            >
              Browse More Study Notes
            </Link>
          </div>
        )}

      </div>

    </div>
  );
}
