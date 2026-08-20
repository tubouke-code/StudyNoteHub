'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  ShieldCheck, 
  Clock, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  CreditCard,
  Loader2,
  X,
  AlertCircle,
  Lock,
  ArrowRight,
  Receipt,
  Copy,
  Check
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Transaction } from '@/types/database.types';

const MIN_DEPOSIT = 1000;
const MIN_WITHDRAWAL = 2000;
const DEPOSIT_PRESETS = [2000, 5000, 10000, 25000, 50000];

const NIGERIAN_BANKS = [
  'Access Bank',
  'Guaranty Trust Bank (GTB)',
  'Zenith Bank',
  'United Bank for Africa (UBA)',
  'First Bank of Nigeria',
  'Kuda Bank',
  'Opay',
  'Palmpay',
  'Moniepoint',
  'Stanbic IBTC Bank',
  'FCMB',
  'Fidelity Bank',
  'Union Bank',
  'Sterling Bank',
  'Wema Bank / ALAT',
  'Ecobank Nigeria',
  'Jaiz Bank',
  'Heritage Bank',
  'Polaris Bank',
  'Unity Bank',
];

interface SuccessReceiptData {
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  reference: string;
  gateway?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  newBalance: number;
  date: string;
}

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Deposit State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [customDepositInput, setCustomDepositInput] = useState<string>('5000');
  const [depositGateway, setDepositGateway] = useState<'PAYSTACK' | 'FLUTTERWAVE'>('PAYSTACK');
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  
  // Withdrawal Form State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(5000);
  const [customWithdrawInput, setCustomWithdrawInput] = useState<string>('5000');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

  // Modern Success Receipt Modal State
  const [successReceipt, setSuccessReceipt] = useState<SuccessReceiptData | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const balance = Number(user?.wallet_balance) || 0;

  useEffect(() => {
    async function loadTransactions() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setTransactions(data as Transaction[]);
        }
      } catch (err) {
        console.error('Error fetching transactions from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, [user]);

  // Handle Deposit Submit
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customDepositInput) || 0;

    if (amount < MIN_DEPOSIT) {
      alert(`Minimum deposit amount is ${formatCurrency(MIN_DEPOSIT)}.`);
      return;
    }

    setIsProcessingDeposit(true);

    try {
      const reference = `DEP_${Date.now()}`;
      
      // Simulate/Trigger API payment
      await new Promise((resolve) => setTimeout(resolve, 1400));

      if (user) {
        const supabase = createClient();
        await supabase.from('transactions').insert({
          user_id: user.id,
          amount: amount,
          fee: 0,
          type: 'WALLET_DEPOSIT',
          gateway: depositGateway,
          reference,
          description: `Wallet deposit via ${depositGateway}`,
        });

        // Update user balance in profiles
        await supabase
          .from('profiles')
          .update({ wallet_balance: balance + amount })
          .eq('id', user.id);

        await refreshUser();
      }

      setIsDepositModalOpen(false);
      setSuccessReceipt({
        type: 'DEPOSIT',
        amount,
        reference,
        gateway: depositGateway,
        newBalance: balance + amount,
        date: new Date().toISOString(),
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingDeposit(false);
    }
  };

  // Handle Withdrawal Submit
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customWithdrawInput) || 0;

    if (amount < MIN_WITHDRAWAL) {
      alert(`Minimum withdrawal amount is ${formatCurrency(MIN_WITHDRAWAL)}.`);
      return;
    }
    if (amount > balance) {
      alert('Insufficient wallet balance.');
      return;
    }
    if (!accountNumber || accountNumber.length !== 10) {
      alert('Please enter a valid 10-digit NUBAN account number.');
      return;
    }

    setIsProcessingWithdraw(true);

    try {
      const reference = `WD_${Date.now()}`;
      
      await new Promise((resolve) => setTimeout(resolve, 1400));

      if (user) {
        const supabase = createClient();
        await supabase.from('transactions').insert({
          user_id: user.id,
          amount: -amount,
          fee: 50,
          type: 'BANK_WITHDRAWAL',
          reference,
          description: `Bank payout to ${bankName} (${accountNumber})`,
        });

        // Deduct from profile balance
        await supabase
          .from('profiles')
          .update({ wallet_balance: Math.max(0, balance - amount) })
          .eq('id', user.id);

        await refreshUser();
      }

      setIsWithdrawModalOpen(false);
      setSuccessReceipt({
        type: 'WITHDRAWAL',
        amount,
        reference,
        bankName,
        accountNumber,
        accountName: accountName || user?.full_name || 'Account Holder',
        newBalance: Math.max(0, balance - amount),
        date: new Date().toISOString(),
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingWithdraw(false);
    }
  };

  const copyReference = (ref: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(ref);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
          Financial Hub
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          StudyNoteHub Wallet & Balance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your earnings, fund your escrow balance, and request instant bank payouts
        </p>
      </div>

      {/* Main Balance Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Available Balance Big Card */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950 text-white shadow-2xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Available Balance
                </span>
                <p className="text-[11px] text-slate-300">Ready for instant orders & withdrawals</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-white/10 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Secured
            </span>
          </div>

          <div>
            <p className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Account: <span className="text-slate-200 font-mono">{user?.email || 'Authenticated User'}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setCustomDepositInput('5000');
                setIsDepositModalOpen(true);
              }}
              className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Deposit Funds
            </button>

            <button
              onClick={() => {
                setCustomWithdrawInput(Math.min(balance, 5000) >= MIN_WITHDRAWAL ? String(Math.min(balance, 5000)) : String(MIN_WITHDRAWAL));
                setIsWithdrawModalOpen(true);
              }}
              className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw to Bank
            </button>
          </div>
        </div>

        {/* Quick Help / Escrow Info Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Supported Gateways</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant Nigerian bank transfers, USSD, debit cards via Paystack and Flutterwave. Payouts are credited directly to your bank.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Minimum Deposit:</span>
              <span className="font-bold text-slate-900">{formatCurrency(MIN_DEPOSIT)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Minimum Withdrawal:</span>
              <span className="font-bold text-slate-900">{formatCurrency(MIN_WITHDRAWAL)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
              <span>Standard NIP Fee:</span>
              <span>₦50 / payout</span>
            </div>
          </div>
        </div>

      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Transaction History</h3>
            <p className="text-xs text-slate-500">Live ledger of deposits, royalties, and payouts</p>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Loading transaction history...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No transactions yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your deposit receipts, note royalties, and project payouts will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((txn) => {
                const isPositive = txn.amount > 0;
                return (
                  <div key={txn.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{txn.description}</h4>
                        <span className="text-[10px] text-slate-400">{formatDate(txn.created_at)} • Ref: {txn.reference}</span>
                      </div>
                    </div>

                    <span className={`text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(txn.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MODERN WALLET DEPOSIT MODAL */}
      {/* ========================================================================= */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Fund Your Wallet</h3>
                  <span className="text-[11px] text-slate-400">Instant credit for orders & notes</span>
                </div>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-5">
              
              {/* Preset Chips */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Quick Amount
                  </label>
                  <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Min: {formatCurrency(MIN_DEPOSIT)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {DEPOSIT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomDepositInput(String(preset))}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        Number(customDepositInput) === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {formatCurrency(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Or Input Desired Amount (₦ NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₦</span>
                  <input
                    type="number"
                    min={MIN_DEPOSIT}
                    step={100}
                    required
                    value={customDepositInput}
                    onChange={(e) => setCustomDepositInput(e.target.value)}
                    placeholder="e.g. 15000"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-lg font-black text-slate-900 outline-none transition-all ${
                      Number(customDepositInput) < MIN_DEPOSIT
                        ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {Number(customDepositInput) < MIN_DEPOSIT && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Amount cannot be less than the required minimum of {formatCurrency(MIN_DEPOSIT)}.
                  </p>
                )}
              </div>

              {/* Gateway Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Gateway
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositGateway('PAYSTACK')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      depositGateway === 'PAYSTACK'
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    <p className="text-xs">Paystack</p>
                    <p className="text-[10px] text-slate-500 font-normal">Cards, Bank & USSD</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositGateway('FLUTTERWAVE')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      depositGateway === 'FLUTTERWAVE'
                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    <p className="text-xs">Flutterwave</p>
                    <p className="text-[10px] text-slate-500 font-normal">Multi-currency</p>
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessingDeposit || Number(customDepositInput) < MIN_DEPOSIT}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingDeposit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatCurrency(Number(customDepositInput) || MIN_DEPOSIT)} & Fund Wallet
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODERN WALLET WITHDRAWAL MODAL */}
      {/* ========================================================================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Withdraw to Bank</h3>
                  <span className="text-[11px] text-slate-400">Available Balance: {formatCurrency(balance)}</span>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              
              {/* Quick Amount Chips */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quick Amount
                  </label>
                  <span className="text-[10px] text-slate-500 font-extrabold bg-slate-100 px-2 py-0.5 rounded-full">
                    Min: {formatCurrency(MIN_WITHDRAWAL)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomWithdrawInput('2000')}
                    className="py-2 px-2 rounded-xl text-xs font-bold border bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                  >
                    ₦2,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomWithdrawInput('5000')}
                    className="py-2 px-2 rounded-xl text-xs font-bold border bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                  >
                    ₦5,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomWithdrawInput(String(balance))}
                    className="py-2 px-2 rounded-xl text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  >
                    All (₦{balance})
                  </button>
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Withdrawal Amount (₦ NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₦</span>
                  <input
                    type="number"
                    min={MIN_WITHDRAWAL}
                    max={balance}
                    step={100}
                    required
                    value={customWithdrawInput}
                    onChange={(e) => setCustomWithdrawInput(e.target.value)}
                    placeholder="e.g. 5000"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-lg font-black text-slate-900 outline-none transition-all ${
                      Number(customWithdrawInput) < MIN_WITHDRAWAL || Number(customWithdrawInput) > balance
                        ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {Number(customWithdrawInput) < MIN_WITHDRAWAL && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Minimum withdrawal amount is {formatCurrency(MIN_WITHDRAWAL)}.
                  </p>
                )}
                {Number(customWithdrawInput) > balance && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Amount exceeds your available balance of {formatCurrency(balance)}.
                  </p>
                )}
              </div>

              {/* Bank Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Select Destination Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none bg-white focus:border-emerald-500"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">10-Digit NUBAN Account Number</label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="0123456789"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-black tracking-wider text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Account Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Account Holder Full Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={user?.full_name || 'e.g. John Doe'}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500"
                />
              </div>

              {/* Fee Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Gross Payout:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(Number(customWithdrawInput) || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>NIP Transfer Fee:</span>
                  <span>₦50</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-200/60">
                  <span>Net Credited to Bank:</span>
                  <span>{formatCurrency(Math.max(0, (Number(customWithdrawInput) || 0) - 50))}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isProcessingWithdraw || 
                    Number(customWithdrawInput) < MIN_WITHDRAWAL || 
                    Number(customWithdrawInput) > balance ||
                    accountNumber.length !== 10
                  }
                  className="w-2/3 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isProcessingWithdraw ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Processing Payout...
                    </span>
                  ) : (
                    `Withdraw ${formatCurrency(Number(customWithdrawInput) || 0)}`
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODERN TRANSACTION SUCCESS RECEIPT MODAL */}
      {/* ========================================================================= */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center">
            
            {/* Top Glow & Animation */}
            <div className={`p-8 pb-6 ${
              successReceipt.type === 'DEPOSIT'
                ? 'bg-gradient-to-b from-emerald-500/10 to-transparent'
                : 'bg-gradient-to-b from-primary-500/10 to-transparent'
            }`}>
              <div className="w-18 h-18 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border-2 border-emerald-200 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mt-4">
                {successReceipt.type === 'DEPOSIT' ? 'Wallet Funded Successfully!' : 'Payout Initiated Successfully!'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {successReceipt.type === 'DEPOSIT'
                  ? 'Your in-app balance has been credited and is ready to use.'
                  : 'Funds have been dispatched and will arrive in your bank account shortly.'}
              </p>
            </div>

            {/* Receipt Details Card */}
            <div className="px-6 sm:px-8 pb-6 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-3">
                
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Transaction Type</span>
                  <span className="font-extrabold text-slate-800">
                    {successReceipt.type === 'DEPOSIT' ? 'Wallet Deposit' : 'Bank Withdrawal'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Amount:</span>
                  <span className="text-base font-black text-slate-900">
                    {formatCurrency(successReceipt.amount)}
                  </span>
                </div>

                {successReceipt.gateway && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Gateway:</span>
                    <span className="font-bold text-slate-800">{successReceipt.gateway}</span>
                  </div>
                )}

                {successReceipt.bankName && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Destination Bank:</span>
                    <span className="font-bold text-slate-800">{successReceipt.bankName}</span>
                  </div>
                )}

                {successReceipt.accountNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-bold text-slate-800">{successReceipt.accountNumber}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reference:</span>
                  <button
                    onClick={() => copyReference(successReceipt.reference)}
                    className="font-mono font-bold text-slate-700 flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>{successReceipt.reference}</span>
                    {copiedRef ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 font-bold">
                  <span className="text-slate-600">Updated Balance:</span>
                  <span className="text-emerald-700 font-black">{formatCurrency(successReceipt.newBalance)}</span>
                </div>

              </div>

              {/* Dismiss CTA */}
              <button
                onClick={() => setSuccessReceipt(null)}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Done • Return to Wallet
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
