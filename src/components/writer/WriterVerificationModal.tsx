'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  PenTool, 
  DollarSign, 
  ArrowRight,
  Lock,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface WriterVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WriterVerificationModal({
  isOpen,
  onClose,
  onSuccess,
}: WriterVerificationModalProps) {
  const { user, login } = useAuth();
  const tokenFee = 3500; // ₦3,500 one-time accreditation token
  const [selectedGateway, setSelectedGateway] = useState<'PAYSTACK' | 'FLUTTERWAVE' | 'WALLET'>('PAYSTACK');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePayToken = async () => {
    setIsProcessing(true);

    try {
      // Simulate Payment & Accreditation Upgrade
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
      
      setTimeout(() => {
        // Upgrade role to WRITER in auth session
        login('WRITER', user?.email);
        onSuccess();
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 bg-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                Writer Accreditation
              </span>
              <h3 className="text-lg font-black leading-tight">Become a Verified Writer</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Accreditation Approved!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Your writer token has been confirmed. Your verified badge is active and the open writing jobs queue is now unlocked!
              </p>
            </div>
          ) : (
            <>
              {/* Token Fee Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950 text-white flex items-center justify-between shadow-lg shadow-emerald-950/20">
                <div>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                    One-Time Verification Token
                  </span>
                  <p className="text-3xl font-black tracking-tight mt-0.5">
                    {formatCurrency(tokenFee)}
                  </p>
                  <p className="text-[11px] text-slate-400">Lifetime Verified Status • No recurring fees</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>

              {/* Writer Perks */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  What You Unlock As A Verified Writer:
                </span>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Access High-Paying Projects</strong>: Accept student assignments, theses, and data analysis tasks worth ₦15,000 – ₦80,000+.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>100% Escrow Guarantee</strong>: Every project is pre-funded in escrow before you begin writing.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>85% Note Royalty Payouts</strong>: Monetize your lecture summaries and past exam solutions.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Instant Bank Withdrawals</strong>: Cash out directly to your Nigerian bank account anytime.</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('PAYSTACK')}
                    className={`p-3 rounded-xl border-2 text-left text-xs font-bold transition-all flex items-center justify-between ${
                      selectedGateway === 'PAYSTACK'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Paystack (Cards/Transfer)</span>
                    {selectedGateway === 'PAYSTACK' && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('FLUTTERWAVE')}
                    className={`p-3 rounded-xl border-2 text-left text-xs font-bold transition-all flex items-center justify-between ${
                      selectedGateway === 'FLUTTERWAVE'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Flutterwave (Mobile/Cards)</span>
                    {selectedGateway === 'FLUTTERWAVE' && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePayToken}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Verification Token...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Pay {formatCurrency(tokenFee)} & Activate Writer Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
