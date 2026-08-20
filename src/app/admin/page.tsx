'use client';

import React, { useState, useEffect } from 'react';
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
  GraduationCap,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { DocumentItem, OrderItem, Profile, PayoutRequest, AdminPermission } from '@/types/database.types';

export default function AdminPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'moderation' | 'vetting' | 'disputes' | 'payouts' | 'team'>('moderation');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [pendingNotes, setPendingNotes] = useState<DocumentItem[]>([]);
  const [writerProfiles, setWriterProfiles] = useState<Profile[]>([]);
  const [disputedOrders, setDisputedOrders] = useState<OrderItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [adminTeam, setAdminTeam] = useState<Profile[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const supabase = createClient();

        // 1. Pending Notes for Moderation
        const { data: notes } = await supabase
          .from('documents')
          .select('*, uploader:profiles(*)')
          .eq('status', 'PENDING')
          .order('created_at', { ascending: false });

        if (notes) setPendingNotes(notes as DocumentItem[]);

        // 2. Writer profiles
        const { data: writers } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'WRITER')
          .order('created_at', { ascending: false });

        if (writers) setWriterProfiles(writers as Profile[]);

        // 3. Disputed orders
        const { data: disputes } = await supabase
          .from('orders')
          .select('*, client:profiles!orders_client_id_fkey(*), writer:profiles!orders_writer_id_fkey(*)')
          .eq('status', 'DISPUTED')
          .order('created_at', { ascending: false });

        if (disputes) setDisputedOrders(disputes as OrderItem[]);

        // 4. Admin Team
        const { data: team } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'ADMIN')
          .order('created_at', { ascending: false });

        if (team) setAdminTeam(team as Profile[]);
      } catch (err) {
        console.error('Error fetching admin data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const handleApproveNote = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('documents').update({ status: 'APPROVED' }).eq('id', id);
      setPendingNotes((prev) => prev.filter((n) => n.id !== id));
      alert('Note approved and published to the live public catalog!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectNote = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('documents').update({ status: 'REJECTED' }).eq('id', id);
      setPendingNotes((prev) => prev.filter((n) => n.id !== id));
      alert('Note rejected and removed from moderation queue.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveWriter = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('profiles').update({ is_verified_writer: true }).eq('id', id);
      setWriterProfiles((prev) =>
        prev.map((w) => (w.id === id ? { ...w, is_verified_writer: true } : w))
      );
      alert('Writer accreditation approved! Writer can now bid on student projects.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                Super Admin Operations Center
              </span>
              <span className="text-xs text-slate-400">Authenticated: {user?.email}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              StudyNoteHub Governance & Moderation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review pending study materials, vet academic writers, settle escrow disputes, and manage payouts
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400">Pending Notes</span>
            <p className="text-2xl font-black text-indigo-600">{pendingNotes.length}</p>
            <span className="text-[11px] text-slate-500">Awaiting Quality Check</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400">Active Writers</span>
            <p className="text-2xl font-black text-emerald-700">{writerProfiles.length}</p>
            <span className="text-[11px] text-slate-500">Registered Researchers</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400">Escrow Disputes</span>
            <p className="text-2xl font-black text-amber-600">{disputedOrders.length}</p>
            <span className="text-[11px] text-slate-500">Arbitration Queue</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400">Admin Team</span>
            <p className="text-2xl font-black text-slate-900">{adminTeam.length || 1}</p>
            <span className="text-[11px] text-slate-500">Staff Members</span>
          </div>
        </div>

        {/* Tab Navigation & Tables */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('moderation')}
              className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'moderation'
                  ? 'text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> Note Moderation ({pendingNotes.length})
            </button>

            <button
              onClick={() => setActiveTab('vetting')}
              className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'vetting'
                  ? 'text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Writer Vetting ({writerProfiles.length})
            </button>

            <button
              onClick={() => setActiveTab('disputes')}
              className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'disputes'
                  ? 'text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Escrow Disputes ({disputedOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'team'
                  ? 'text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> Admin Team ({adminTeam.length || 1})
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span>Loading live admin data...</span>
              </div>
            ) : activeTab === 'moderation' ? (
              pendingNotes.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Moderation Queue is Clean!</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    All study notes and pre-written final year projects have been reviewed and published.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingNotes.map((note) => (
                    <div key={note.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            {note.course_code}
                          </span>
                          <span className="text-xs text-slate-400">{note.institution}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>
                        <p className="text-xs text-slate-500">
                          Price: {Number(note.price) === 0 ? 'FREE' : formatCurrency(note.price)} • Uploader: {note.uploader?.full_name || 'Author'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveNote(note.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                        </button>
                        <button
                          onClick={() => handleRejectNote(note.id)}
                          className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 'vetting' ? (
              writerProfiles.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">No writer applications</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    New applicants who pay the accreditation token will appear here for verification.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {writerProfiles.map((writer) => (
                    <div key={writer.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={writer.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'}
                          alt={writer.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{writer.full_name}</h4>
                          <p className="text-xs text-slate-500">{writer.email} • {writer.institution}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {writer.is_verified_writer ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Accredited
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveWriter(writer.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                          >
                            Approve Accreditation
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 'disputes' ? (
              disputedOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Zero Active Disputes</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    All project deliveries have been accepted smoothly without student-writer disputes.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {disputedOrders.map((ord) => (
                    <div key={ord.id} className="py-4 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{ord.title}</h4>
                        <p className="text-xs text-slate-500">Escrow: {formatCurrency(ord.budget)}</p>
                      </div>
                      <Link
                        href={`/hire-writer/orders/${ord.id}`}
                        className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
                      >
                        Review Dispute
                      </Link>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center">
                      👑
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">orukari878@gmail.com</h4>
                      <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        SUPER_ADMIN (Owner)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-600 font-bold">Active Now</span>
                </div>

                {adminTeam.filter(a => a.email !== 'orukari878@gmail.com').map((member) => (
                  <div key={member.id} className="py-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{member.full_name}</h4>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{member.admin_permission || 'ADMIN'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
