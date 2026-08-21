'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ChevronUp, ChevronDown, CheckCircle2, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AdminQuickBar() {
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Only render for ADMIN users and when not already on /admin page
  if (!isLoggedIn || user?.role !== 'ADMIN' || pathname.startsWith('/admin') || isDismissed) {
    return null;
  }

  const isNotePage = pathname.startsWith('/notes/') && pathname !== '/notes/upload';
  const isOrderPage = pathname.startsWith('/hire-writer/orders/');

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-2.5 max-w-xs sm:max-w-md flex flex-col gap-2">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3 px-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold tracking-wide">Admin Active</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/admin"
              className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Admin Portal
            </Link>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-300"
              title="Dismiss for session"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expanded Quick Actions */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5 px-1 animate-in fade-in">
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href="/admin?tab=notes"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-center font-medium block"
              >
                📚 Review Notes
              </Link>
              <Link
                href="/admin?tab=disputes"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-center font-medium block"
              >
                ⚖️ Escrow Disputes
              </Link>
            </div>

            {isNotePage && (
              <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-900/60 text-[11px] text-indigo-300 space-y-1">
                <p className="font-semibold">Note Moderation Mode:</p>
                <p className="text-[10px] text-slate-400">Review full file or adjust status in Admin Notes tab.</p>
              </div>
            )}

            {isOrderPage && (
              <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-900/60 text-[11px] text-amber-300 space-y-1">
                <p className="font-semibold">Order Mediation Mode:</p>
                <p className="text-[10px] text-slate-400">Escrow dispute resolution tools active in Admin Portal.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
