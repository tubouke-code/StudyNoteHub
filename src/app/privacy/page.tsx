'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Server, 
  CreditCard, 
  UserCheck, 
  ArrowLeft,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
            <Lock className="w-4 h-4" />
            <span>Data Protection & Privacy Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Privacy & Data Security Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            At StudyNoteHub, your academic confidentiality and personal data security are paramount. This policy outlines how we collect, safeguard, and process your information in compliance with global data protection laws (NDPR / GDPR).
          </p>
          <div className="pt-2 text-xs text-slate-400">
            Effective Date: August 2026 • StudyNoteHub Inc.
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-10 text-slate-700 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-base shrink-0">
                1
              </div>
              <h2 className="text-xl font-bold text-slate-900">Information We Collect</h2>
            </div>
            <p className="text-sm">
              We only collect data strictly necessary to provide authentic peer-reviewed study materials, custom project order workspaces, and secure escrow settlement:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-extrabold uppercase text-indigo-700 text-[10px]">Account Profile</span>
                <p className="font-bold text-slate-900">Personal Information</p>
                <p className="text-slate-600">Full name, verified email address, tertiary institution, academic discipline, and user avatar.</p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-extrabold uppercase text-emerald-700 text-[10px]">Writer Verification</span>
                <p className="font-bold text-slate-900">Researcher Accreditation</p>
                <p className="text-slate-600">Academic credentials, writer portfolio, sample works, and payout bank account details.</p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-extrabold uppercase text-sky-700 text-[10px]">Workspaces</span>
                <p className="font-bold text-slate-900">Project Communications</p>
                <p className="text-slate-600">Encrypted in-app order messages, attached project drafts, and Turnitin similarity reports.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base shrink-0">
                2
              </div>
              <h2 className="text-xl font-bold text-slate-900">Academic Project Confidentiality & Non-Disclosure</h2>
            </div>
            <p className="text-sm">
              We enforce strict end-to-end confidentiality regarding your custom academic requests:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 pl-2">
              <li><strong>Zero Public Reselling:</strong> Custom academic projects delivered to a student client through escrow will never be re-uploaded or resold to another user.</li>
              <li><strong>Blind Bidding Privacy:</strong> Writers submitting project proposals only see project specifications and cannot view competing writers' bids or personal client identifiers.</li>
              <li><strong>Discreet Direct Messaging:</strong> Order communications are secured within the workspace. Contact exchange (phone numbers, private emails) is monitored to protect both parties under our 100% Escrow Guarantee.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-base shrink-0">
                3
              </div>
              <h2 className="text-xl font-bold text-slate-900">Payment Security & Bank Processing</h2>
            </div>
            <p className="text-sm">
              StudyNoteHub does not store full credit card numbers, CVVs, or PINs on our servers. All financial transactions are tokenized and processed by licensed, PCI-DSS compliant payment gateways:
            </p>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Paystack (Stripe Subsidiary):</strong> Secures automated card payments, instant bank transfers, and USSD checkouts.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Flutterwave:</strong> Secures international multi-currency checkouts, Mobile Money, and automated writer bank payouts.
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
              <h2 className="text-xl font-bold text-slate-900">Your Data Rights (NDPR & GDPR)</h2>
            </div>
            <p className="text-sm">
              You retain complete sovereignty over your personal academic information:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
              <li><strong>Right of Access:</strong> You can view all your uploaded materials, purchased downloads, and transaction history at any time.</li>
              <li><strong>Right to Rectification:</strong> You can edit your profile details, department, and institution within your account settings.</li>
              <li><strong>Right to Erasure:</strong> You may request complete account deletion and data removal by contacting our privacy officer.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center font-black text-base shrink-0">
                5
              </div>
              <h2 className="text-xl font-bold text-slate-900">Contact the Privacy Team</h2>
            </div>
            <p className="text-sm">
              If you have any questions or data inquiries regarding this policy, please reach out to <a href="mailto:privacy@studynotehub.com" className="text-indigo-600 font-bold hover:underline">privacy@studynotehub.com</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
