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
  Shield,
  Loader2,
  Wallet,
  Sparkles,
  RefreshCw,
  Users
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { OrderItem } from '@/types/database.types';
import { RoleGuard } from '@/components/layout/RoleGuard';

export default function StudentDashboardPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'orders' | 'bids' | 'notes'>('orders');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [bidsByOrder, setBidsByOrder] = useState<Record<string, any[]>>({});
  const [purchasedNotes, setPurchasedNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      // Parallel data loading for speed
      const [ordersRes, allBidsRes, purchasesRes] = await Promise.allSettled([
        supabase
          .from('orders')
          .select('*')
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
      ]);

      // 1. Process Orders (Matching client_id or student_id)
      let userOrders: OrderItem[] = [];
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        const allOrders = ordersRes.value.data as OrderItem[];
        userOrders = allOrders.filter(o => o.client_id === user.id || o.student_id === user.id);
        setOrders(userOrders);
      }

      // 2. Process Bids for user's orders
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

      // 3. Process Purchased Notes
      if (purchasesRes.status === 'fulfilled' && purchasesRes.value.data) {
        setPurchasedNotes(purchasesRes.value.data);
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

  const totalBidsCount = Object.values(bidsByOrder).reduce((sum, list) => sum + list.length, 0);

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                  Hirer Dashboard
                </span>
                <span className="text-xs text-slate-400">Authenticated: {user?.email}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Welcome back, {user?.full_name || 'Student'}!
                </h1>
                <button
                  onClick={loadDashboardData}
                  disabled={isLoading}
                  className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors disabled:opacity-50"
                  title="Refresh Live Orders & Bids"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Track your academic project orders, review live writer proposals, and manage your escrow wallet
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/hire-writer/new"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/20 transition-all"
              >
                <PenTool className="w-4 h-4" />
                Post New Project for Bids
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

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">My Project Orders</span>
                <PenTool className="w-4 h-4 text-primary-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {orders.length}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold block">100% Escrow Protected</span>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Writer Proposals</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-indigo-900 mt-2">
                {totalBidsCount}
              </p>
              <span className="text-[11px] text-indigo-600 font-semibold block">Bids Received on Projects</span>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Purchased Notes</span>
                <BookOpen className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {purchasedNotes.length}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold block">Instant PDF Downloads</span>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Wallet Balance</span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-700 mt-2">
                {formatCurrency(user?.wallet_balance || 0)}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold block">Available for Escrow Checkout</span>
            </div>
          </div>

          {/* Dashboard Tabs & Content */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'text-primary-700 border-b-2 border-primary-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-4 h-4" /> My Project Orders ({orders.length})
              </button>

              <button
                onClick={() => setActiveTab('bids')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'bids'
                    ? 'text-primary-700 border-b-2 border-primary-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-600" /> Bids Received ({totalBidsCount})
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'text-primary-700 border-b-2 border-primary-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Purchased Notes ({purchasedNotes.length})
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
                      Need help with a term paper, thesis, or defense slide deck? Post a project order for accredited researcher bids.
                    </p>
                    <Link
                      href="/hire-writer/new"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold shadow-xs"
                    >
                      <PenTool className="w-3.5 h-3.5" /> Post Your First Project
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {orders.map((order) => {
                      const orderBids = bidsByOrder[order.id] || [];
                      return (
                        <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                                {order.service_type}
                              </span>
                              <span className="text-xs text-slate-400">Order #{order.id.slice(0, 8)}</span>
                              {orderBids.length > 0 && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                                  ⚡ {orderBids.length} Writer {orderBids.length === 1 ? 'Bid' : 'Bids'} Received
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">{order.title}</h4>
                            <p className="text-xs text-slate-500">
                              Level: {order.academic_level} • Citation: {order.citation_style} • Budget: <strong className="text-slate-800">{formatCurrency(order.budget)}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                              order.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'IN_PROGRESS' || order.status === 'ASSIGNED'
                                ? 'bg-indigo-100 text-indigo-800'
                                : order.status === 'DISPUTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.status === 'OPEN' ? 'Accepting Writer Bids' : order.status}
                            </span>

                            <Link
                              href={`/hire-writer/orders/${order.id}`}
                              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                            >
                              {orderBids.length > 0 && order.status === 'OPEN' ? 'Review Bids & Hire' : 'View Order'} <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : activeTab === 'bids' ? (
                totalBidsCount === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No writer proposals received yet</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      When accredited academic writers place bids on your open projects, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.filter(o => (bidsByOrder[o.id] || []).length > 0).map((order) => {
                      const bids = bidsByOrder[order.id] || [];
                      return (
                        <div key={order.id} className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/20 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                                Project: {order.title}
                              </span>
                              <p className="text-xs text-slate-500 mt-1">Guide Budget: {formatCurrency(order.budget)} • {bids.length} Proposals Submitted</p>
                            </div>
                            <Link
                              href={`/hire-writer/orders/${order.id}`}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                            >
                              Open Bidding Board <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                          <div className="divide-y divide-indigo-100/60 bg-white rounded-xl border border-indigo-100/80 p-3">
                            {bids.map((bid) => (
                              <div key={bid.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={bid.writer?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                                    alt={bid.writer?.full_name || 'Writer'}
                                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                                  />
                                  <div>
                                    <h5 className="font-bold text-slate-900">{bid.writer?.full_name || 'Accredited Researcher'}</h5>
                                    <p className="text-[11px] text-slate-500">{bid.proposal || 'Ready to deliver high-quality plagiarism-free research.'}</p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-black text-sm text-emerald-700">{formatCurrency(bid.bid_amount)}</p>
                                  <p className="text-[10px] text-slate-400">{formatDate(bid.created_at)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                purchasedNotes.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
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
                              {purchase.document?.course_code || 'NOTE'}
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
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Download PDF
                        </a>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

          </div>

        </div>
      </div>
    </RoleGuard>
  );
}
