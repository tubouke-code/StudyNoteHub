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
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Transaction } from '@/types/database.types';

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('10000');
  
  // Withdrawal Form State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('15000');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

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

  const handleDepositSuccess = async ({ gateway, reference }: { gateway: string; reference: string }) => {
    setIsDepositModalOpen(false);
    const addedAmount = Number(depositAmount);
    
    try {
      if (user) {
        const supabase = createClient();
        await supabase.from('transactions').insert({
          user_id: user.id,
          amount: addedAmount,
          fee: 0,
          type: 'WALLET_DEPOSIT',
          gateway: gateway as any,
          reference,
          description: `Wallet deposit via ${gateway}`,
        });

        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
    alert(`Successfully deposited ${formatCurrency(addedAmount)} into your wallet!`);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (amount > balance) {
      alert('Insufficient wallet balance.');
      return;
    }
    if (amount < 2000) {
      alert('Minimum withdrawal amount is ₦2,000.');
      return;
    }

    setIsProcessingWithdraw(true);
    try {
      if (user) {
        const supabase = createClient();
        await supabase.from('transactions').insert({
          user_id: user.id,
          amount: -amount,
          fee: 50,
          type: 'BANK_WITHDRAWAL',
          reference: `WD_${Date.now()}`,
          description: `Bank withdrawal to ${bankName} (${accountNumber})`,
        });

        await refreshUser();
      }

      setIsWithdrawModalOpen(false);
      alert(`Withdrawal request for ${formatCurrency(amount)} submitted! Funds will arrive in your ${bankName} account shortly.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingWithdraw(false);
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
              onClick={() => setIsDepositModalOpen(true)}
              className="flex-1 min-w-[140px] py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Deposit Funds
            </button>

            <button
              onClick={() => setIsWithdrawModalOpen(true)}
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

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Minimum Withdrawal:</p>
            <p className="text-[11px]">₦2,000 with standard ₦50 NIP transfer fee.</p>
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

      {/* Deposit Modal */}
      <PaymentModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Top Up In-App Wallet"
        amount={Number(depositAmount) || 5000}
        itemType="WALLET_TOPUP"
        onSuccess={handleDepositSuccess}
      />

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900">Withdraw to Nigerian Bank</h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Amount to Withdraw (₦ NGN)</label>
                <input
                  type="number"
                  min={2000}
                  max={balance}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-black outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Select Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
                >
                  <option value="Access Bank">Access Bank</option>
                  <option value="GTBank">Guaranty Trust Bank (GTB)</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="UBA">United Bank for Africa (UBA)</option>
                  <option value="First Bank">First Bank of Nigeria</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                  <option value="Opay">Opay</option>
                  <option value="Palmpay">Palmpay</option>
                  <option value="Moniepoint">Moniepoint</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">10-Digit Account Number</label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0123456789"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-1/2 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingWithdraw}
                  className="w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  {isProcessingWithdraw ? 'Processing...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
