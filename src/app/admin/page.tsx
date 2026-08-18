'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  Scale, 
  FileCheck, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  ArrowRight,
  Search,
  UserPlus,
  Lock,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';
import { MOCK_ADMINS, MOCK_ORDERS, MOCK_DOCUMENTS, MOCK_PAYOUT_REQUESTS, MOCK_WRITERS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AdminPermission, AdminUser } from '@/types/database.types';

export default function AdminDashboardPage() {
  const [admins, setAdmins] = useState<AdminUser[]>(MOCK_ADMINS);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser>(MOCK_ADMINS[0]);
  const [activeTab, setActiveTab] = useState<'DISPUTES' | 'MODERATION' | 'PAYOUTS' | 'TEAM' | 'ANALYTICS'>('DISPUTES');

  // Dispute state
  const [disputedOrders, setDisputedOrders] = useState(MOCK_ORDERS.filter(o => o.status === 'DISPUTED'));
  
  // Note moderation state
  const [pendingNotes, setPendingNotes] = useState(MOCK_DOCUMENTS.filter(d => d.status === 'PENDING'));
  
  // Payout state
  const [payouts, setPayouts] = useState(MOCK_PAYOUT_REQUESTS);

  // Invite admin modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminPermission>('DISPUTE_MANAGER');

  // Actions
  const handleResolveDispute = (orderId: string, resolution: 'WRITER' | 'STUDENT' | 'SPLIT') => {
    const actionText = 
      resolution === 'WRITER' ? 'Release 100% Escrow to Writer' :
      resolution === 'STUDENT' ? 'Refund 100% Escrow to Student' : 'Split Escrow 50/50';

    if (window.confirm(`Confirm dispute resolution: "${actionText}" for order #${orderId}?`)) {
      setDisputedOrders(prev => prev.filter(o => o.id !== orderId));
      alert(`Dispute for #${orderId} resolved by ${currentAdmin.full_name}. Resolution: ${actionText}.`);
    }
  };

  const handleApproveNote = (docId: string) => {
    setPendingNotes(prev => prev.filter(d => d.id !== docId));
    alert(`Study note approved and published to the public catalog.`);
  };

  const handleRejectNote = (docId: string) => {
    const reason = window.prompt('Enter rejection reason for the uploader:');
    if (reason) {
      setPendingNotes(prev => prev.filter(d => d.id !== docId));
      alert(`Study note rejected. Reason sent to uploader.`);
    }
  };

  const handleProcessPayout = (payoutId: string, writerName: string, amount: number) => {
    if (window.confirm(`Confirm that ${formatCurrency(amount)} has been transferred to ${writerName}?`)) {
      setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'PROCESSED' } : p));
      alert(`Payout of ${formatCurrency(amount)} marked as PROCESSED.`);
    }
  };

  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const newAdmin: AdminUser = {
      id: `adm_${Date.now()}`,
      full_name: newAdminName,
      email: newAdminEmail,
      permission: newAdminRole,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      last_login: 'Just invited',
      is_active: true,
    };
    setAdmins([...admins, newAdmin]);
    setIsInviteModalOpen(false);
    setNewAdminName('');
    setNewAdminEmail('');
    alert(`New Admin ${newAdminName} invited with ${newAdminRole} permissions!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header & Role Switcher */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-primary-500/20 text-primary-300 border border-primary-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary-400" />
              Multi-Admin Control Center
            </span>
            <span className="text-xs text-slate-400 font-mono">v1.0.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            StudyNoteHub Administration Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Dispute mediation, escrow vault settlement, note content approvals, and financial audits.
          </p>
        </div>

        {/* Current Active Admin Identity Switcher (Demonstrating Multi-Admin) */}
        <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Logged in as:</span>
            <span className="text-[10px] font-bold uppercase text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
              {currentAdmin.permission}
            </span>
          </div>
          <select
            value={currentAdmin.id}
            onChange={(e) => {
              const selected = admins.find(a => a.id === e.target.value);
              if (selected) setCurrentAdmin(selected);
            }}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl p-2.5 outline-none focus:border-primary-500"
          >
            {admins.map((adm) => (
              <option key={adm.id} value={adm.id}>
                {adm.full_name} ({adm.permission})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Platform KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Total Escrow Vault</span>
          <p className="text-2xl font-black text-emerald-600">₦125,000.00</p>
          <span className="text-[11px] text-emerald-700 font-bold">100% Backed in Escrow</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Platform Fees Earned</span>
          <p className="text-2xl font-black text-primary-600">₦18,750.00</p>
          <span className="text-[11px] text-slate-500 font-medium">15% Commission rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Pending Disputes</span>
          <p className="text-2xl font-black text-amber-500">{disputedOrders.length}</p>
          <span className="text-[11px] text-amber-600 font-bold">Requires Mediation</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Pending Note Approvals</span>
          <p className="text-2xl font-black text-slate-900">{pendingNotes.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">Content Moderation</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('DISPUTES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'DISPUTES'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              Dispute Resolution ({disputedOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('MODERATION')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'MODERATION'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Note Moderation ({pendingNotes.length})
            </button>

            <button
              onClick={() => setActiveTab('PAYOUTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'PAYOUTS'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Writer Payouts ({payouts.filter(p => p.status === 'PENDING').length})
            </button>

            <button
              onClick={() => setActiveTab('TEAM')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'TEAM'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Admin Team ({admins.length})
            </button>
          </div>

          {activeTab === 'TEAM' && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite New Admin
            </button>
          )}
        </div>

        {/* TAB 1: DISPUTE RESOLUTION CENTER */}
        {activeTab === 'DISPUTES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Escrow Dispute Mediation Queue</h3>
              <span className="text-xs text-slate-500">Admins with DISPUTE_MANAGER permission can rule</span>
            </div>

            {disputedOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">All Escrow Disputes Resolved!</h4>
                <p className="text-xs text-slate-500">No active disputes requiring administrative arbitration.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-md space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-black font-mono">
                            Order #{order.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                            ESCROW LOCKED: {formatCurrency(order.budget)}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900">{order.title}</h4>
                      </div>

                      <div className="text-xs text-slate-500">
                        <p>Student: <strong>{order.student?.full_name}</strong></p>
                        <p>Writer: <strong>{order.writer?.full_name}</strong></p>
                      </div>
                    </div>

                    {/* Dispute Details & Rubric */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1.5">
                        <span className="font-black block uppercase text-[10px] tracking-wider text-amber-800">
                          Student's Dispute Claim:
                        </span>
                        <p className="leading-relaxed">{order.dispute_reason}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1.5">
                        <span className="font-black block uppercase text-[10px] tracking-wider text-slate-500">
                          Original Order Prompt & Rubric:
                        </span>
                        <p className="leading-relaxed">{order.instructions}</p>
                      </div>
                    </div>

                    {/* Admin Mediation Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500">
                        Arbitrate as {currentAdmin.full_name}:
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleResolveDispute(order.id, 'WRITER')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                        >
                          ✓ Rule for Writer (Release {formatCurrency(order.budget)})
                        </button>

                        <button
                          onClick={() => handleResolveDispute(order.id, 'STUDENT')}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm"
                        >
                          ✕ Rule for Student (Refund {formatCurrency(order.budget)})
                        </button>

                        <button
                          onClick={() => handleResolveDispute(order.id, 'SPLIT')}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                        >
                          ⚖️ Split 50/50
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NOTE MODERATION QUEUE */}
        {activeTab === 'MODERATION' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Study Materials Awaiting Review</h3>

            {pendingNotes.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">No Pending Documents</h4>
                <p className="text-xs text-slate-500">All submitted study materials have been reviewed and published.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingNotes.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 font-bold text-xs font-mono">
                          {doc.course_code}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {doc.institution}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
                          Price: {formatCurrency(doc.price)}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{doc.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{doc.description}</p>
                      <p className="text-[11px] text-slate-400">Uploader: {doc.uploader?.full_name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveNote(doc.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        Approve & Publish
                      </button>
                      <button
                        onClick={() => handleRejectNote(doc.id)}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WRITER PAYOUTS */}
        {activeTab === 'PAYOUTS' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Writer Bank Withdrawal Requests</h3>

            <div className="space-y-3">
              {payouts.map((pay) => (
                <div
                  key={pay.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">{formatCurrency(pay.amount)}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pay.status === 'PROCESSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pay.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      {pay.account_name} • {pay.bank_name} ({pay.account_number})
                    </p>
                    <p className="text-[11px] text-slate-400">Requested: {formatDate(pay.created_at)}</p>
                  </div>

                  {pay.status === 'PENDING' ? (
                    <button
                      onClick={() => handleProcessPayout(pay.id, pay.account_name, pay.amount)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    >
                      Mark Bank Transfer Complete
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Paid Out
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN TEAM MANAGEMENT */}
        {activeTab === 'TEAM' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Authorized Administrators ({admins.length})</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {admins.map((adm) => (
                <div
                  key={adm.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={adm.avatar_url}
                      alt={adm.full_name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{adm.full_name}</h4>
                      <p className="text-xs text-slate-500">{adm.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary-50 text-primary-700">
                        {adm.permission}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">{adm.last_login}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Invite Admin Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Invite New Administrator</h3>

            <form onSubmit={handleInviteAdmin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Admin Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. David Adeleke"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Admin Email Address</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="david@studynotehub.com"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Assigned Permission / Role</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as AdminPermission)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium bg-white outline-none focus:border-primary-500"
                >
                  <option value="DISPUTE_MANAGER">Dispute Mediator (Escrow Arbitrations)</option>
                  <option value="CONTENT_MODERATOR">Content Moderator (Review Uploaded Notes)</option>
                  <option value="FINANCE_AUDITOR">Financial Auditor (Payout Approvals)</option>
                  <option value="SUPER_ADMIN">Super Administrator (Full Privileges)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700 shadow-md"
                >
                  Send Admin Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
