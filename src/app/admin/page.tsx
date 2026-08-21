'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
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
  Loader2,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { DocumentItem, OrderItem, Profile, PayoutRequest, AdminPermission } from '@/types/database.types';
import { RoleGuard } from '@/components/layout/RoleGuard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
  LineChart, Line
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
  rose: '#e11d48',
  slate: '#64748b',
};

const PIE_COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#0284c7', '#7c3aed'];

// ─── Helper: Group records by month ──────────────────────────────────
function groupByMonth(records: { created_at: string }[]): Record<string, number> {
  const months: Record<string, number> = {};
  records.forEach(r => {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = (months[key] || 0) + 1;
  });
  return months;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`;
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

// ─── Custom Tooltip for Charts ───────────────────────────────────────
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingNotes, setPendingNotes] = useState<DocumentItem[]>([]);
  const [writerProfiles, setWriterProfiles] = useState<Profile[]>([]);
  const [disputedOrders, setDisputedOrders] = useState<OrderItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [adminTeam, setAdminTeam] = useState<Profile[]>([]);
  const [platformRevenue, setPlatformRevenue] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let fetchErrorOccurred = false;
      let errorMessage = '';

      // 1. Pending Notes for Moderation (via guaranteed API route)
      try {
        const res = await fetch('/api/admin/notes');
        const data = await res.json();
        if (res.ok && data.notes) {
          setPendingNotes(data.notes as DocumentItem[]);
        } else {
          throw new Error('API fetch not ok');
        }
      } catch (apiErr) {
        console.warn('API fetch failed, falling back to Supabase client:', apiErr);
        fetchErrorOccurred = true;
        errorMessage += 'Failed to fetch notes via API, using direct DB fallback. ';
        const { data: notes } = await supabase
          .from('documents')
          .select('*, uploader:profiles(*)')
          .eq('status', 'PENDING')
          .order('created_at', { ascending: false });
        if (notes) setPendingNotes(notes as DocumentItem[]);
      }

      // 2. Writer profiles
      const { data: writers, error: wErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'WRITER')
        .order('created_at', { ascending: false });
      
      if (wErr) {
        fetchErrorOccurred = true;
        errorMessage += 'Failed to fetch writers. ';
      } else if (writers) {
        setWriterProfiles(writers as Profile[]);
      }

      // 3. Disputed orders
      const { data: disputes, error: dErr } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'DISPUTED')
        .order('created_at', { ascending: false });

      if (dErr) {
        fetchErrorOccurred = true;
        errorMessage += 'Failed to fetch disputes. ';
      } else if (disputes) {
        setDisputedOrders(disputes as OrderItem[]);
      }

      // 4. Admin Team
      const { data: team, error: tErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'ADMIN')
        .order('created_at', { ascending: false });

      if (tErr) {
        fetchErrorOccurred = true;
        errorMessage += 'Failed to fetch admin team. ';
      } else if (team) {
        setAdminTeam(team as Profile[]);
      }

      // 5. Payouts
      const { data: pendingPayouts, error: pErr } = await supabase
        .from('payout_requests')
        .select('*, writer:profiles(*)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });
      
      if (pErr) {
        fetchErrorOccurred = true;
        errorMessage += 'Failed to fetch payouts. ';
      } else if (pendingPayouts) {
        setPayouts(pendingPayouts as PayoutRequest[]);
      }

      // ─── 6. ANALYTICS DATA ────────────────────────────────────
      // All profiles
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, role, institution, created_at');
      
      const totalUsers = allProfiles?.length || 0;
      const totalStudents = allProfiles?.filter(p => p.role === 'STUDENT').length || 0;
      const totalWriters = writers?.length || 0;
      const totalAdmins = team?.length || 0;

      // All documents
      const { data: allDocs } = await supabase
        .from('documents')
        .select('id, status, institution, price, created_at');
      
      const totalDocuments = allDocs?.length || 0;
      const approvedDocs = allDocs?.filter(d => d.status === 'APPROVED').length || 0;
      const pendingDocs = allDocs?.filter(d => d.status === 'PENDING').length || 0;
      const rejectedDocs = allDocs?.filter(d => d.status === 'REJECTED').length || 0;

      // All orders
      const { data: allOrders } = await supabase
        .from('orders')
        .select('id, status, budget, escrow_status, created_at');
      
      const totalOrders = allOrders?.length || 0;
      const openOrders = allOrders?.filter(o => o.status === 'OPEN').length || 0;
      const completedOrders = allOrders?.filter(o => o.status === 'COMPLETED').length || 0;
      const inProgressOrders = allOrders?.filter(o => ['ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW'].includes(o.status)).length || 0;
      const disputedOrdersCount = allOrders?.filter(o => o.status === 'DISPUTED').length || 0;
      const cancelledOrders = allOrders?.filter(o => o.status === 'CANCELLED').length || 0;
      const totalEscrowVolume = allOrders?.reduce((s, o) => s + (Number(o.budget) || 0), 0) || 0;

      // All transactions
      const { data: allTxns } = await supabase
        .from('transactions')
        .select('id, type, amount, description, created_at')
        .order('created_at', { ascending: false });

      const totalRevenue = allTxns?.filter(t => t.type === 'PLATFORM_FEE').reduce((s, t) => s + (Number(t.amount) || 0), 0) || 0;
      setPlatformRevenue(totalRevenue);

      const totalNoteSales = allTxns?.filter(t => t.type === 'NOTE_PURCHASE').reduce((s, t) => s + (Number(t.amount) || 0), 0) || 0;
      const totalPayoutsAmount = allTxns?.filter(t => t.type === 'ESCROW_PAYOUT' || t.type === 'WITHDRAWAL').reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0) || 0;

      // Revenue by month (last 6 months)
      const last6 = getLast6Months();
      const txnsByMonth: Record<string, { revenue: number; volume: number }> = {};
      last6.forEach(m => { txnsByMonth[m] = { revenue: 0, volume: 0 }; });
      
      allTxns?.forEach(t => {
        const d = new Date(t.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (txnsByMonth[key]) {
          txnsByMonth[key].volume += Math.abs(Number(t.amount) || 0);
          if (t.type === 'PLATFORM_FEE') {
            txnsByMonth[key].revenue += Number(t.amount) || 0;
          }
        }
      });

      const revenueByMonth = last6.map(m => ({
        month: getMonthLabel(m),
        revenue: txnsByMonth[m]?.revenue || 0,
        volume: txnsByMonth[m]?.volume || 0,
      }));

      // User growth by month
      const studentsByMonth = groupByMonth(allProfiles?.filter(p => p.role === 'STUDENT') || []);
      const writersByMonth = groupByMonth(allProfiles?.filter(p => p.role === 'WRITER') || []);
      
      const userGrowth = last6.map(m => ({
        month: getMonthLabel(m),
        students: studentsByMonth[m] || 0,
        writers: writersByMonth[m] || 0,
      }));

      // Orders by status (pie chart)
      const ordersByStatus = [
        { name: 'Open', value: openOrders, color: CHART_COLORS.sky },
        { name: 'In Progress', value: inProgressOrders, color: CHART_COLORS.indigo },
        { name: 'Completed', value: completedOrders, color: CHART_COLORS.emerald },
        { name: 'Disputed', value: disputedOrdersCount, color: CHART_COLORS.amber },
        { name: 'Cancelled', value: cancelledOrders, color: CHART_COLORS.red },
      ].filter(s => s.value > 0);

      // Documents by status (pie chart)
      const docsByStatus = [
        { name: 'Approved', value: approvedDocs, color: CHART_COLORS.emerald },
        { name: 'Pending', value: pendingDocs, color: CHART_COLORS.amber },
        { name: 'Rejected', value: rejectedDocs, color: CHART_COLORS.red },
      ].filter(s => s.value > 0);

      // Top institutions
      const instCounts: Record<string, number> = {};
      allProfiles?.forEach(p => {
        if (p.institution) {
          instCounts[p.institution] = (instCounts[p.institution] || 0) + 1;
        }
      });
      const topInstitutions = Object.entries(instCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

      // Recent transactions (last 10)
      const recentTransactions = (allTxns || []).slice(0, 10).map(t => ({
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

      if (fetchErrorOccurred) {
        setError(errorMessage.trim());
      }
    } catch (err) {
      console.error('Error fetching admin data from Supabase:', err);
      setError('An unexpected error occurred while loading admin data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApproveNote = async (id: string) => {
    try {
      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id, action: 'APPROVE' }),
      });
      if (res.ok) {
        setPendingNotes((prev) => prev.filter((n) => n.id !== id));
        showToast('Note approved and published to the live public catalog!');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to approve note.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error approving note.');
    }
  };

  const handleRejectNote = async (id: string) => {
    try {
      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id, action: 'REJECT' }),
      });
      if (res.ok) {
        setPendingNotes((prev) => prev.filter((n) => n.id !== id));
        showToast('Note rejected and removed from moderation queue.');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to reject note.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error rejecting note.');
    }
  };

  const handleApproveWriter = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('profiles').update({ is_verified_writer: true }).eq('id', id);
      setWriterProfiles((prev) =>
        prev.map((w) => (w.id === id ? { ...w, is_verified_writer: true } : w))
      );
      showToast('Writer accreditation approved! Writer can now bid on student projects.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprovePayout = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('payout_requests').update({ status: 'PROCESSED' }).eq('id', id);
      if (error) throw error;
      setPayouts(prev => prev.filter(p => p.id !== id));
      showToast('Payout request approved and marked as processed.');
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

  // Transaction type label helper
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
                  StudyNoteHub Governance & Moderation
                </h1>
                <button
                  onClick={loadAdminData}
                  disabled={isLoading}
                  className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Platform analytics, content moderation, writer vetting, escrow disputes, and payout management
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-800">Data Fetch Warning</h3>
                <p className="text-xs text-red-700/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Stats Grid — Top-level KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Total Users</span>
              <p className="text-2xl font-black text-slate-900">{analytics?.totalUsers || 0}</p>
              <span className="text-[11px] text-slate-500">All Registered</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Pending Notes</span>
              <p className="text-2xl font-black text-indigo-600">{pendingNotes.length}</p>
              <span className="text-[11px] text-slate-500">Awaiting Review</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Active Writers</span>
              <p className="text-2xl font-black text-emerald-700">{writerProfiles.length}</p>
              <span className="text-[11px] text-slate-500">Researchers</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Total Orders</span>
              <p className="text-2xl font-black text-sky-700">{analytics?.totalOrders || 0}</p>
              <span className="text-[11px] text-slate-500">All Time</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Escrow Disputes</span>
              <p className="text-2xl font-black text-amber-600">{disputedOrders.length}</p>
              <span className="text-[11px] text-slate-500">Arbitration Queue</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400">Platform Rev</span>
              <p className="text-2xl font-black text-indigo-900">{formatCurrency(platformRevenue)}</p>
              <span className="text-[11px] text-slate-500">Fees Earned</span>
            </div>
          </div>

          {/* Tab Navigation & Content */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            
            <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'analytics'
                    ? 'text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Analytics & Charts
              </button>

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
                onClick={() => setActiveTab('payouts')}
                className={`pb-4 transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'payouts'
                    ? 'text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4" /> Pending Payouts ({payouts.length})
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
              ) : activeTab === 'analytics' && analytics ? (
                /* ═══════════════════════════════════════════════════════
                   ANALYTICS TAB — Charts & Detailed Statistics
                   ═══════════════════════════════════════════════════════ */
                <div className="space-y-8">
                  
                  {/* Row 1: Financial Summary Cards */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Financial Overview
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/50 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-indigo-500">Platform Revenue</span>
                        <p className="text-xl font-black text-indigo-900">{formatCurrency(analytics.totalRevenue)}</p>
                        <span className="text-[10px] text-indigo-600 flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" /> Commission fees collected
                        </span>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-emerald-500">Total Note Sales</span>
                        <p className="text-xl font-black text-emerald-900">{formatCurrency(analytics.totalNoteSales)}</p>
                        <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                          <BookOpen className="w-3 h-3" /> Study material purchases
                        </span>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100/50 border border-sky-200/50 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-sky-500">Escrow Volume</span>
                        <p className="text-xl font-black text-sky-900">{formatCurrency(analytics.totalEscrowVolume)}</p>
                        <span className="text-[10px] text-sky-600 flex items-center gap-0.5">
                          <Shield className="w-3 h-3" /> Total order budgets
                        </span>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200/50 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-violet-500">Writer Payouts</span>
                        <p className="text-xl font-black text-violet-900">{formatCurrency(analytics.totalPayouts)}</p>
                        <span className="text-[10px] text-violet-600 flex items-center gap-0.5">
                          <ArrowDownRight className="w-3 h-3" /> Released to writers
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Revenue & Volume Area Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-indigo-600" />
                          Revenue & Transaction Volume (6 months)
                        </h4>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.revenueByMonth}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.indigo} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={CHART_COLORS.indigo} stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="volume" name="Transaction Volume" stroke={CHART_COLORS.emerald} fill="url(#colorVolume)" strokeWidth={2} />
                            <Area type="monotone" dataKey="revenue" name="Platform Revenue" stroke={CHART_COLORS.indigo} fill="url(#colorRevenue)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* User Growth Bar Chart */}
                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        New User Registrations (6 months)
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics.userGrowth} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar dataKey="students" name="Students" fill={CHART_COLORS.indigo} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="writers" name="Writers" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Pie Charts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Orders by Status */}
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
                          No order data yet
                        </div>
                      )}
                    </div>

                    {/* Documents by Status */}
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
                          No document data yet
                        </div>
                      )}
                    </div>

                    {/* User Distribution */}
                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-violet-600" />
                        User Distribution
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

                  {/* Row 4: Top Institutions & Recent Transactions */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Institutions Bar Chart */}
                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        Top Institutions by User Count
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

                    {/* Recent Transactions Table */}
                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        Recent Transactions
                      </h4>
                      {analytics.recentTransactions.length > 0 ? (
                        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                          {analytics.recentTransactions.map((txn) => (
                            <div key={txn.id} className="py-3 flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${txnTypeColor(txn.type)}`}>
                                    {txnTypeLabel(txn.type)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 truncate">
                                  {txn.description}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-sm font-black ${txn.amount >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
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

                  {/* Row 5: Detailed Platform Stats Table */}
                  <div className="p-6 rounded-2xl border border-slate-200/80 bg-white space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-slate-600" />
                      Platform Statistics Summary
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4">
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-1">Users</h5>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Total Users</span><span className="font-bold text-slate-900">{analytics.totalUsers}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Students</span><span className="font-bold text-indigo-700">{analytics.totalStudents}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Writers</span><span className="font-bold text-emerald-700">{analytics.totalWriters}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Admins</span><span className="font-bold text-violet-700">{analytics.totalAdmins}</span></div>
                      </div>
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-1">Documents</h5>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Total Uploaded</span><span className="font-bold text-slate-900">{analytics.totalDocuments}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Approved</span><span className="font-bold text-emerald-700">{analytics.approvedDocs}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Pending</span><span className="font-bold text-amber-700">{analytics.pendingDocs}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Rejected</span><span className="font-bold text-red-700">{analytics.rejectedDocs}</span></div>
                      </div>
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-1">Orders</h5>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Total Orders</span><span className="font-bold text-slate-900">{analytics.totalOrders}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Open</span><span className="font-bold text-sky-700">{analytics.openOrders}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">In Progress</span><span className="font-bold text-indigo-700">{analytics.inProgressOrders}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Completed</span><span className="font-bold text-emerald-700">{analytics.completedOrders}</span></div>
                      </div>
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-1">Financials</h5>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Platform Rev</span><span className="font-bold text-indigo-700">{formatCurrency(analytics.totalRevenue)}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Note Sales</span><span className="font-bold text-emerald-700">{formatCurrency(analytics.totalNoteSales)}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Escrow Vol</span><span className="font-bold text-sky-700">{formatCurrency(analytics.totalEscrowVolume)}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-600">Payouts</span><span className="font-bold text-violet-700">{formatCurrency(analytics.totalPayouts)}</span></div>
                      </div>
                    </div>
                  </div>
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
                      <div key={note.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                              {note.course_code}
                            </span>
                            <span className="text-xs text-slate-400">{note.institution}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>
                          {note.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">{note.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>Price: {Number(note.price) === 0 ? 'FREE' : formatCurrency(note.price)}</span>
                            <span>•</span>
                            <span>Uploader: {note.uploader?.full_name || 'Author'}</span>
                            <span>•</span>
                            <a 
                              href={note.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View File
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
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
              ) : activeTab === 'payouts' ? (
                payouts.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No Pending Payouts</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      All writer withdrawal requests have been processed.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{payout.writer?.full_name || 'Unknown Writer'}</h4>
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
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
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
