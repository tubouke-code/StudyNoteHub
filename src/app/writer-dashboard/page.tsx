'use client';

import React, { useState, useEffect } from 'react';
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
  GraduationCap,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { WriterVerificationModal } from '@/components/writer/WriterVerificationModal';
import { createClient } from '@/lib/supabase/client';
import { OrderItem } from '@/types/database.types';

export default function WriterDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'assigned' | 'open_jobs'>('assigned');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [assignedOrders, setAssignedOrders] = useState<OrderItem[]>([]);
  const [openJobs, setOpenJobs] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is a verified writer or admin
  const isVerified = user?.role === 'WRITER' || user?.role === 'ADMIN' || Boolean(user?.is_verified_writer);

  useEffect(() => {
    async function loadWriterData() {
      if (user && !user.is_email_verified && user.email !== 'orukari878@gmail.com') {
        router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
        return;
      }
      try {
        const supabase = createClient();

        // 1. Fetch assigned projects for current writer
        if (user) {
          const { data: assigned } = await supabase
            .from('orders')
            .select('*, client:profiles!orders_client_id_fkey(*)')
            .eq('writer_id', user.id)
            .order('created_at', { ascending: false });

          if (assigned) {
            setAssignedOrders(assigned as OrderItem[]);
          }
        }

        // 2. Fetch open unassigned jobs
        const { data: open } = await supabase
          .from('orders')
          .select('*, client:profiles!orders_client_id_fkey(*)')
          .eq('status', 'PENDING')
          .order('created_at', { ascending: false });

        if (open) {
          setOpenJobs(open as OrderItem[]);
        }
      } catch (err) {
        console.error('Error loading writer dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadWriterData();
  }, [user]);

  return (
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Writer Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Deliver assigned academic projects, bid on open student tasks, and track 85% payouts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notes/upload"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Complete Projects (90% Cut)
            </Link>

            <Link
              href="/wallet"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <DollarSign className="w-4 h-4" />
              Withdraw Balance ({formatCurrency(user?.wallet_balance || 0)})
            </Link>
          </div>
        </div>

        {/* Verification Alert Banner if Not Yet Verified */}
        {!isVerified && (
          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold">Writer Accreditation Required</h3>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                To protect students from low-quality academic submissions and maintain our 100% Escrow standard, all writers must pay a small one-time accreditation token (₦3,500) before bidding on projects.
              </p>
            </div>

            <button
              onClick={() => setShowVerificationModal(true)}
              className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shrink-0"
            >
              Pay Accreditation Token (₦3,500)
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Orders</span>
            <p className="text-3xl font-black text-slate-900 mt-2">{assignedOrders.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold block">In Progress</span>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Open Student Tasks</span>
            <p className="text-3xl font-black text-slate-900 mt-2">{openJobs.length}</p>
            <span className="text-[11px] text-indigo-600 font-semibold block">Available for Bidding</span>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Researcher Rating</span>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {Number(user?.writer_rating || 5.0).toFixed(1)} ★
            </p>
            <span className="text-[11px] text-slate-500 font-semibold block">{user?.total_reviews || 0} reviews</span>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Wallet Balance</span>
            <p className="text-3xl font-black text-emerald-700 mt-2">{formatCurrency(user?.wallet_balance || 0)}</p>
            <span className="text-[11px] text-emerald-700 font-semibold block">85% Net Escrow Cut</span>
          </div>
        </div>

        {/* Main Orders & Bidding Area */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`pb-4 transition-colors flex items-center gap-1.5 ${
                activeTab === 'assigned'
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-4 h-4" /> My Assigned Projects ({assignedOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('open_jobs')}
              className={`pb-4 transition-colors flex items-center gap-1.5 ${
                activeTab === 'open_jobs'
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Open Project Feed ({openJobs.length})
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span>Loading live writer tasks...</span>
              </div>
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
              openJobs.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">No open student tasks at the moment</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    New custom projects posted by university students will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {openJobs.map((job) => (
                    <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            {job.service_type}
                          </span>
                          <span className="text-xs text-slate-400">{job.academic_level}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                        <p className="text-xs text-slate-500">
                          {job.pages_count} units • Citation: {job.citation_style} • Escrow: {formatCurrency(job.budget)}
                        </p>
                      </div>

                      <Link
                        href={`/hire-writer/orders/${job.id}`}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                      >
                        View & Bid <ChevronRight className="w-3.5 h-3.5" />
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
  );
}
