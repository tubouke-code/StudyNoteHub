'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Clock, 
  Send, 
  Download, 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  MessageSquare, 
  ArrowLeft,
  User,
  Paperclip,
  ThumbsUp,
  RefreshCw,
  Lock
} from 'lucide-react';
import { MOCK_ORDERS, MOCK_CURRENT_USER, MOCK_WRITERS } from '@/lib/mock-data';
import { formatCurrency, formatDate, formatTimeAgo } from '@/lib/utils';

export default function OrderWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const initialOrder = MOCK_ORDERS.find(o => o.id === orderId) || MOCK_ORDERS[0];
  const [order, setOrder] = useState(initialOrder);

  // Live Chat state
  const [messages, setMessages] = useState([
    {
      id: 'msg_1',
      sender: order.student?.full_name || 'You',
      isMe: true,
      text: 'Hi Dr. Emeka, I have deposited the project budget in Escrow. Please find the attached survey dataset.',
      time: '2 hours ago',
    },
    {
      id: 'msg_2',
      sender: order.writer?.full_name || 'Dr. Emeka Okafor',
      isMe: false,
      text: 'Hello Alex! I have received the dataset. Running the Cronbach Alpha reliability tests and descriptive regression models now.',
      time: '1 hour ago',
    },
    {
      id: 'msg_3',
      sender: order.writer?.full_name || 'Dr. Emeka Okafor',
      isMe: false,
      text: 'I have uploaded the completed Chapter 4 & 5 draft with the SPSS output tables and Turnitin report (1.8% similarity). Please review!',
      time: '15 mins ago',
    },
  ]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isEscrowReleased, setIsEscrowReleased] = useState(order.escrow_status === 'RELEASED_TO_WRITER');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: MOCK_CURRENT_USER.full_name,
      isMe: true,
      text: newMessageText,
      time: 'Just now',
    };

    setMessages([...messages, newMsg]);
    setNewMessageText('');
  };

  const handleApproveDeliverable = async () => {
    const confirmRelease = window.confirm(
      `Release ${formatCurrency(order.budget)} from Escrow to ${order.writer?.full_name}? This action completes the project.`
    );
    if (!confirmRelease) return;

    setIsSubmittingApproval(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSubmittingApproval(false);
    setIsEscrowReleased(true);
    setOrder({
      ...order,
      status: 'COMPLETED',
      escrow_status: 'RELEASED_TO_WRITER',
    });
    alert(`Escrow funds successfully released to ${order.writer?.full_name}! Order marked as COMPLETED.`);
  };

  const handleRequestRevision = () => {
    const reason = window.prompt('Please enter the specific revision points for the writer:');
    if (reason) {
      setMessages([
        ...messages,
        {
          id: `msg_${Date.now()}`,
          sender: MOCK_CURRENT_USER.full_name,
          isMe: true,
          text: `[REVISION REQUESTED]: ${reason}`,
          time: 'Just now',
        },
      ]);
      alert('Revision request sent directly to writer.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back to Orders */}
      <button
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard Orders
      </button>

      {/* Order Status Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                Order #{order.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                order.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}>
                {order.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {order.title}
            </h1>
          </div>

          {/* Escrow Status Pill */}
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Escrow Status
              </p>
              <p className="text-sm font-black text-emerald-950">
                {isEscrowReleased ? 'RELEASED TO WRITER' : 'HELD IN ESCROW VAULT'}
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Steps Progress Bar */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            ✓ 1. Escrow Funded ({formatCurrency(order.budget)})
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            ✓ 2. Writer Assigned
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
            3. Draft Submitted
          </div>
          <div className={`p-2.5 rounded-xl font-bold border ${
            isEscrowReleased
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            {isEscrowReleased ? '✓ 4. Escrow Released' : '4. Client Approval'}
          </div>
        </div>
      </div>

      {/* Main Grid (Deliverables & Details + Live Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Deliverables & Order Instructions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Latest Deliverable Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-primary-200 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Submitted Deliverables & Final Draft
                </h3>
              </div>
              <span className="text-xs font-bold bg-primary-50 text-primary-700 px-3 py-1 rounded-full">
                Version 1.0 (Final Draft)
              </span>
            </div>

            {/* Deliverable File Items */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    DOCX
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Chapter_4_and_5_Fintech_Adoption_Empirical_Findings.docx
                    </p>
                    <p className="text-xs text-slate-500">4.2 MB • 18 Pages with SPSS Graphs & Tables</p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Downloading deliverable file...')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>

              {/* Plagiarism & AI Report */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-950">
                      Turnitin Originality Report: <span className="text-emerald-700">1.8% Similarity</span>
                    </p>
                    <p className="text-xs text-emerald-800">AI Detection Score: 0% • 100% Human Written</p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Opening Turnitin PDF report...')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                >
                  View Report
                </button>
              </div>
            </div>

            {/* Client Approval Actions */}
            {!isEscrowReleased ? (
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleApproveDeliverable}
                  disabled={isSubmittingApproval}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve Deliverable & Release Escrow ({formatCurrency(order.budget)})
                </button>

                <button
                  onClick={handleRequestRevision}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Request Free Revision
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-900 font-bold text-xs text-center">
                🎉 This project is marked COMPLETED and escrow funds have been transferred to the writer.
              </div>
            )}
          </div>

          {/* Original Order Guidelines */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Project Requirements</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Level</span>
                <span className="font-bold text-slate-800">{order.academic_level}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Citation Style</span>
                <span className="font-bold text-slate-800">{order.citation_style}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Length</span>
                <span className="font-bold text-slate-800">{order.pages_count} Pages</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Deadline</span>
                <span className="font-bold text-slate-800">{formatDate(order.deadline)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Student Instructions:</span>
              {order.instructions}
            </div>
          </div>

        </div>

        {/* Right Col: Real-time Direct Chat Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md flex flex-col h-[650px] overflow-hidden sticky top-24">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-3">
              <img
                src={order.writer?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'}
                alt={order.writer?.full_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  {order.writer?.full_name || 'Academic Writer'}
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </p>
                <p className="text-[11px] text-slate-500">Active Researcher • Online</p>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.isMe
                        ? 'bg-primary-600 text-white rounded-br-xs shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <p>{m.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type message to writer..."
                className="flex-1 py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-primary-500 bg-slate-50 focus:bg-white"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
}
