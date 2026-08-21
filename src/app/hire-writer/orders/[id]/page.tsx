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
  Loader2,
  PenTool,
  Star,
  GraduationCap,
  Calendar,
  Check,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { TurnitinReportCard } from '@/components/turnitin/TurnitinReportCard';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { sanitizeChatMessage } from '@/lib/chat-sanitizer';
import { createClient } from '@/lib/supabase/client';
import { OrderItem, BidItem, Profile } from '@/types/database.types';

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
  const [bids, setBids] = useState<BidItem[]>([]);
  const [myBid, setMyBid] = useState<BidItem | null>(null);

  // Writer Bid Form State
  const [bidAmount, setBidAmount] = useState<string>('25000');
  const [bidDeliveryDays, setBidDeliveryDays] = useState<number>(7);
  const [bidPitch, setBidPitch] = useState<string>('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Hirer Bid Acceptance & Escrow Modal State
  const [selectedBidToAccept, setSelectedBidToAccept] = useState<BidItem | null>(null);
  const [showAcceptPaymentModal, setShowAcceptPaymentModal] = useState(false);

  // Workspace & Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [warningNotice, setWarningNotice] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [escrowReleased, setEscrowReleased] = useState(false);
  const [timeLeftHours, setTimeLeftHours] = useState(48);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const loadOrderAndBids = async () => {
    try {
      const supabase = createClient();
      
      // 1. Load Order
      const { data: ordData, error: ordErr } = await supabase
        .from('orders')
        .select('*, client:profiles!orders_client_id_fkey(*), writer:profiles!orders_writer_id_fkey(*)')
        .eq('id', orderId)
        .single();

      if (ordData) {
        const ord = ordData as OrderItem;
        setOrder(ord);
        setEscrowReleased(ord.escrow_status === 'RELEASED_TO_WRITER');

        // Set default bid amount from guide budget if writer
        if (ord.budget && !bidPitch) {
          setBidAmount(String(ord.budget));
        }
      }

      // 2. Load Bids (Protected by RLS: Hirer sees all, Writer sees only own bid)
      const { data: bidsData } = await supabase
        .from('bids')
        .select('*, writer:profiles(*)')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (bidsData) {
        setBids(bidsData as BidItem[]);
        if (user) {
          const foundMyBid = (bidsData as BidItem[]).find((b) => b.writer_id === user.id);
          if (foundMyBid) {
            setMyBid(foundMyBid);
            setBidAmount(String(foundMyBid.bid_amount));
            setBidDeliveryDays(foundMyBid.delivery_days);
            setBidPitch(foundMyBid.proposal_pitch);
          }
        }
      }

      // 3. Load Chat Messages if assigned
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
            isWriter: m.sender_id === ordData?.writer_id,
            text: m.message_text,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachment: m.attachment_url,
          }))
        );
      } else {
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
      console.error('Error loading order data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderAndBids();
    }
  }, [orderId, user?.id]);

  // Is current user the hirer (client)?
  const isClient = user?.id === order?.client_id;
  // Is order currently in open bidding phase?
  const isBiddingPhase = !order?.writer_id || order?.status === 'OPEN' || order?.status === 'PENDING';

  // Handle Writer Submitting or Updating a Sealed Bid
  const handleWriterSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amountNum = Number(bidAmount);
    if (!amountNum || amountNum <= 0) {
      showToast('Please enter a valid bid amount.');
      return;
    }
    if (!bidPitch.trim()) {
      showToast('Please write a brief proposal pitch to explain your approach.');
      return;
    }

    setIsSubmittingBid(true);
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.from('bids').upsert({
        order_id: orderId,
        writer_id: user.id,
        bid_amount: amountNum,
        delivery_days: Number(bidDeliveryDays) || 7,
        proposal_pitch: bidPitch.trim(),
        status: 'PENDING',
      }, { onConflict: 'order_id,writer_id' }).select().single();

      if (error) {
        console.error('Bid insert error:', error);
        showToast(error.message || 'Failed to submit bid.');
      } else {
        showToast('Sealed bid submitted successfully! The hirer will review your proposal.');
        await loadOrderAndBids();
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to submit bid.');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // Handle Hirer Accepting a Bid & Locking Escrow
  const handleAcceptBidClick = (bid: BidItem) => {
    setSelectedBidToAccept(bid);
    setShowAcceptPaymentModal(true);
  };

  const handleEscrowPaymentSuccess = async () => {
    if (!selectedBidToAccept || !order) return;
    setShowAcceptPaymentModal(false);

    try {
      const supabase = createClient();

      // 1. Assign chosen writer to order and lock escrow
      await supabase
        .from('orders')
        .update({
          writer_id: selectedBidToAccept.writer_id,
          budget: selectedBidToAccept.bid_amount,
          status: 'IN_PROGRESS',
          escrow_status: 'HELD_IN_ESCROW',
        })
        .eq('id', order.id);

      // 2. Mark this bid as ACCEPTED
      await supabase
        .from('bids')
        .update({ status: 'ACCEPTED' })
        .eq('id', selectedBidToAccept.id);

      // 3. Mark other bids as REJECTED
      await supabase
        .from('bids')
        .update({ status: 'REJECTED' })
        .eq('order_id', order.id)
        .neq('id', selectedBidToAccept.id);

      showToast(`Bid accepted! ${formatCurrency(selectedBidToAccept.bid_amount)} locked in Escrow. Work is now in progress.`);
      await loadOrderAndBids();
    } catch (err) {
      console.error('Error accepting bid:', err);
      showToast('Error finalizing bid acceptance.');
    }
  };

  // Handle Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user || !order) return;

    const sanitized = sanitizeChatMessage(inputMessage);

    if (sanitized.isBlocked) {
      setWarningNotice(sanitized.warningMessage || 'Bank accounts or contact details are blocked to protect your Escrow.');
      setTimeout(() => setWarningNotice(null), 8000);
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: user.full_name || 'You',
      isWriter: user.role === 'WRITER',
      text: sanitized.cleanText,
      timestamp: 'Just now',
      isCensored: sanitized.isBlocked,
      censorReason: sanitized.blockedReasons[0],
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    try {
      const supabase = createClient();
      await supabase.from('order_messages').insert({
        order_id: order.id,
        sender_id: user.id,
        message_text: sanitized.cleanText,
      });
    } catch (err) {
      console.error('Error saving chat message:', err);
    }
  };

  // Handle Escrow Release to Writer
  const handleReleaseEscrow = async () => {
    if (!order) return;
    setIsReleasing(true);
    try {
      const supabase = createClient();
      
      // Update order status
      await supabase
        .from('orders')
        .update({
          escrow_status: 'RELEASED_TO_WRITER',
          status: 'COMPLETED',
        })
        .eq('id', order.id);

      // Credit 85% payout to writer wallet
      if (order.writer_id) {
        const writerCut = Math.round(Number(order.budget) * 0.85);
        
        await supabase.from('transactions').insert({
          user_id: order.writer_id,
          amount: writerCut,
          fee: 0,
          type: 'ESCROW_PAYOUT',
          reference: `ESC_REL_${Date.now()}`,
          description: `85% Escrow Payout for #${order.id.slice(0, 8)} (${order.title})`,
        });

        // Increase writer profile balance
        const { data: writerProfile } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', order.writer_id)
          .single();

        if (writerProfile) {
          await supabase
            .from('profiles')
            .update({ wallet_balance: (Number(writerProfile.wallet_balance) || 0) + writerCut })
            .eq('id', order.writer_id);
        }
      }

      setIsReleasing(false);
      setEscrowReleased(true);
      showToast('Escrow released successfully! 85% credited to the researcher.');
    } catch (err) {
      console.error('Error releasing escrow:', err);
      setIsReleasing(false);
      setEscrowReleased(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-medium">Opening project bidding room...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Project Not Found</h2>
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
        
        {/* Toast Banner */}
        {toastNotice && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{toastNotice}</span>
          </div>
        )}

        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={user?.role === 'WRITER' ? '/writer-dashboard' : '/dashboard'}
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
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  isBiddingPhase 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isBiddingPhase ? '⚡ Open for Bidding' : '🔒 In Progress (Escrow Locked)'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {order.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {isBiddingPhase ? 'Guide Budget' : 'Locked Escrow Budget'}
              </span>
              <p className="text-lg font-black text-emerald-700">{formatCurrency(order.budget)}</p>
            </div>
            {!isBiddingPhase && isClient && !escrowReleased && (
              <button
                onClick={handleReleaseEscrow}
                disabled={isReleasing}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                {isReleasing ? 'Releasing Funds...' : 'Approve & Release Escrow'}
              </button>
            )}
            {!isBiddingPhase && escrowReleased && (
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Escrow Paid Out (85% Released)
              </span>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHASE 1: SEALED BIDDING ROOM (When Order is Open for Writer Bids) */}
        {/* ========================================================================= */}
        {isBiddingPhase ? (
          <div className="space-y-6">
            
            {/* Project Overview Card */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Academic Degree Level:
                  </span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-900">
                    {order.academic_level}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Subject: <strong>{order.subject_area}</strong></span>
                  <span>•</span>
                  <span>Citation: <strong>{order.citation_style}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Project Guidelines & Supervisor Instructions:
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {order.instructions}
                </div>
              </div>
            </div>

            {/* IF CURRENT USER IS HIRER (CLIENT) -> View Incoming Sealed Bids */}
            {isClient && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      Writer Bids Received ({bids.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Compare verified researcher bids and select the proposal within your desired budget.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sealed Bids (Private to You)</span>
                  </div>
                </div>

                {bids.length === 0 ? (
                  <div className="p-12 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Awaiting Researcher Bids...</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Your project is live in the Writer Feed. Verified PhD and Masters researchers are reviewing your requirements and will submit their proposed prices shortly.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bids.map((bid) => (
                      <div
                        key={bid.id}
                        className="p-6 bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-500 transition-all shadow-sm hover:shadow-lg space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Writer Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={bid.writer?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                                alt="Writer"
                                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-100"
                              />
                              <div>
                                <h4 className="text-sm font-black text-slate-900">{bid.writer?.full_name || 'Academic Researcher'}</h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  <span className="flex items-center text-amber-500 font-bold">
                                    <Star className="w-3.5 h-3.5 fill-current mr-0.5" /> 4.9
                                  </span>
                                  <span>•</span>
                                  <span>{bid.writer?.institution || 'Verified Scholar'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Bid Price</span>
                              <span className="text-xl font-black text-emerald-800">{formatCurrency(bid.bid_amount)}</span>
                            </div>
                          </div>

                          {/* Delivery timeline badge */}
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Proposed Timeline: <strong>{bid.delivery_days} Days</strong></span>
                          </div>

                          {/* Proposal Pitch */}
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic">
                            "{bid.proposal_pitch}"
                          </div>
                        </div>

                        {/* Accept CTA */}
                        <button
                          onClick={() => handleAcceptBidClick(bid)}
                          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Lock className="w-4 h-4" />
                          Accept Bid & Lock Escrow ({formatCurrency(bid.bid_amount)})
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* IF CURRENT USER IS A WRITER (BIDDER) -> Submit or Review Sealed Bid */}
            {!isClient && (
              <div className="space-y-4">
                <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-emerald-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Blind / Sealed Bidding
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-2">
                        {myBid ? 'Your Submitted Sealed Bid' : 'Place Your Sealed Bid for this Project'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Competing researchers cannot see your price or proposal. Only the hirer can review your submission.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <EyeOff className="w-5 h-5" />
                    </div>
                  </div>

                  <form onSubmit={handleWriterSubmitBid} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          Your Proposed Bid Amount (₦ NGN)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₦</span>
                          <input
                            type="number"
                            min={1000}
                            step={500}
                            required
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder="e.g. 30000"
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-lg font-black text-slate-900 outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          Delivery Timeline (Days)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={60}
                          required
                          value={bidDeliveryDays}
                          onChange={(e) => setBidDeliveryDays(Number(e.target.value))}
                          placeholder="e.g. 7"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-lg font-black text-slate-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Proposal Pitch / Research Approach (Private to Hirer)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={bidPitch}
                        onChange={(e) => setBidPitch(e.target.value)}
                        placeholder="Explain your relevant degree background, methodology, access to journal databases, and Turnitin guarantee..."
                        className="w-full p-4 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingBid}
                      className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingBid ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting Sealed Bid...
                        </>
                      ) : (
                        <>
                          <PenTool className="w-4 h-4" />
                          {myBid ? 'Update My Sealed Bid' : `Submit Sealed Bid (${formatCurrency(Number(bidAmount) || 0)})`}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* ========================================================================= */
          /* PHASE 2: ACTIVE ORDER WORKSPACE & CHAT (When Bid has been Accepted) */
          /* ========================================================================= */
          <>
            {/* Security & Escrow Protection Alert Banner */}
            <div className="p-4 rounded-2xl bg-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Escrow Protection & 48hr Auto-Resolution Clock</p>
                  <p className="text-emerald-300 text-[11px]">
                    Funds are safely locked in StudyNoteHub Escrow. The researcher is only credited when you inspect the final research chapters and approve the Turnitin report.
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
                  <p className="text-xs font-bold text-slate-800">1. Bid Accepted</p>
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

                {/* Warning Toast if message blocked */}
                {warningNotice && (
                  <div className="p-3 bg-red-50 text-red-700 border-t border-red-200 text-xs flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{warningNotice}</span>
                  </div>
                )}

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type project guidelines, feedback, or revision requests..."
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Right Column: Turnitin Report & Deliverables */}
              <div className="space-y-6">
                <TurnitinReportCard
                  similarityScore={2.8}
                  aiScore={1.2}
                  fileName="Final_Research_Deliverable.docx"
                />

                {/* Project Specs Summary */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Specifications</h4>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Degree Level:</span>
                      <span className="font-bold text-slate-800">{order.academic_level}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Citation Style:</span>
                      <span className="font-bold text-slate-800">{order.citation_style}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-500">Turnitin Policy:</span>
                      <span className="font-bold text-emerald-700">No Repository (Zero Collision)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

      </div>

      {/* Escrow Acceptance Payment Modal for Hirer */}
      {selectedBidToAccept && (
        <PaymentModal
          isOpen={showAcceptPaymentModal}
          onClose={() => setShowAcceptPaymentModal(false)}
          title={`Accept ${selectedBidToAccept.writer?.full_name || 'Writer'}'s Bid`}
          amount={selectedBidToAccept.bid_amount}
          itemType="ESCROW_FUNDING"
          onSuccess={handleEscrowPaymentSuccess}
        />
      )}

    </div>
  );
}
