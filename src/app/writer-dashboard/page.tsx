'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PenTool, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Award, 
  BookOpen, 
  UploadCloud, 
  ChevronRight, 
  Sparkles, 
  Search, 
  Filter,
  CheckCircle,
  MessageSquare,
  Shield,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { WriterVerificationModal } from '@/components/writer/WriterVerificationModal';
import { createClient } from '@/lib/supabase/client';
import { OrderItem, DocumentItem } from '@/types/database.types';
import { RoleGuard } from '@/components/layout/RoleGuard';

export default function WriterDashboardPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'assigned' | 'open_jobs' | 'materials'>('open_jobs');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Live Database States
  const [assignedOrders, setAssignedOrders] = useState<OrderItem[]>([]);
  const [openJobs, setOpenJobs] = useState<OrderItem[]>([]);
  const [myBids, setMyBids] = useState<Record<string, any>>({});
  const [myUploads, setMyUploads] = useState<DocumentItem[]>([]);

  const isVerified = user?.is_verified_writer || user?.role === 'WRITER' || user?.role === 'ADMIN';

  const loadWriterData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      // Parallel resilient data loading
      const [allOrdersRes, bidsRes, uploadsRes] = await Promise.allSettled([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('bids').select('*').eq('writer_id', user.id),
        supabase.from('documents').select('*').eq('uploader_id', user.id).order('created_at', { ascending: false }),
      ]);

      // 1. Process Orders (Assigned vs Open for Bidding)
      if (allOrdersRes.status === 'fulfilled' && allOrdersRes.value.data) {
        const allOrders = allOrdersRes.value.data as OrderItem[];
        
        // Assigned to this writer
        const assigned = allOrders.filter(o => o.writer_id === user.id);
        setAssignedOrders(assigned);

        // Open for live bidding (status is OPEN, PENDING, or not yet assigned to a writer)
        const open = allOrders.filter(o => 
          (o.status === 'OPEN' || o.status === 'PENDING' || !o.writer_id) &&
          o.writer_id !== user.id &&
          o.client_id !== user.id
        );
        setOpenJobs(open);
      }

      // 2. Process Writer's Bids
      if (bidsRes.status === 'fulfilled' && bidsRes.value.data) {
        const bidsMap: Record<string, any> = {};
        bidsRes.value.data.forEach((b: any) => {
          bidsMap[b.order_id] = b;
        });
        setMyBids(bidsMap);
      }

      // 3. Process Uploaded Materials
      if (uploadsRes.status === 'fulfilled' && uploadsRes.value.data) {
        setMyUploads(uploadsRes.value.data as DocumentItem[]);
      }

    } catch (err) {
      console.error('Error loading writer dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWriterData();
  }, [loadWriterData]);

  const approvedUploads = myUploads.filter(u => u.status === 'APPROVED').length;
  const pendingUploads = myUploads.filter(u => u.status === 'PENDING').length;

  return (
    <RoleGuard allowedRoles={['WRITER']}>
      <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                  Writer & Researcher Portal
                </span>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accredited
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Writer Operations Center
                </h1>
                <button
                  onClick={loadWriterData}
                  disabled={isLoading}
                  className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                  title="Refresh Live Orders"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Deliver assigned academic projects, bid on open student tasks, and manage 90% note royalties
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!isVerified && (
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  Get Accredited Badge
                </button>
              )}

              <Link
                href="/notes/upload"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                Upload Study Material (90% Royalty)
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Live Bidding Jobs</span>
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {openJobs.length}
              </p>
              <span className="text-[11px] text-indigo-600 font-semibold block">Available for Proposals</span>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Active Workspace</span>
                <PenTool className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {assignedOrders.length}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold block">Deliverables In Progress</span>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">My Uploads</span>
                <UploadCloud className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {myUploads.length}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold block">
                {approvedUploads} Live • {pendingUploads} In Review
              </span>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Withdrawable Balance</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-700 mt-2">
                {formatCurrency(user?.wallet_balance || 0)}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold block">Direct Bank Transfer Ready</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab('open_jobs')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'open_jobs'
                    ? 'text-emerald-700 border-b-2 border-emerald-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Open Project Feed & Bidding ({openJobs.length})
              </button>

              <button
                onClick={() => setActiveTab('assigned')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'assigned'
                    ? 'text-emerald-700 border-b-2 border-emerald-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-4 h-4" /> Assigned Projects ({assignedOrders.length})
              </button>

              <button
                onClick={() => setActiveTab('materials')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'materials'
                    ? 'text-emerald-700 border-b-2 border-emerald-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-4 h-4" /> My Study Materials ({myUploads.length})
              </button>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Loading live writer tasks...</span>
                </div>
              ) : activeTab === 'open_jobs' ? (
                openJobs.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No open student tasks at the moment</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      New custom projects posted by university students will appear here in real-time for live bidding.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {openJobs.map((job) => {
                      const userBid = myBids[job.id];
                      return (
                        <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                                {job.service_type}
                              </span>
                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                {job.academic_level}
                              </span>
                              {userBid && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ✓ Bid Placed: {formatCurrency(userBid.bid_amount)} (Sealed)
                                </span>
                              )}
                              <span className="text-xs text-slate-400">#{job.id.slice(0, 8)}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">{job.title}</h4>
                            <p className="text-xs text-slate-500">
                              Subject: {job.subject_area || 'Academic'} • Citation: {job.citation_style || 'APA 7th'} • Budget: <strong className="text-slate-800">{formatCurrency(job.budget)}</strong>
                            </p>
                            {job.instructions && (
                              <p className="text-[11px] text-slate-600 line-clamp-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                {job.instructions}
                              </p>
                            )}
                          </div>

                          <Link
                            href={`/hire-writer/orders/${job.id}`}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs ${
                              userBid 
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            {userBid ? 'Review My Bid' : 'Place Sealed Bid'} <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : activeTab === 'assigned' ? (
                assignedOrders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No active assigned projects</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Check the Open Project Feed tab to bid on student assignments and capstone theses.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {assignedOrders.map((ord) => (
                      <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {ord.service_type}
                            </span>
                            <span className="text-xs text-slate-400">Order #{ord.id.slice(0, 8)}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{ord.title}</h4>
                          <p className="text-xs text-slate-500">
                            {ord.pages_count} units • {ord.academic_level} • Budget: {formatCurrency(ord.budget)}
                          </p>
                        </div>

                        <Link
                          href={`/hire-writer/orders/${ord.id}`}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                        >
                          Open Workspace <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                myUploads.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No study materials uploaded yet</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Monetize your past projects, solved question banks, and lecture summaries with 90% royalties.
                    </p>
                    <Link
                      href="/notes/upload"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      <UploadCloud className="w-3.5 h-3.5" /> Upload Material
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {myUploads.map((doc) => (
                      <div key={doc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {doc.course_code}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{doc.title}</h4>
                          <p className="text-xs text-slate-500">
                            {doc.institution} • {doc.price > 0 ? formatCurrency(doc.price) : 'FREE'} • {doc.downloads_count || 0} downloads
                          </p>
                        </div>
                        <Link
                          href={`/notes/${doc.id}`}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1 shrink-0"
                        >
                          View Material <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

          </div>

        </div>

        {/* Verification Modal */}
        <WriterVerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={() => {
            setShowVerificationModal(false);
          }}
        />

      </div>
    </RoleGuard>
  );
}
