'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  DollarSign, 
  Users, 
  BookOpen, 
  Search, 
  Filter, 
  ChevronRight, 
  MessageSquare, 
  UserCheck, 
  UserX,
  ExternalLink,
  Sparkles,
  Award,
  RefreshCw,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_ORDERS, MOCK_DOCUMENTS, MOCK_ADMINS, MOCK_PAYOUT_REQUESTS, MOCK_WRITERS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AdminPermission } from '@/types/database.types';

export default function AdminPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'disputes' | 'moderation' | 'vetting' | 'payouts' | 'team'>('vetting');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock pending writer applications for vetting
  const [writerApplications, setWriterApplications] = useState([
    {
      id: 'app_01',
      name: 'Dr. Emeka Okafor',
      email: 'dr.emeka@writers.hub',
      institution: 'University of Ibadan',
      degree: 'Ph.D in Econometric Modeling & Statistics',
      sample_topic: 'Impact of Monetary Policy on Inflation Dynamics in Sub-Saharan Africa',
      turnitin_similarity: 2.4,
      ai_score: 0.0,
      test_score: '98%',
      token_paid: true,
      token_amount: 3500,
      applied_at: '2025-02-17T14:20:00Z',
      status: 'PENDING',
    },
    {
      id: 'app_02',
      name: 'Barr. Fatima Lawal',
      email: 'fatima.lawal@writers.hub',
      institution: 'Ahmadu Bello University (ABU)',
      degree: 'LL.B (First Class Honours) & B.L',
      sample_topic: 'Judicial Review of Administrative Actions under the 1999 Constitution',
      turnitin_similarity: 1.8,
      ai_score: 0.0,
      test_score: '96%',
      token_paid: true,
      token_amount: 3500,
      applied_at: '2025-02-18T09:15:00Z',
      status: 'PENDING',
    },
    {
      id: 'app_03',
      name: 'Chidi Kenneth',
      email: 'chidi.k@gmail.com',
      institution: 'UNN Nsukka',
      degree: 'B.Sc Microbiology',
      sample_topic: 'Antimicrobial Resistance Mechanisms in Clinical Isolates',
      turnitin_similarity: 18.5, // High plagiarism
      ai_score: 45.0, // High AI
      test_score: '62%',
      token_paid: true,
      token_amount: 3500,
      applied_at: '2025-02-18T11:40:00Z',
      status: 'PENDING',
    },
  ]);

  // Escrow Dispute Cases
  const [disputedOrders, setDisputedOrders] = useState(
    MOCK_ORDERS.filter((o) => o.status === 'DISPUTED' || o.escrow_status === 'DISPUTE_HOLD')
  );

  // Pending Notes Moderation
  const [pendingNotes, setPendingNotes] = useState(
    MOCK_DOCUMENTS.filter((d) => d.status === 'PENDING')
  );

  // Writer Payout Requests
  const [payouts, setPayouts] = useState(MOCK_PAYOUT_REQUESTS);

  // Invite Admin State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePermission, setInvitePermission] = useState<AdminPermission>('DISPUTE_MANAGER');
  const [adminList, setAdminList] = useState(MOCK_ADMINS);

  const handleApproveWriter = (id: string) => {
    setWriterApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
    alert('Writer accredited successfully! Verified badge and open bidding access granted.');
  };

  const handleRejectWriter = (id: string) => {
    setWriterApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED' } : a));
    alert('Writer application rejected due to quality standards.');
  };

  const handleSettleDispute = (orderId: string, ruling: 'RELEASE_TO_WRITER' | 'REFUND_STUDENT') => {
    setDisputedOrders(prev => prev.filter(o => o.id !== orderId));
    alert(`Dispute settled: Ruling executed (${ruling}). Funds transferred from escrow.`);
  };

  const handleApproveNote = (docId: string) => {
    setPendingNotes(prev => prev.filter(d => d.id !== docId));
    alert('Study material approved and published to the live catalog!');
  };

  const handleApprovePayout = (payoutId: string) => {
    setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'PROCESSED' } : p));
    alert('Bank transfer initiated via Flutterwave/Paystack Transfers!');
  };

  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const newAdmin = {
      id: `adm_${Date.now()}`,
      email: inviteEmail,
      full_name: inviteName,
      permission: invitePermission,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      last_login: 'Pending Invite',
      is_active: true,
    };
    setAdminList([...adminList, newAdmin]);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteName('');
    alert(`Invitation sent to ${inviteEmail} with role ${invitePermission}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Super Admin Console
              </span>
              <span className="text-xs text-slate-400">• Authenticated as {user?.email || 'Super Admin'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Platform Operations Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              + Invite Admin Staff
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('vetting')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'vetting'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            Writer Vetting Queue ({writerApplications.filter(a => a.status === 'PENDING').length})
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'disputes'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Escrow Dispute Court ({disputedOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'moderation'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Note Moderation ({pendingNotes.length})
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'payouts'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Bank Payout Requests ({payouts.filter(p => p.status === 'PENDING').length})
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'team'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Admin Team Staff ({adminList.length})
          </button>
        </div>

        {/* TAB 1: WRITER VETTING & TURNITIN BENCHMARK */}
        {activeTab === 'vetting' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">4-Stage Academic Accreditation Engine</p>
                <p className="text-slate-400 text-[11px]">
                  Writers must pay their ₦3,500 token, pass grammar diagnostics, and submit an academic sample with &lt;15% Turnitin similarity and 0% AI before receiving their verified badge.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/30">
                Turnitin Live Enabled
              </span>
            </div>

            <div className="space-y-4">
              {writerApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{app.name}</h3>
                        <span className="text-xs text-slate-400">({app.email})</span>
                        {app.token_paid && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ ₦3,500 Token Paid
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-400 font-semibold">
                        {app.degree} • {app.institution}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {app.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleRejectWriter(app.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs border border-red-500/30 transition-all"
                          >
                            Reject Application
                          </button>
                          <button
                            onClick={() => handleApproveWriter(app.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5" /> Accredit & Issue Badge
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                            app.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sample Test & Turnitin Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Sample Essay Topic
                      </span>
                      <p className="text-slate-200 font-medium line-clamp-2">{app.sample_topic}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Grammar & Citation Diagnostic
                      </span>
                      <p className="text-emerald-400 font-black text-lg">{app.test_score}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Turnitin Originality & AI
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Similarity:</span>
                          <span className={`font-black text-sm ${app.turnitin_similarity < 15 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {app.turnitin_similarity}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">AI Content:</span>
                          <span className={`font-black text-sm ${app.ai_score < 10 ? 'text-indigo-400' : 'text-amber-400'}`}>
                            {app.ai_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ESCROW DISPUTE COURT */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            {disputedOrders.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
                No active escrow disputes in queue. All projects in good standing!
              </div>
            ) : (
              disputedOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      Dispute Case #{order.id}
                    </span>
                    <span className="text-sm font-black text-emerald-400">
                      {formatCurrency(order.budget)} Held in Escrow
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{order.title}</h3>
                  
                  <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-200">
                    <strong>Dispute Claim:</strong> {order.dispute_reason}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleSettleDispute(order.id, 'REFUND_STUDENT')}
                      className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
                    >
                      Rule in Favor of Student (Full Refund)
                    </button>
                    <button
                      onClick={() => handleSettleDispute(order.id, 'RELEASE_TO_WRITER')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Rule in Favor of Writer (Release Escrow)
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: NOTE MODERATION */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            {pendingNotes.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
                No pending study notes awaiting moderation.
              </div>
            ) : (
              pendingNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {note.course_code}
                    </span>
                    <h3 className="text-sm font-bold text-white">{note.title}</h3>
                    <p className="text-xs text-slate-400">{note.institution} • {note.department}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApproveNote(note.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Approve & Publish
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: PAYOUT REQUESTS */}
        {activeTab === 'payouts' && (
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{payout.account_name}</h4>
                  <p className="text-xs text-slate-400">
                    {payout.bank_name} • {payout.account_number}
                  </p>
                  <span className="text-xs font-black text-emerald-400 block">
                    Amount: {formatCurrency(payout.amount)}
                  </span>
                </div>

                <div>
                  {payout.status === 'PENDING' ? (
                    <button
                      onClick={() => handleApprovePayout(payout.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Approve & Process Bank Transfer
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/20">
                      ✓ Paid via Bank API
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: ADMIN TEAM */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            {adminList.map((adm) => (
              <div
                key={adm.id}
                className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={adm.avatar_url}
                    alt={adm.full_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{adm.full_name}</h4>
                    <p className="text-xs text-slate-400">{adm.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {adm.permission}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Invite Admin Staff Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 text-white">
            <h3 className="text-lg font-black">Invite Admin Staff Member</h3>
            <form onSubmit={handleInviteAdmin} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Sarah Adeleke"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm outline-none"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@domain.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm outline-none"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300">Assigned Permission</label>
                <select
                  value={invitePermission}
                  onChange={(e) => setInvitePermission(e.target.value as AdminPermission)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm outline-none text-white"
                >
                  <option value="DISPUTE_MANAGER">⚖️ Dispute Manager (Arbitration)</option>
                  <option value="CONTENT_MODERATOR">📝 Content Moderator (Notes Approval)</option>
                  <option value="FINANCE_AUDITOR">💰 Finance Auditor (Payout Processing)</option>
                  <option value="SUPER_ADMIN">🛡️ Super Admin (Full Control)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                >
                  Send Admin Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
