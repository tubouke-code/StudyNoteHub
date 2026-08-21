'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Scale, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ArrowLeft,
  FileText,
  Lock
} from 'lucide-react';

export default function TermsOfEscrowPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header Hero */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl border border-slate-800">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Guaranteed Milestone Escrow Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Terms of Service & Escrow Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Welcome to StudyNoteHub. By accessing our platform, purchasing study materials, or ordering custom research services, you agree to these legally binding Terms of Service and Escrow Guarantee.
          </p>
          <div className="pt-2 text-xs text-slate-400">
            Last Revised: August 2026 • StudyNoteHub Inc.
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-10 text-slate-700 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base shrink-0">
                1
              </div>
              <h2 className="text-xl font-bold text-slate-900">How the 100% Escrow Protection System Works</h2>
            </div>
            <p className="text-sm">
              StudyNoteHub operates a secure escrow mechanism for all custom academic writing, data analysis, and capstone project orders:
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className="font-bold text-slate-900">Order Creation & Escrow Lock:</h4>
                  <p className="text-slate-600 mt-0.5">When a client places an order or accepts a writer's sealed bid, the full project budget is deposited and securely locked in platform escrow. The writer does not receive the funds upfront.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="font-bold text-slate-900">Delivery & Turnitin Verification:</h4>
                  <p className="text-slate-600 mt-0.5">The writer submits the draft deliverables through the order workspace along with required Turnitin originality certification.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className="font-bold text-slate-900">Client Inspection Window:</h4>
                  <p className="text-slate-600 mt-0.5">The client has an inspection period (up to 7 days) to review the work, request free revisions, or release the milestone.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">4</span>
                <div>
                  <h4 className="font-bold text-slate-900">Disbursement / Escrow Release:</h4>
                  <p className="text-slate-600 mt-0.5">Upon client approval (or automated resolution after inspection expiry), the writer's 85% cut is credited to their wallet balance, available for instant bank withdrawal.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-base shrink-0">
                2
              </div>
              <h2 className="text-xl font-bold text-slate-900">Study Materials Marketplace & 90% Royalties</h2>
            </div>
            <p className="text-sm">
              Any user, graduate, or teacher may monetize their original lecture summaries, past questions, lesson schemes, and thesis projects:
            </p>
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 text-xs space-y-2">
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 pl-2">
                <li><strong>90% Royalty Split:</strong> The uploader receives 90% of the sale price for every paid download. StudyNoteHub retains a 10% platform hosting fee.</li>
                <li><strong>Instant Digital Access:</strong> Buyers receive instant lifetime download access upon completing payment.</li>
                <li><strong>Moderation Guarantee:</strong> Materials submitted to the store are reviewed by administrative staff before being publicly listed to ensure educational quality and readability.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-base shrink-0">
                3
              </div>
              <h2 className="text-xl font-bold text-slate-900">Escrow Disputes, Revisions & Refund Policy</h2>
            </div>
            <p className="text-sm">
              We protect both students and academic writers with an impartial administrative dispute resolution process:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-extrabold uppercase text-indigo-700 text-[10px]">Unlimited Revisions</span>
                <h4 className="font-bold text-slate-900">Quality Adjustments</h4>
                <p className="text-slate-600 leading-relaxed">
                  If a deliverable fails to adhere to the initial order instructions, the client is entitled to prompt, free revisions from the assigned writer.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-extrabold uppercase text-red-700 text-[10px]">Full Escrow Refund</span>
                <h4 className="font-bold text-slate-900">100% Money-Back Scenarios</h4>
                <p className="text-slate-600 leading-relaxed">
                  If a writer abandons an order, misses a critical deadline without extension, or provides unoriginal work failing our Academic Integrity standard, 100% of the escrow balance is refunded to the client's wallet.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-black text-base shrink-0">
                4
              </div>
              <h2 className="text-xl font-bold text-slate-900">Fee Structure & Writer Payouts</h2>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-800">
                  <tr>
                    <th className="p-3">Service Category</th>
                    <th className="p-3">Writer / Creator Cut</th>
                    <th className="p-3">Platform Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Pre-Written Study Notes & Projects</td>
                    <td className="p-3 font-bold text-emerald-700">90% Royalty</td>
                    <td className="p-3">10% Platform Hosting</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Custom Academic Project Orders</td>
                    <td className="p-3 font-bold text-emerald-700">85% Net Escrow</td>
                    <td className="p-3">15% Escrow & Moderation</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Writer Accreditation Token</td>
                    <td className="p-3">One-time ₦3,500 token</td>
                    <td className="p-3">Turnitin & Vetting Overhead</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center font-black text-base shrink-0">
                5
              </div>
              <h2 className="text-xl font-bold text-slate-900">Limitation of Liability</h2>
            </div>
            <p className="text-sm">
              StudyNoteHub is a marketplace connecting independent researchers with students and educators. Users are responsible for complying with their individual academic institutions' honor codes and submission guidelines. StudyNoteHub shall not be held liable for institutional disciplinary actions resulting from improper or uncredited use of reference materials.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
