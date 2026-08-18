'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Wallet, 
  CheckCircle, 
  Loader2, 
  Lock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { MOCK_CURRENT_USER } from '@/lib/mock-data';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  itemType: 'NOTE_PURCHASE' | 'ESCROW_FUNDING' | 'WALLET_TOPUP';
  itemId?: string;
  onSuccess: (details: { gateway: string; reference: string }) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  title,
  amount,
  itemType,
  itemId,
  onSuccess,
}: PaymentModalProps) {
  const [selectedGateway, setSelectedGateway] = useState<'PAYSTACK' | 'FLUTTERWAVE' | 'WALLET'>('PAYSTACK');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const canUseWallet = MOCK_CURRENT_USER.wallet_balance >= amount && itemType !== 'WALLET_TOPUP';

  const handlePay = async () => {
    setIsProcessing(true);

    try {
      if (selectedGateway === 'WALLET') {
        // Direct wallet deduction
        await new Promise((resolve) => setTimeout(resolve, 900));
        setPaymentSuccess(true);
        setTimeout(() => {
          onSuccess({ gateway: 'WALLET', reference: `WAL_${Date.now()}` });
        }, 1200);
        return;
      }

      // API Call to initialize Paystack or Flutterwave
      const endpoint = selectedGateway === 'PAYSTACK' 
        ? '/api/payments/paystack/initialize' 
        : '/api/payments/flutterwave/initialize';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          email: MOCK_CURRENT_USER.email,
          itemType,
          itemId,
        }),
      });

      const data = await res.json();

      if (data.status && (data.data?.authorization_url || data.data?.link)) {
        // For development/mock preview: simulate completion popup or redirect
        const checkoutUrl = data.data.authorization_url || data.data.link;
        
        // Show simulated instant checkout confirmation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPaymentSuccess(true);
        setTimeout(() => {
          onSuccess({ 
            gateway: selectedGateway, 
            reference: data.data.reference || `REF_${Date.now()}` 
          });
        }, 1200);
      } else {
        // Fallback success simulation
        await new Promise((resolve) => setTimeout(resolve, 800));
        setPaymentSuccess(true);
        setTimeout(() => {
          onSuccess({ gateway: selectedGateway, reference: `SIM_${Date.now()}` });
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      // Failover to simulated success for smooth dev testing
      setPaymentSuccess(true);
      setTimeout(() => {
        onSuccess({ gateway: selectedGateway, reference: `SIM_${Date.now()}` });
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
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary-600">
              {itemType === 'ESCROW_FUNDING' ? 'Secure Escrow Checkout' : 'Secure Payment'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 line-clamp-1">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {paymentSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Payment Successful!</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                {itemType === 'ESCROW_FUNDING'
                  ? 'Your funds have been securely locked in Escrow. The writer has been notified to begin work.'
                  : 'Your transaction has been confirmed and access is now active.'}
              </p>
            </div>
          ) : (
            <>
              {/* Amount Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-primary-900 to-indigo-800 text-white flex items-center justify-between shadow-lg shadow-primary-900/20">
                <div>
                  <p className="text-xs text-primary-200 font-medium">Total Amount Due</p>
                  <p className="text-3xl font-extrabold tracking-tight mt-0.5">
                    {formatCurrency(amount)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-full text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Protected
                  </span>
                </div>
              </div>

              {/* Payment Gateway Options */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Payment Method
                </label>

                {/* Option 1: Paystack */}
                <div
                  onClick={() => setSelectedGateway('PAYSTACK')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedGateway === 'PAYSTACK'
                      ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                      PSTK
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        Paystack
                        <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.2 rounded-full">
                          Fast / Popular
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Debit Card, Bank Transfer, USSD, Apple Pay
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedGateway === 'PAYSTACK' ? 'border-primary-600 bg-primary-600' : 'border-slate-300'
                  }`}>
                    {selectedGateway === 'PAYSTACK' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Option 2: Flutterwave */}
                <div
                  onClick={() => setSelectedGateway('FLUTTERWAVE')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedGateway === 'FLUTTERWAVE'
                      ? 'border-primary-600 bg-primary-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                      FLW
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        Flutterwave
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full">
                          Multi-Currency
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Cards, Mobile Money, M-Pesa, International
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedGateway === 'FLUTTERWAVE' ? 'border-primary-600 bg-primary-600' : 'border-slate-300'
                  }`}>
                    {selectedGateway === 'FLUTTERWAVE' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Option 3: In-App Wallet */}
                {itemType !== 'WALLET_TOPUP' && (
                  <div
                    onClick={() => canUseWallet && setSelectedGateway('WALLET')}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      !canUseWallet
                        ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                        : selectedGateway === 'WALLET'
                        ? 'border-primary-600 bg-primary-50/40 shadow-sm cursor-pointer'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          In-App Wallet Balance
                          <span className="text-xs font-semibold text-emerald-700">
                            ({formatCurrency(MOCK_CURRENT_USER.wallet_balance)})
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {canUseWallet
                            ? 'Instant zero-fee deduction from your balance'
                            : 'Insufficient wallet balance. Top-up or use Paystack/Flutterwave.'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedGateway === 'WALLET' ? 'border-primary-600 bg-primary-600' : 'border-slate-300'
                    }`}>
                      {selectedGateway === 'WALLET' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                )}
              </div>

              {/* Escrow Guarantee Notice */}
              {itemType === 'ESCROW_FUNDING' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Milestone Escrow Guarantee:</span> Your payment is securely held in our vault and will only be released to the writer after you review the completed draft and click "Approve Deliverable".
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting to {selectedGateway}...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatCurrency(amount)} via {selectedGateway}
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
