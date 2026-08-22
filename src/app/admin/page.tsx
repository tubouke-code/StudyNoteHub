'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Eye,
  Sparkles,
  Award,
  RefreshCw,
  GraduationCap,
  Loader2,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, getDocumentFileUrl } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { DocumentItem, OrderItem, Profile, PayoutRequest } from '@/types/database.types';
import { RoleGuard } from '@/components/layout/RoleGuard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';

// ─── Analytics Data Types ────────────────────────────────────────────
interface AnalyticsData {
  totalUsers: number;
  totalStudents: number;
  totalWriters: number;
  totalAdmins: number;
  totalDocuments: number;
  approvedDocs: number;
  pendingDocs: number;
  rejectedDocs: number;
  totalOrders: number;
  openOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  disputedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalEscrowVolume: number;
  totalNoteSales: number;
  totalPayouts: number;
  revenueByMonth: { month: string; revenue: number; volume: number }[];
  ordersByStatus: { name: string; value: number; color: string }[];
  docsByStatus: { name: string; value: number; color: string }[];
  userGrowth: { month: string; students: number; writers: number }[];
  topInstitutions: { name: string; count: number }[];
  recentTransactions: { id: string; type: string; amount: number; description: string; date: string }[];
}

const CHART_COLORS = {
  indigo: '#4f46e5',
  emerald: '#059669',
  amber: '#d97706',
  red: '#dc2626',
  sky: '#0284c7',
  violet: '#7c3aed',
};

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month, 10) - 1]} ${year.slice(2)}`;
}

function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl text-xs border border-slate-700">
      <p className="font-bold text-slate-300 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'moderation' | 'vetting' | 'disputes' | 'payouts' | 'team'>('analytics');
  const [docFilterStatus, setDocFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allNotes, setAllNotes] = useState<DocumentItem[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [writerProfiles, setWriterProfiles] = useState<Profile[]>([]);
  const [disputedOrders, setDisputedOrders] = useState<OrderItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [adminTeam, setAdminTeam] = useState<Profile[]>([]);
  const [platformRevenue, setPlatformRevenue] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ─── Fast Robust Data Fetching ──────────────────────────────────────
  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Parallel direct queries using active Supabase browser client
      const [
        profilesRes,
        docsRes,
        ordersRes,
        txnsRes,
        disputesRes,
        payoutsRes
      ] = await Promise.allSettled([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').eq('status', 'DISPUTED').order('created_at', { ascending: false }),
        supabase.from('payout_requests').select('*').order('created_at', { ascending: false }),
      ]);

      // Profiles
      const rawProfiles = (profilesRes.status === 'fulfilled' && profilesRes.value.data) ? profilesRes.value.data as Profile[] : [];
      setAllProfiles(rawProfiles);

      const writers = rawProfiles.filter(p => p.role === 'WRITER' || p.is_verified_writer);
      setWriterProfiles(writers);

      const team = rawProfiles.filter(p => p.role === 'ADMIN' || p.email === 'orukari878@gmail.com');
      setAdminTeam(team);

      // Documents
      const docs: DocumentItem[] = (docsRes.status === 'fulfilled' && docsRes.value.data) 
        ? (docsRes.value.data as DocumentItem[]) 
        : [];
      setAllNotes(docs);

      // Orders & Disputes
      const orders = (ordersRes.status === 'fulfilled' && ordersRes.value.data) ? ordersRes.value.data as OrderItem[] : [];
      const disputes = (disputesRes.status === 'fulfilled' && disputesRes.value.data) ? disputesRes.value.data as OrderItem[] : [];
      setDisputedOrders(disputes);

      // Transactions
      const txns = (txnsRes.status === 'fulfilled' && txnsRes.value.data) ? txnsRes.value.data : [];

      // Payouts (safely handled if table does not exist)
      const rawPayouts = (payoutsRes.status === 'fulfilled' && payoutsRes.value.data) ? payoutsRes.value.data as PayoutRequest[] : [];
      setPayouts(rawPayouts);

      // Compute Analytics
      const totalUsers = rawProfiles.length;
      const totalStudents = rawProfiles.filter(p => p.role === 'STUDENT' && !p.is_verified_writer).length;
      const totalWriters = writers.length;
      const totalAdmins = team.length;

      const totalDocuments = docs.length;
      const approvedDocs = docs.filter(d => d.status === 'APPROVED').length;
      const pendingDocs = docs.filter(d => d.status === 'PENDING').length;
      const rejectedDocs = docs.filter(d => d.status === 'REJECTED').length;

      const totalOrders = orders.length;
      const openOrders = orders.filter(o => o.status === 'OPEN').length;
      const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
      const inProgressOrders = orders.filter(o => ['ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW'].includes(o.status)).length;
      const disputedOrdersCount = orders.filter(o => o.status === 'DISPUTED').length;
      const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
      const totalEscrowVolume = orders.reduce((s, o) => s + (Number(o.budget) || 0), 0);

      const totalRevenue = txns.filter((t: any) => t.type === 'PLATFORM_FEE').reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0);
      setPlatformRevenue(totalRevenue);

      const totalNoteSales = txns.filter((t: any) => t.type === 'NOTE_PURCHASE').reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0);
      const totalPayoutsAmount = txns.filter((t: any) => t.type === 'ESCROW_PAYOUT' || t.type === 'WITHDRAWAL').reduce((s: number, t: any) => s + Math.abs(Number(t.amount) || 0), 0);

      // Monthly aggregation
      const last6 = getLast6Months();
      const txnsByMonth: Record<string, { revenue: number; volume: number }> = {};
      const studentsByMonth: Record<string, number> = {};
      const writersByMonth: Record<string, number> = {};

      last6.forEach(m => {
        txnsByMonth[m] = { revenue: 0, volume: 0 };
        studentsByMonth[m] = 0;
        writersByMonth[m] = 0;
      });

      txns.forEach((t: any) => {
        const d = new Date(t.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (txnsByMonth[key]) {
          txnsByMonth[key].volume += Math.abs(Number(t.amount) || 0);
          if (t.type === 'PLATFORM_FEE') {
            txnsByMonth[key].revenue += Number(t.amount) || 0;
          }
        }
      });

      rawProfiles.forEach(p => {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (p.role === 'WRITER' || p.is_verified_writer) {
          if (writersByMonth[key] !== undefined) writersByMonth[key]++;
        } else {
          if (studentsByMonth[key] !== undefined) studentsByMonth[key]++;
        }
      });

      const revenueByMonth = last6.map(m => ({
        month: getMonthLabel(m),
        revenue: txnsByMonth[m]?.revenue || 0,
        volume: txnsByMonth[m]?.volume || 0,
      }));

      const userGrowth = last6.map(m => ({
        month: getMonthLabel(m),
        students: studentsByMonth[m] || 0,
        writers: writersByMonth[m] || 0,
      }));

      const ordersByStatus = [
        { name: 'Open', value: openOrders, color: CHART_COLORS.sky },
        { name: 'In Progress', value: inProgressOrders, color: CHART_COLORS.indigo },
        { name: 'Completed', value: completedOrders, color: CHART_COLORS.emerald },
        { name: 'Disputed', value: disputedOrdersCount, color: CHART_COLORS.amber },
        { name: 'Cancelled', value: cancelledOrders, color: CHART_COLORS.red },
      ].filter(s => s.value > 0);

      const docsByStatus = [
        { name: 'Approved', value: approvedDocs, color: CHART_COLORS.emerald },
        { name: 'Pending', value: pendingDocs, color: CHART_COLORS.amber },
        { name: 'Rejected', value: rejectedDocs, color: CHART_COLORS.red },
      ].filter(s => s.value > 0);

      const instCounts: Record<string, number> = {};
      rawProfiles.forEach(p => {
        if (p.institution) {
          instCounts[p.institution] = (instCounts[p.institution] || 0) + 1;
        }
      });
      const topInstitutions = Object.entries(instCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

      const recentTransactions = txns.slice(0, 10).map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount) || 0,
        description: t.description || t.type,
        date: t.created_at,
      }));

      setAnalytics({
        totalUsers,
        totalStudents,
        totalWriters,
        totalAdmins,
        totalDocuments,
        approvedDocs,
        pendingDocs,
        rejectedDocs,
        totalOrders,
        openOrders,
        completedOrders,
        inProgressOrders,
        disputedOrders: disputedOrdersCount,
        cancelledOrders,
        totalRevenue,
        totalEscrowVolume,
        totalNoteSales,
        totalPayouts: totalPayoutsAmount,
        revenueByMonth,
        ordersByStatus,
        docsByStatus,
        userGrowth,
        topInstitutions,
        recentTransactions,
      });

    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError('Unable to load live admin data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // ─── Filtered Notes Logic ──────────────────────────────────────────
  const pendingNotesCount = useMemo(() => allNotes.filter(n => n.status === 'PENDING').length, [allNotes]);
  const approvedNotesCount = useMemo(() => allNotes.filter(n => n.status === 'APPROVED').length, [allNotes]);
  const rejectedNotesCount = useMemo(() => allNotes.filter(n => n.status === 'REJECTED').length, [allNotes]);

  const filteredNotes = useMemo(() => {
    return allNotes.filter(note => {
      // Status filter
      if (docFilterStatus !== 'ALL' && note.status !== docFilterStatus) {
        return false;
      }
      // Search query filter
      if (docSearchQuery.trim()) {
        const q = docSearchQuery.toLowerCase();
        const titleMatch = (note.title || '').toLowerCase().includes(q);
        const codeMatch = (note.course_code || '').toLowerCase().includes(q);
        const instMatch = (note.institution || '').toLowerCase().includes(q);
        const uploaderMatch = (note.uploader?.full_name || '').toLowerCase().includes(q);
        return titleMatch || codeMatch || instMatch || uploaderMatch;
      }
      return true;
    });
  }, [allNotes, docFilterStatus, docSearchQuery]);

  // ─── Moderation Actions ────────────────────────────────────────────
  const handleUpdateNoteStatus = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const supabase = createClient();
      const { error } = await supabase.from('documents').update({ status: newStatus }).eq('id', id);

      if (error) {
        // Fallback to API route
        const res = await fetch('/api/admin/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: id, action }),
        });
        if (!res.ok) throw new Error('API moderation update failed');
      }

      setAllNotes(prev => prev.map(n => n.id === id ? { ...n, status: newStatus } : n));
      showToast(action === 'APPROVE' ? 'Document approved and published to live catalog!' : 'Document marked as rejected.');
    } catch (err: any) {
      console.error(err);
      showToast('Error updating document status.');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this document from the database? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/notes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to delete from database');
      }
      setAllNotes(prev => prev.filter(n => n.id !== id));
      showToast('Document permanently removed from database.');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to delete document.');
    }
  };

  const handleApproveWriter = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('profiles').update({ is_verified_writer: true, role: 'WRITER' }).eq('id', id);
      setWriterProfiles(prev => prev.map(w => w.id === id ? { ...w, is_verified_writer: true, role: 'WRITER' } : w));
      showToast('Writer accreditation approved!');
    } catch (err) {
      console.error(err);
      showToast('Failed to verify writer.');
    }
  };

  const handleApprovePayout = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('payout_requests').update({ status: 'PROCESSED' }).eq('id', id);
      if (error) throw error;
      setPayouts(prev => prev.filter(p => p.id !== id));
      showToast('Payout approved and marked processed.');
    } catch (err) {
      console.error(err);
      showToast('Failed to approve payout.');
    }
  };

  const handleRejectPayout = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('payout_requests').update({ status: 'REJECTED' }).eq('id', id);
      if (error) throw error;
      setPayouts(prev => prev.filter(p => p.id !== id));
      showToast('Payout request rejected.');
    } catch (err) {
      console.error(err);
      showToast('Failed to reject payout.');
    }
  };

  const txnTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      WALLET_DEPOSIT: 'Wallet Deposit',
      NOTE_PURCHASE: 'Note Purchase',
      NOTE_SALE_ROYALTY: 'Royalty Payout',
      ESCROW_LOCK: 'Escrow Lock',
      ESCROW_PAYOUT: 'Escrow Release',
      PLATFORM_FEE: 'Platform Fee',
      WITHDRAWAL: 'Withdrawal',
      REFUND: 'Refund',
    };
    return map[type] || type;
  };

  const txnTypeColor = (type: string) => {
    const map: Record<string, string> = {
      PLATFORM_FEE: 'bg-indigo-100 text-indigo-800',
      NOTE_PURCHASE: 'bg-sky-100 text-sky-800',
      NOTE_SALE_ROYALTY: 'bg-emerald-100 text-emerald-800',
      ESCROW_LOCK: 'bg-amber-100 text-amber-800',
      ESCROW_PAYOUT: 'bg-emerald-100 text-emerald-800',
      WALLET_DEPOSIT: 'bg-violet-100 text-violet-800',
      WITHDRAWAL: 'bg-red-100 text-red-800',
      REFUND: 'bg-red-100 text-red-800',
    };
    return map[type] || 'bg-slate-100 text-slate-800';
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Floating Toast Notification */}
          {toastMessage && (
            <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold">{toastMessage}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                  Super Admin Operations Center
                </span>
                <span className="text-xs text-slate-400">Authenticated: {user?.email}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  StudyNoteHub Governance & Operations
                </h1>
                <button
                  onClick={loadAdminData}
                  disabled={isLoading}
                  className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  title="Reload Live Platform Data"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time business analytics, study materials moderation, writer vetting, escrow arbitration & payouts
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-800">Connection Notice</h3>
                <p className="text-xs text-red-700/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Total Users</span>
              <p className="text-2xl font-black text-slate-900">{analytics?.totalUsers || allProfiles.length || 0}</p>
              <span className="text-[11px] text-slate-500">Registered Accounts</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Pending Review</span>
              <p className="text-2xl font-black text-amber-600">{pendingNotesCount}</p>
              <span className="text-[11px] text-slate-500">Materials Queue</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">All Materials</span>
              <p className="text-2xl font-black text-indigo-600">{allNotes.length}</p>
              <span className="text-[11px] text-slate-500">{approvedNotesCount} Live Published</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Active Writers</span>
              <p className="text-2xl font-black text-emerald-700">{writerProfiles.length}</p>
              <span className="text-[11px] text-slate-500">Accredited Researchers</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Escrow Disputes</span>
              <p className="text-2xl font-black text-red-600">{disputedOrders.length}</p>
              <span className="text-[11px] text-slate-500">Arbitration Queue</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Platform Revenue</span>
              <p className="text-2xl font-black text-indigo-900">{formatCurrency(platformRevenue)}</p>
              <span className="text-[11px] text-slate-500">Commission Earned</span>
            </div>
          </div>

          {/* Main Navigation & Tab Content */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            
            <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Platform Analytics & Charts
              </button>

              <button
                onClick={() => setActiveTab('moderation')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'moderation'
                    ? 'text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" /> Material Catalog & Moderation ({allNotes.length})
              </button>

              <button
                onClick={() => setActiveTab('vetting')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'vetting'
                    ? 'text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Writer Accreditation ({writerProfiles.length})
              </button>

              <button
                onClick={() => setActiveTab('disputes')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'disputes'
                    ? 'text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4" /> Escrow Disputes ({disputedOrders.length})
              </button>

              <button
                onClick={() => setActiveTab('payouts')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'payouts'
                    ? 'text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4" /> Writer Payouts ({payouts.length})
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'team'
                    ? 'text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" /> Admin Staff ({adminTeam.length || 1})
              </button>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-sm font-semibold">Loading real-time platform data...</span>
                </div>
              ) : activeTab === 'analytics' && analytics ? (
                /* ═══════════════════════════════════════════════════════
                   TAB 1: ANALYTICS & VISUAL CHARTS
                   ═══════════════════════════════════════════════════════ */
                <div className="space-y-8">
                  {/* Financial Breakdown Cards */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Financial Intelligence Overview
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/50 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-indigo-500">Platform Revenue</span>
                        <p className="text-xl font-black text-indigo-900">{formatCurrency(analytics.totalRevenue)}</p>
                        <span className="text-[10px] text-indigo-600 flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" /> Net commission collected
                        </span>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-emerald-500">Study Note Sales</span>
                        <p className="text-xl font-black text-emerald-900">{formatCurrency(analytics.totalNoteSales)}</p>
                        <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                          <BookOpen className="w-3 h-3" /> Digital download purchases
                        </span>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100/50 border border-sky-200/50 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-sky-500">Escrow Volume</span>
                        <p className="text-xl font-black text-sky-900">{formatCurrency(analytics.totalEscrowVolume)}</p>
                        <span className="text-[10px] text-sky-600 flex items-center gap-0.5">
                          <Shield className="w-3 h-3" /> Custom project budgets
                        </span>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200/50 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-violet-500">Writer Payouts</span>
                        <p className="text-xl font-black text-violet-900">{formatCurrency(analytics.totalPayouts)}</p>
                        <span className="text-[10px] text-violet-600 flex items-center gap-0.5">
                          <ArrowDownRight className="w-3 h-3" /> Disbursed to writers
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue & Volume Area Chart + User Growth Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-600" />
                        Monthly Revenue & Transaction Volume (6M)
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.revenueByMonth}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.indigo} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={CHART_COLORS.indigo} stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => typeof v === 'number' && !isNaN(v) ? `₦${(v / 1000).toFixed(0)}k` : '₦0'} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="volume" name="Transaction Volume" stroke={CHART_COLORS.emerald} fill="url(#colorVol)" strokeWidth={2} />
                            <Area type="monotone" dataKey="revenue" name="Platform Revenue" stroke={CHART_COLORS.indigo} fill="url(#colorRev)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        New User Registrations (6M)
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics.userGrowth} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar dataKey="students" name="Students / Hirers" fill={CHART_COLORS.indigo} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="writers" name="Writers / Researchers" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Distribution Charts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4 text-sky-600" />
                        Orders by Status
                      </h4>
                      {analytics.ordersByStatus.length > 0 ? (
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analytics.ordersByStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                              >
                                {analytics.ordersByStatus.map((entry, idx) => (
                                  <Cell key={idx} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-52 flex items-center justify-center text-xs text-slate-400">
                          No order records found
                        </div>
                      )}
                    </div>

                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        Documents by Status
                      </h4>
                      {analytics.docsByStatus.length > 0 ? (
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analytics.docsByStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                              >
                                {analytics.docsByStatus.map((entry, idx) => (
                                  <Cell key={idx} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-52 flex items-center justify-center text-xs text-slate-400">
                          No document records found
                        </div>
                      )}
                    </div>

                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-violet-600" />
                        User Base Split
                      </h4>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Students', value: analytics.totalStudents, color: CHART_COLORS.indigo },
                                { name: 'Writers', value: analytics.totalWriters, color: CHART_COLORS.emerald },
                                { name: 'Admins', value: analytics.totalAdmins, color: CHART_COLORS.violet },
                              ].filter(s => s.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="value"
                              strokeWidth={0}
                            >
                              {[CHART_COLORS.indigo, CHART_COLORS.emerald, CHART_COLORS.violet].map((color, idx) => (
                                <Cell key={idx} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Top Institutions & Recent Transactions Stream */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        Top Institutions by User Base
                      </h4>
                      {analytics.topInstitutions.length > 0 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.topInstitutions} layout="vertical" margin={{ left: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={140} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="count" name="Users" fill={CHART_COLORS.indigo} radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                          No institution data available
                        </div>
                      )}
                    </div>

                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        Live Platform Transaction Audit Feed
                      </h4>
                      {analytics.recentTransactions.length > 0 ? (
                        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                          {analytics.recentTransactions.map((txn) => (
                            <div key={txn.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${txnTypeColor(txn.type)}`}>
                                    {txnTypeLabel(txn.type)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                  {txn.description}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`font-black ${txn.amount >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                  {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                                </p>
                                <p className="text-[10px] text-slate-400">{formatDate(txn.date)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                          No transactions recorded yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'moderation' ? (
                /* ═══════════════════════════════════════════════════════
                   TAB 2: MATERIAL CATALOG & MODERATION (ALL NOTES)
                   ═══════════════════════════════════════════════════════ */
                <div className="space-y-6">
                  {/* Status Filters & Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto text-xs font-bold">
                      <button
                        onClick={() => setDocFilterStatus('ALL')}
                        className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          docFilterStatus === 'ALL'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>All Materials ({allNotes.length})</span>
                      </button>
                      <button
                        onClick={() => setDocFilterStatus('PENDING')}
                        className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          docFilterStatus === 'PENDING'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Pending Review ({pendingNotesCount})</span>
                      </button>
                      <button
                        onClick={() => setDocFilterStatus('APPROVED')}
                        className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          docFilterStatus === 'APPROVED'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Approved ({approvedNotesCount})</span>
                      </button>
                      <button
                        onClick={() => setDocFilterStatus('REJECTED')}
                        className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          docFilterStatus === 'REJECTED'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Rejected ({rejectedNotesCount})</span>
                      </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={docSearchQuery}
                        onChange={(e) => setDocSearchQuery(e.target.value)}
                        placeholder="Search title, course code, school..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 bg-white"
                      />
                    </div>
                  </div>

                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-16 space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {allNotes.length === 0 ? 'No study materials in the database' : 'No documents match this filter'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        {allNotes.length === 0 
                          ? 'Uploaded study materials and final year projects from writers will appear here in real-time.'
                          : 'Try changing the status tab above or searching for another keyword.'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredNotes.map((note) => (
                        <div key={note.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                                {note.course_code || 'MATERIAL'}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">{note.institution}</span>
                              {note.level && (
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {note.level}
                                </span>
                              )}
                              {note.status === 'APPROVED' ? (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  ✓ Live Approved
                                </span>
                              ) : note.status === 'REJECTED' ? (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800">
                                  ✕ Rejected
                                </span>
                              ) : (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                  ⏳ Awaiting Moderation
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 leading-snug">{note.title}</h4>
                            
                            {note.description && (
                              <p className="text-xs text-slate-600 line-clamp-2">{note.description}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                              <span className="font-semibold text-slate-700">
                                Price: {Number(note.price) === 0 ? 'FREE' : formatCurrency(note.price)}
                              </span>
                              <span>•</span>
                              <span>Uploader: {note.uploader?.full_name || 'Academic Writer'}</span>
                              <span>•</span>
                              <span>{note.downloads_count || 0} downloads</span>
                              <span>•</span>
                              <span>{formatDate(note.created_at)}</span>
                              <span>•</span>
                              <Link 
                                href={`/notes/${note.id}`}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-md transition-colors"
                              >
                                <Eye className="w-3 h-3" /> Preview Note Page
                              </Link>
                              {note.file_path && (
                                <>
                                  <span>•</span>
                                  <a 
                                    href={getDocumentFileUrl(note.file_path, note.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-md transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" /> View / Download Document
                                  </a>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Admin Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0 pt-1">
                            {note.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateNoteStatus(note.id, 'APPROVE')}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                              </button>
                            )}
                            {note.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleUpdateNoteStatus(note.id, 'REJECT')}
                                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeTab === 'vetting' ? (
                /* ═══════════════════════════════════════════════════════
                   TAB 3: WRITER ACCREDITATION & VETTING
                   ═══════════════════════════════════════════════════════ */
                writerProfiles.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No writer registrations yet</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Writers and researchers registered on StudyNoteHub will be listed here for accreditation.
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
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{writer.full_name}</h4>
                              {writer.is_verified_writer && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{writer.email} • {writer.institution || 'Independent Researcher'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {writer.is_verified_writer ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Accredited Writer
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveWriter(writer.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
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
                /* ═══════════════════════════════════════════════════════
                   TAB 4: ESCROW DISPUTE ARBITRATION
                   ═══════════════════════════════════════════════════════ */
                disputedOrders.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Zero Active Escrow Disputes</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      All project deliverables have proceeded smoothly without student-writer escalation.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {disputedOrders.map((ord) => (
                      <div key={ord.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800">
                            Dispute #{ord.id.slice(0, 8)}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{ord.title}</h4>
                          <p className="text-xs text-slate-500">Escrow Locked: {formatCurrency(ord.budget)} • Service: {ord.service_type}</p>
                        </div>
                        <Link
                          href={`/hire-writer/orders/${ord.id}`}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                        >
                          Open Dispute Workspace <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              ) : activeTab === 'payouts' ? (
                /* ═══════════════════════════════════════════════════════
                   TAB 5: WRITER PAYOUT REQUESTS
                   ═══════════════════════════════════════════════════════ */
                payouts.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No Pending Payout Requests</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      All writer bank withdrawals have been processed.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{payout.writer?.full_name || 'Researcher'}</h4>
                          <p className="text-xs text-slate-500 font-mono mt-1">
                            {payout.bank_name} • {payout.account_number} • {payout.account_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-slate-900">{formatCurrency(payout.amount)}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprovePayout(payout.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Disburse
                            </button>
                            <button
                              onClick={() => handleRejectPayout(payout.id)}
                              className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* ═══════════════════════════════════════════════════════
                   TAB 6: ADMIN STAFF
                   ═══════════════════════════════════════════════════════ */
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
    </RoleGuard>
  );
}
