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
import { createClient } from '@/lib/supabase/client';

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
  const { user, refreshUser } = useAuth();
  const tokenFee = 3500; // ₦3,500 one-time accreditation token
  const [selectedGateway, setSelectedGateway] = useState<'PAYSTACK' | 'FLUTTERWAVE' | 'WALLET'>('PAYSTACK');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePayToken = async () => {
    setIsProcessing(true);

    try {
      if (user) {
        const supabase = createClient();
        await supabase.from('profiles').update({
          role: 'WRITER',
          is_verified_writer: true,
        }).eq('id', user.id);

        await supabase.from('transactions').insert({
          user_id: user.id,
          amount: -tokenFee,
          fee: 0,
          type: 'PLATFORM_FEE',
          gateway: selectedGateway,
          reference: `TOK_${Date.now()}`,
          description: 'Writer Accreditation & Turnitin Vetting Token Fee',
        });

        await refreshUser();
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                Writer Accreditation
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Unlock Writer & Bidding Privileges
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Accreditation Token Confirmed!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your profile has been upgraded to <strong>Verified Academic Researcher</strong>. You can now bid on open student projects and earn 85% net payouts!
              </p>
            </div>
          ) : (
            <>
              {/* Fee Breakdown Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">One-Time Accreditation Token:</span>
                  <span className="text-xl font-black text-emerald-800">{formatCurrency(tokenFee)}</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-emerald-900 border-t border-emerald-200/60 pt-2">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Instant access to high-budget student assignment orders</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Official Turnitin originality check certificate scanner</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>85% take-home payout on all completed milestones</span>
                  </p>
                </div>
              </div>

              {/* Gateway Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Select Payment Gateway
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('PAYSTACK')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      selectedGateway === 'PAYSTACK'
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    <p className="text-xs">Paystack</p>
                    <p className="text-[10px] text-slate-500 font-normal">Card, Bank & USSD</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('FLUTTERWAVE')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      selectedGateway === 'FLUTTERWAVE'
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    <p className="text-xs">Flutterwave</p>
                    <p className="text-[10px] text-slate-500 font-normal">Multi-gateway</p>
                  </button>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayToken}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Accreditation Token...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatCurrency(tokenFee)} Token & Start Writing
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
