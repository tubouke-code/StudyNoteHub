'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { WriterVerificationModal } from '@/components/writer/WriterVerificationModal';
import { createClient } from '@/lib/supabase/client';
import { OrderItem, DocumentItem } from '@/types/database.types';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'notes' | 'uploads'>('orders');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [userUploads, setUserUploads] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (!user.is_email_verified && user.email !== 'orukari878@gmail.com') {
        router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
        return;
      }

      try {
        const supabase = createClient();

        // 1. Fetch user's orders
        const { data: userOrders } = await supabase
          .from('orders')
          .select('*, writer:profiles!orders_writer_id_fkey(*)')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });

        if (userOrders) {
          setOrders(userOrders as OrderItem[]);
        }

        // 2. Fetch user's uploaded materials
        const { data: uploads } = await supabase
          .from('documents')
          .select('*')
          .eq('uploader_id', user.id)
          .order('created_at', { ascending: false });

        if (uploads) {
          setUserUploads(uploads as DocumentItem[]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

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
            <h3 className="text-xl font-bold">Write Assignments & Sell Pre-Written Projects</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you a top student, graduate, or researcher? Unlock your Writer Accreditation token (₦3,500) to start taking paid projects and earning 90% royalties on uploaded study materials.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowVerificationModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Apply to Write & Earn
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Active Projects</span>
              <PenTool className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {orders.filter((o) => o.status !== 'COMPLETED').length}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold block">100% Escrow Protected</span>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Uploaded Notes</span>
              <UploadCloud className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {userUploads.length}
            </p>
            <span className="text-[11px] text-indigo-600 font-semibold block">90% Creator Royalties</span>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Wallet Balance</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-700 mt-2">
              {formatCurrency(user?.wallet_balance || 0)}
            </p>
            <span className="text-[11px] text-slate-500 font-semibold block">Available for Instant Orders</span>
          </div>
        </div>

        {/* Dashboard Tabs & Content */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 transition-colors flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-4 h-4" /> My Project Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('uploads')}
              className={`pb-4 transition-colors flex items-center gap-1.5 ${
                activeTab === 'uploads'
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4" /> My Uploaded Materials ({userUploads.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                <span>Loading your student dashboard data...</span>
              </div>
            ) : activeTab === 'orders' ? (
              orders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">No project orders yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Need help with a term paper, thesis, or defense slide deck? Order a custom project with 100% money-back escrow protection.
                  </p>
                  <Link
                    href="/hire-writer/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold"
                  >
                    <PenTool className="w-3.5 h-3.5" /> Order Your First Project
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                            {order.service_type}
                          </span>
                          <span className="text-xs text-slate-400">#{order.id.slice(0, 8)}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{order.title}</h4>
                        <p className="text-xs text-slate-500">
                          {order.pages_count} units • {order.citation_style} • Budget: {formatCurrency(order.budget)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>

                        <Link
                          href={`/hire-writer/orders/${order.id}`}
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
                        >
                          Workspace <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              userUploads.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">You haven't uploaded any study materials</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Monetize your semester lecture notes, past exams, or complete final year projects for 90% royalties.
                  </p>
                  <Link
                    href="/notes/upload"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Upload Material & Earn
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {userUploads.map((doc) => (
                    <div key={doc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            {doc.course_code}
                          </span>
                          <span className="text-xs text-slate-400">{doc.institution}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{doc.title}</h4>
                        <p className="text-xs text-slate-500">
                          Price: {Number(doc.price) === 0 ? 'FREE' : formatCurrency(doc.price)} • {doc.downloads_count || 0} downloads
                        </p>
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

      </div>

      {/* Writer Verification Token Modal */}
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
