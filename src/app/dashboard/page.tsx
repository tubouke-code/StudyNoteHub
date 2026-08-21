'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PenTool, 
  Clock, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  BookOpen, 
  Download, 
  MessageSquare,
  ShieldCheck,
  Loader2,
  Wallet,
  Sparkles,
  RefreshCw,
  Users,
  PlusCircle,
  FolderCheck,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { OrderItem } from '@/types/database.types';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PaymentModal } from '@/components/payments/PaymentModal';

export default function HirerDashboardPage() {
  const { user, isLoggedIn, refreshUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'bids' | 'custom_orders' | 'completed' | 'purchased_notes' | 'wallet_hub'>('bids');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [bidsByOrder, setBidsByOrder] = useState<Record<string, any[]>>({});
  const [purchasedNotes, setPurchasedNotes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFundWalletOpen, setIsFundWalletOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('10000');

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      // Parallel data loading for high performance
      const [ordersRes, allBidsRes, purchasesRes, txnsRes] = await Promise.allSettled([
        supabase
          .from('orders')
          .select('*, writer:profiles(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('bids')
          .select('*, writer:profiles(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('document_purchases')
          .select('*, document:documents(*)')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      // 1. Process User's Project Orders
      let userOrders: OrderItem[] = [];
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        const allOrders = ordersRes.value.data as OrderItem[];
        userOrders = allOrders.filter(o => o.client_id === user.id || o.student_id === user.id);
        setOrders(userOrders);
      }

      // 2. Process Bids for user's open orders
      if (allBidsRes.status === 'fulfilled' && allBidsRes.value.data) {
        const userOrderIds = new Set(userOrders.map(o => o.id));
        const bidsMap: Record<string, any[]> = {};
        
        allBidsRes.value.data.forEach((b: any) => {
          if (userOrderIds.has(b.order_id)) {
            if (!bidsMap[b.order_id]) bidsMap[b.order_id] = [];
            bidsMap[b.order_id].push(b);
          }
        });
        setBidsByOrder(bidsMap);
      }

      // 3. Process Purchased Digital Notes & Projects
      if (purchasesRes.status === 'fulfilled' && purchasesRes.value.data) {
        setPurchasedNotes(purchasesRes.value.data);
      }

      // 4. Process Transactions
      if (txnsRes.status === 'fulfilled' && txnsRes.value.data) {
        setTransactions(txnsRes.value.data);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived Categorized Orders
  const activeBiddingOrders = orders.filter(o => o.status === 'OPEN' || !o.writer_id);
  const customOrdersInProgress = orders.filter(o => ['ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW'].includes(o.status));
  const completedWorks = orders.filter(o => o.status === 'COMPLETED');
  const totalBidsCount = Object.values(bidsByOrder).reduce((sum, list) => sum + list.length, 0);

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                  Hirer Command Center
                </span>
                <span className="text-xs text-slate-400">Account: {user?.email}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Welcome back, {user?.full_name || 'Academic Hirer'}!
                </h1>
                <button
                  onClick={loadDashboardData}
                  disabled={isLoading}
                  className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Refresh Live Dashboard"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage your escrow wallet, review live writer bids, track custom research orders & download completed works
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/hire-writer/new"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Commission New Project
              </Link>

              <button
                onClick={() => setIsFundWalletOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-emerald-600" />
                Top Up Escrow Wallet
              </button>
            </div>
          </div>

          {/* 5 Core Top Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* 1. Wallet Balance */}
            <div 
              onClick={() => setActiveTab('wallet_hub')}
              className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Escrow Wallet</span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-700">
                {formatCurrency(user?.wallet_balance || 0)}
              </p>
              <span className="text-[10px] text-slate-500 font-semibold block">100% Protected Funds</span>
            </div>

            {/* 2. Active Bids & Proposals */}
            <div 
              onClick={() => setActiveTab('bids')}
              className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Writer Bids</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-indigo-900">
                {totalBidsCount}
              </p>
              <span className="text-[10px] text-indigo-600 font-semibold block">{activeBiddingOrders.length} Projects in Bidding</span>
            </div>

            {/* 3. Custom Orders in Progress */}
            <div 
              onClick={() => setActiveTab('custom_orders')}
              className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-primary-300 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Custom Orders</span>
                <PenTool className="w-4 h-4 text-primary-600" />
              </div>
              <p className="text-2xl font-black text-primary-900">
                {customOrdersInProgress.length}
              </p>
              <span className="text-[10px] text-primary-600 font-semibold block">Writing In Progress</span>
            </div>

            {/* 4. Completed Works */}
            <div 
              onClick={() => setActiveTab('completed')}
              className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed Works</span>
                <FolderCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-800">
                {completedWorks.length}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold block">Ready for Download</span>
            </div>

            {/* 5. Purchased Study Notes */}
            <div 
              onClick={() => setActiveTab('purchased_notes')}
              className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-sky-300 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Purchased Notes</span>
                <BookOpen className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-2xl font-black text-sky-900">
                {purchasedNotes.length}
              </p>
              <span className="text-[10px] text-slate-500 font-semibold block">Instant PDF/DOCX Access</span>
            </div>

          </div>

          {/* Main Content Area with Navigation Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
              
              <button
                onClick={() => setActiveTab('bids')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'bids'
                    ? 'text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" /> Live Writer Bids ({totalBidsCount})
              </button>

              <button
                onClick={() => setActiveTab('custom_orders')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'custom_orders'
                    ? 'text-primary-700 border-b-2 border-primary-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-4 h-4" /> Custom Orders In Progress ({customOrdersInProgress.length})
              </button>

              <button
                onClick={() => setActiveTab('completed')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'completed'
                    ? 'text-emerald-700 border-b-2 border-emerald-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FolderCheck className="w-4 h-4" /> Completed Works ({completedWorks.length})
              </button>

              <button
                onClick={() => setActiveTab('purchased_notes')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'purchased_notes'
                    ? 'text-sky-700 border-b-2 border-sky-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Purchased Study Notes ({purchasedNotes.length})
              </button>

              <button
                onClick={() => setActiveTab('wallet_hub')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'wallet_hub'
                    ? 'text-emerald-700 border-b-2 border-emerald-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4" /> Escrow Wallet & Top-up
              </button>

            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  <span className="text-sm font-semibold">Loading your Hirer Dashboard...</span>
                </div>
              ) : activeTab === 'bids' ? (
                /* ═══════════════════════════════════════════════════════
                   TAB 1: LIVE WRITER BIDS & PROPOSALS
                   ═══════════════════════════════════════════════════════ */
                activeBiddingOrders.length === 0 ? (
                  <div className="text-center py-16 space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No active project bidding</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Post an assignment or capstone project to receive sealed proposals from accredited academic researchers.
                    </p>
                    <Link
                      href="/hire-writer/new"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold shadow-xs"
                    >
                      <PenTool className="w-3.5 h-3.5" /> Post Project for Bids
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeBiddingOrders.map((order) => {
                      const bids = bidsByOrder[order.id] || [];
                      return (
                        <div key={order.id} className="p-6 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                                  {order.service_type}
                                </span>
                                <span className="text-xs text-slate-400">Order #{order.id.slice(0, 8)}</span>
                                <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {order.academic_level}
                                </span>
                              </div>
                              <h4 className="text-base font-bold text-slate-900 mt-1">{order.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Guide Budget: <strong className="text-slate-800">{formatCurrency(order.budget)}</strong> • Deadline: {formatDate(order.deadline)}
                              </p>
                            </div>

                            <Link
                              href={`/hire-writer/orders/${order.id}`}
                              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
                            >
                              {bids.length > 0 ? `Review ${bids.length} Proposals & Hire` : 'Open Project Workspace'} 
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                          {/* Bids List preview */}
                          {bids.length === 0 ? (
                            <div className="p-4 rounded-xl bg-white border border-indigo-100 text-center text-xs text-slate-500">
                              ⚡ Project is live on the Writer Board. Accredited researchers are preparing proposals...
                            </div>
                          ) : (
                            <div className="divide-y divide-indigo-100/60 bg-white rounded-xl border border-indigo-100 p-3">
                              {bids.map((bid) => (
                                <div key={bid.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={bid.writer?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                                      alt={bid.writer?.full_name || 'Writer'}
                                      className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="font-bold text-slate-900">{bid.writer?.full_name || 'Accredited Researcher'}</h5>
                                        {bid.writer?.is_verified_writer && (
                                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                            ✓ Verified
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-500 mt-0.5">{bid.proposal || 'Ready to deliver high-quality, plagiarism-free research.'}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 shrink-0 sm:text-right">
                                    <div>
                                      <p className="font-black text-sm text-emerald-700">{formatCurrency(bid.bid_amount)}</p>
                                      <p className="text-[10px] text-slate-400">{formatDate(bid.created_at)}</p>
                                    </div>
                                    <Link
                                      href={`/hire-writer/orders/${order.id}`}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                    >
                                      Hire Writer
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : activeTab === 'custom_orders' ? (
                /* ═══════════════════════════════════════════════════════
                   TAB 2: CUSTOM ORDERS IN PROGRESS
                   ═══════════════════════════════════════════════════════ */
                customOrdersInProgress.length === 0 ? (
                  <div className="text-center py-16 space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No active custom orders in progress</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      When you hire an academic researcher, your active project milestones will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {customOrdersInProgress.map((order) => (
                      <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                              {order.service_type}
                            </span>
                            <span className="text-xs text-slate-400">Order #{order.id.slice(0, 8)}</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                              {order.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{order.title}</h4>
                          <p className="text-xs text-slate-500">
                            Escrow Budget: <strong className="text-slate-800">{formatCurrency(order.budget)}</strong> • Due: {formatDate(order.deadline)}
                          </p>
                        </div>

                        <Link
                          href={`/hire-writer/orders/${order.id}`}
                          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Open Project Workspace <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              ) : activeTab === 'completed' ? (
                /* ═══════════════════════════════════════════════════════
                   TAB 3: COMPLETED WORKS & DELIVERABLES
                   ═══════════════════════════════════════════════════════ */
                completedWorks.length === 0 ? (
                  <div className="text-center py-16 space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <FolderCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No completed deliverables yet</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Completed custom projects and Turnitin originality certificates will be archived here for lifetime access.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {completedWorks.map((order) => (
                      <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              ✓ Completed & Approved
                            </span>
                            <span className="text-xs text-slate-400">Order #{order.id.slice(0, 8)}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{order.title}</h4>
                          <p className="text-xs text-slate-500">
                            Delivered by {order.writer?.full_name || 'Accredited Researcher'} • {order.citation_style} • {formatCurrency(order.budget)}
                          </p>
                        </div>

                        <Link
                          href={`/hire-writer/orders/${order.id}`}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Deliverables
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              ) : activeTab === 'purchased_notes' ? (
                /* ═══════════════════════════════════════════════════════
                   TAB 4: PURCHASED STUDY NOTES & PROJECTS
                   ═══════════════════════════════════════════════════════ */
                purchasedNotes.length === 0 ? (
                  <div className="text-center py-16 space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No study notes unlocked yet</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Browse verified study materials, lecture summaries, and solved past questions in our catalog.
                    </p>
                    <Link
                      href="/notes"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Browse Notes Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {purchasedNotes.map((purchase) => (
                      <div key={purchase.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {purchase.document?.course_code || 'MATERIAL'}
                            </span>
                            <span className="text-xs text-emerald-600 font-semibold">✓ Lifetime Access</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{purchase.document?.title}</h4>
                          <p className="text-xs text-slate-500">
                            {purchase.document?.institution} • Purchased on {formatDate(purchase.created_at)}
                          </p>
                        </div>

                        <a
                          href={`/api/documents/${purchase.document_id}/download`}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" /> Download File
                        </a>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* ═══════════════════════════════════════════════════════
                   TAB 5: ESCROW WALLET & TRANSACTION HISTORY
                   ═══════════════════════════════════════════════════════ */
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Available Escrow Balance
                      </span>
                      <p className="text-3xl font-black text-slate-900">
                        {formatCurrency(user?.wallet_balance || 0)}
                      </p>
                      <p className="text-xs text-emerald-800/80">
                        100% money-back guarantee. Funds are held in escrow until you approve custom deliverables.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsFundWalletOpen(true)}
                      className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <Wallet className="w-4 h-4" /> Top Up Wallet Balance
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Recent Wallet Activity & Escrow Statements
                    </h4>

                    {transactions.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-100 text-xs text-slate-400">
                        No wallet transactions recorded yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 p-2">
                        {transactions.map((txn) => (
                          <div key={txn.id} className="py-3 px-4 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{txn.description || txn.type}</p>
                              <p className="text-[10px] text-slate-400">{formatDate(txn.created_at)}</p>
                            </div>
                            <span className={`font-black ${txn.amount >= 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                              {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Fund Wallet Payment Modal */}
        <PaymentModal
          isOpen={isFundWalletOpen}
          onClose={() => setIsFundWalletOpen(false)}
          title="Top Up Escrow Wallet Balance"
          amount={Number(fundAmount) || 10000}
          itemType="WALLET_TOPUP"
          onSuccess={() => {
            setIsFundWalletOpen(false);
            refreshUser();
            loadDashboardData();
          }}
        />

      </div>
    </RoleGuard>
  );
}
