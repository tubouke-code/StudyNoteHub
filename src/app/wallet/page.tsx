'use client';

import React, { useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import { MOCK_CURRENT_USER, MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaymentModal } from '@/components/payments/PaymentModal';

export default function WalletPage() {
  const [balance, setBalance] = useState(MOCK_CURRENT_USER.wallet_balance);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('10000');
  
  // Withdrawal Form State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('15000');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

  const handleDepositSuccess = ({ gateway, reference }: { gateway: string; reference: string }) => {
    setIsDepositModalOpen(false);
    const addedAmount = Number(depositAmount);
    setBalance(prev => prev + addedAmount);
    
    const newTxn = {
      id: `txn_${Date.now()}`,
      user_id: MOCK_CURRENT_USER.id,
      amount: addedAmount,
      fee: 0,
      type: 'WALLET_DEPOSIT' as const,
      gateway: gateway as any,
      reference,
      description: `Wallet deposit via ${gateway}`,
      created_at: new Date().toISOString(),
    };
    setTransactions([newTxn, ...transactions]);
    alert(`Successfully deposited ${formatCurrency(addedAmount)} into your wallet!`);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (amount > balance) {
      alert('Insufficient wallet balance.');
      return;
    }
    if (!accountNumber || accountNumber.length < 10) {
      alert('Please provide a valid 10-digit NUBAN account number.');
      return;
    }

    setIsProcessingWithdraw(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsProcessingWithdraw(false);
    setIsWithdrawModalOpen(false);
    setBalance(prev => prev - amount);

    const newTxn = {
      id: `txn_${Date.now()}`,
      user_id: MOCK_CURRENT_USER.id,
      amount: amount,
      fee: 50.0,
      type: 'WITHDRAWAL' as const,
      description: `Payout to ${bankName} (${accountNumber})`,
      created_at: new Date().toISOString(),
    };
    setTransactions([newTxn, ...transactions]);
    alert(`Withdrawal request of ${formatCurrency(amount)} initiated. Funds will reflect in your account shortly.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
          Financial Management
        </span>
        <h1 className="text-3xl font-black text-slate-900">
          In-App Wallet & Escrow Ledger
        </h1>
        <p className="text-sm text-slate-600">
          Top up your balance for one-click note purchases and escrow orders, or withdraw your writing royalties and earnings to your local bank account.
        </p>
      </div>

      {/* Wallet Balance Card & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Balance Display */}
        <div className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-tr from-slate-900 via-indigo-950 to-primary-950 text-white shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-primary-300 uppercase">
              Available Wallet Balance
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              <ShieldCheck className="w-4 h-4" /> SSL Encrypted
            </span>
          </div>

          <div>
            <p className="text-4xl sm:text-5xl font-black tracking-tight">
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Account: {MOCK_CURRENT_USER.email}
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Top-Up Balance
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" /> Withdraw to Bank
            </button>
          </div>
        </div>

        {/* Quick Deposit Presets */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Quick Top-Up Presets</h3>
            <p className="text-xs text-slate-500">Fund with Paystack or Flutterwave</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {['5000', '10000', '25000', '50000'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setDepositAmount(amt);
                    setIsDepositModalOpen(true);
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50 text-slate-800 font-bold text-xs transition-all"
                >
                  +{formatCurrency(Number(amt))}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 text-center">
            Zero fees on in-app wallet note downloads
          </div>
        </div>

      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-base">Transaction Ledger & Escrow History</h3>
          <span className="text-xs text-slate-400 font-medium">{transactions.length} Total Records</span>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.map((txn) => {
            const isCredit = txn.type === 'WALLET_DEPOSIT' || txn.type === 'NOTE_SALE_ROYALTY' || txn.type === 'ESCROW_PAYOUT';
            return (
              <div key={txn.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{txn.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{formatDate(txn.created_at)}</span>
                      {txn.gateway && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-slate-600">{txn.gateway}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-base font-black ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">{txn.reference || 'COMPLETED'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deposit Payment Modal */}
      <PaymentModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Deposit Funds into Wallet"
        amount={Number(depositAmount) || 5000}
        itemType="WALLET_TOPUP"
        onSuccess={handleDepositSuccess}
      />

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Withdraw to Bank Account</h3>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Amount (₦)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-primary-500"
                />
                <span className="text-[11px] text-slate-400">Available: {formatCurrency(balance)}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium bg-white outline-none focus:border-primary-500"
                >
                  <option value="Access Bank">Access Bank</option>
                  <option value="GTBank (Guaranty Trust)">GTBank (Guaranty Trust)</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                  <option value="UBA (United Bank for Africa)">UBA</option>
                  <option value="Kuda Microfinance Bank">Kuda Microfinance Bank</option>
                  <option value="OPay / Moniepoint">OPay / Moniepoint</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Account Number (10 Digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0123456789"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Account Name</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Alex Adebayo"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingWithdraw}
                  className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700 shadow-md"
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
