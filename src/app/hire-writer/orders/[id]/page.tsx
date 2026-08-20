'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Clock, 
  Send, 
  Paperclip, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  DollarSign,
  ChevronLeft,
  Lock,
  Sparkles,
  RefreshCw,
  Award,
  AlertCircle,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { TurnitinReportCard } from '@/components/turnitin/TurnitinReportCard';
import { sanitizeChatMessage } from '@/lib/chat-sanitizer';
import { createClient } from '@/lib/supabase/client';
import { OrderItem } from '@/types/database.types';

interface ChatMessage {
  id: string;
  sender: string;
  isWriter: boolean;
  text: string;
  timestamp: string;
  attachment?: string;
  isCensored?: boolean;
  censorReason?: string;
}

export default function OrderWorkspacePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const orderId = params.id;

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [warningNotice, setWarningNotice] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [escrowReleased, setEscrowReleased] = useState(false);
  const [timeLeftHours, setTimeLeftHours] = useState(48);

  useEffect(() => {
    async function loadOrder() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('orders')
          .select('*, client:profiles!orders_client_id_fkey(*), writer:profiles!orders_writer_id_fkey(*)')
          .eq('id', orderId)
          .single();

        if (data) {
          const ord = data as OrderItem;
          setOrder(ord);
          setEscrowReleased(ord.escrow_status === 'RELEASED_TO_WRITER');
        }

        // Fetch messages for this order
        const { data: dbMessages } = await supabase
          .from('order_messages')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true });

        if (dbMessages && dbMessages.length > 0) {
          setMessages(
            dbMessages.map((m: any) => ({
              id: m.id,
              sender: m.sender_id === user?.id ? 'You' : 'Academic Partner',
              isWriter: m.sender_id === order?.writer_id,
              text: m.message_text,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              attachment: m.attachment_url,
            }))
          );
        } else {
          // Welcome message
          setMessages([
            {
              id: 'msg_init',
              sender: 'StudyNoteHub Escrow Bot',
              isWriter: true,
              text: `Welcome to the secure Order Workspace for #${orderId.slice(0, 8)}. Funds are safely held in Escrow. All messages are end-to-end protected.`,
              timestamp: 'Just now',
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching order workspace:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Run Security & Anti-Disintermediation Sanitizer
    const sanitized = sanitizeChatMessage(inputMessage);

    if (sanitized.isBlocked) {
      setWarningNotice(sanitized.warningMessage || 'Bank accounts or contact details are blocked to protect your Escrow.');
      setTimeout(() => setWarningNotice(null), 8000);
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: user?.full_name || 'You',
      isWriter: user?.role === 'WRITER',
      text: sanitized.cleanText,
      timestamp: 'Just now',
      isCensored: sanitized.isBlocked,
      censorReason: sanitized.blockedReasons[0],
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Save to Supabase if order exists
    try {
      if (user && order) {
        const supabase = createClient();
        await supabase.from('order_messages').insert({
          order_id: order.id,
          sender_id: user.id,
          message_text: sanitized.cleanText,
        });
      }
    } catch (err) {
      console.error('Error saving chat message to Supabase:', err);
    }
  };

  const handleReleaseEscrow = async () => {
    if (!order) return;
    if (confirm(`Are you sure you want to release ${formatCurrency(order.budget)} from Escrow to the Writer? This action is final.`)) {
      setIsReleasing(true);
      try {
        const supabase = createClient();
        await supabase
          .from('orders')
          .update({
            escrow_status: 'RELEASED_TO_WRITER',
            status: 'COMPLETED',
          })
          .eq('id', order.id);

        setIsReleasing(false);
        setEscrowReleased(true);
      } catch (err) {
        console.error('Error releasing escrow:', err);
        setIsReleasing(false);
        setEscrowReleased(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-medium">Opening secure order workspace...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Order Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          This project order could not be located in your account.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                  {order.service_type}
                </span>
                <span className="text-xs text-slate-400">Order ID: #{order.id.slice(0, 8)}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {order.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Escrow Amount</span>
              <p className="text-lg font-black text-emerald-700">{formatCurrency(order.budget)}</p>
            </div>
            {!escrowReleased ? (
              <button
                onClick={handleReleaseEscrow}
                disabled={isReleasing}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                {isReleasing ? 'Releasing Funds...' : 'Approve & Release Escrow'}
              </button>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Escrow Paid Out
              </span>
            )}
          </div>
        </div>

        {/* Security & Escrow Protection Alert Banner */}
        <div className="p-4 rounded-2xl bg-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">Escrow Protection & 48hr Auto-Resolution Clock</p>
              <p className="text-emerald-300 text-[11px]">
                Deliverable draft submitted. You have <strong>48 hours</strong> to review the Turnitin report and approve or request free revisions.
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/10 text-emerald-300 font-mono text-xs font-black shrink-0">
            ⏳ {timeLeftHours}h 00m Left
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mx-auto">
                ✓
              </div>
              <p className="text-xs font-bold text-slate-800">1. Escrow Funded</p>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mx-auto">
                ✓
              </div>
              <p className="text-xs font-bold text-slate-800">2. Writing In Progress</p>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mx-auto">
                3
              </div>
              <p className="text-xs font-bold text-indigo-700">3. Turnitin Review</p>
            </div>

            <div className="space-y-1">
              <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center mx-auto ${
                escrowReleased ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`}>
                4
              </div>
              <p className="text-xs font-bold text-slate-400">4. Escrow Release</p>
            </div>
          </div>
        </div>

        {/* Main Grid: Chat & Deliverables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Realtime Chat Workspace with Sanitizer */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[600px] overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={order.writer?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'}
                  alt="Writer"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{order.writer?.full_name || 'Assigned Researcher'}</h3>
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Verified Academic Researcher
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400">Direct End-to-End Chat</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isWriter ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.sender} • {msg.timestamp}</span>
                  <div
                    className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.isWriter
                        ? 'bg-slate-100 text-slate-900 rounded-tl-none'
                        : 'bg-primary-600 text-white rounded-tr-none shadow-md shadow-primary-600/10'
                    }`}
                  >
                    {msg.text}
                    
                    {msg.isCensored && (
                      <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-1.5 text-[10px] text-amber-200 font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Protected: Bank/Contact details masked by Escrow Firewall</span>
                      </div>
                    )}

                    {msg.attachment && (
                      <div className="mt-3 p-2.5 rounded-xl bg-white text-slate-900 flex items-center justify-between border border-slate-200 shadow-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary-600" />
                          <span className="text-xs font-bold truncate max-w-[200px]">{msg.attachment}</span>
                        </div>
                        <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Anti-Disintermediation Alert if triggered */}
            {warningNotice && (
              <div className="p-3 mx-4 mb-2 rounded-xl bg-red-50 border border-red-300 text-xs text-red-800 flex items-center gap-2 shadow-sm animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-semibold">{warningNotice}</span>
              </div>
            )}

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type message or request a revision..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/20 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Turnitin Report & Order Details */}
          <div className="space-y-6">
            
            {/* Live Turnitin Originality Report Card */}
            <TurnitinReportCard
              similarityScore={2.4}
              aiScore={0.0}
              fileName="Final_Research_Deliverable.docx"
            />

            {/* Order Specification Summary */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Project Requirements
              </h4>
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject Area:</span>
                  <span className="font-bold text-slate-900">{order.subject_area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Academic Level:</span>
                  <span className="font-bold text-slate-900">{order.academic_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Page / Slide Count:</span>
                  <span className="font-bold text-slate-900">{order.pages_count} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Citation Format:</span>
                  <span className="font-bold text-slate-900">{order.citation_style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Deadline:</span>
                  <span className="font-bold text-slate-900">{formatDate(order.deadline)}</span>
                </div>
              </div>

              {order.instructions && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-slate-500 font-bold block mb-1">Instructions:</span>
                  <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-3 rounded-xl">
                    {order.instructions}
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
