'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  BookOpen, 
  FileCheck, 
  AlertTriangle, 
  Scale, 
  Award, 
  CheckCircle2, 
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Lock
} from 'lucide-react';

export default function AcademicIntegrityPolicyPage() {
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
            <span>Ethical Research & Originality Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Academic Integrity Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            StudyNoteHub is built to empower students, educators, and scholars with authentic study materials and ethical research assistance. We strictly enforce originality, fair use, and academic rigor.
          </p>
          <div className="pt-2 text-xs text-slate-400">
            Last Updated: August 2026 • Applies to all Students, Writers, and Uploaders
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
              <h2 className="text-xl font-bold text-slate-900">Purpose & Intended Use of Materials</h2>
            </div>
            <p className="text-sm">
              All deliverables, custom research papers, dissertation guides, seminar models, sample analyses, and study notes provided on StudyNoteHub are strictly intended as <strong>reference models, study aids, and academic templates</strong>. 
            </p>
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 text-xs space-y-2">
              <p className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                Permissible Uses:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                <li>Using provided research models to understand methodology, structure, and theoretical frameworks.</li>
                <li>Reviewing verified statistical interpretations (SPSS, STATA, R, Python) to guide your empirical analysis.</li>
                <li>Utilizing lecture notes, past exam solutions, and summaries for revision and examination preparation.</li>
                <li>Properly citing ideas, excerpts, and references in accordance with institutional citation styles (APA, MLA, Harvard, IEEE).</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base shrink-0">
                2
              </div>
              <h2 className="text-xl font-bold text-slate-900">Originality & Turnitin Anti-Plagiarism Protocol</h2>
            </div>
            <p className="text-sm">
              StudyNoteHub maintains a zero-tolerance policy against academic dishonesty and verbatim plagiarism. All accredited writers contractually agree to the following standards:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-extrabold uppercase text-emerald-700">Turnitin Verified</span>
                <h4 className="text-sm font-bold text-slate-900">Under 15% Similarity Threshold</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every custom project submission must produce a genuine similarity index under 15% (excluding standard bibliographic references and universal phrasing).
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-extrabold uppercase text-indigo-700">AI Integrity Check</span>
                <h4 className="text-sm font-bold text-slate-900">Human Intellectual Rigor</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated verbatim LLM dumps without empirical grounding, critical synthesis, or verified references are rejected from our platform.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-base shrink-0">
                3
              </div>
              <h2 className="text-xl font-bold text-slate-900">Prohibited Conduct & Misrepresentation</h2>
            </div>
            <p className="text-sm">
              To safeguard academic integrity, users of StudyNoteHub are strictly prohibited from engaging in any of the following activities:
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 text-red-950 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Direct Verbatim Submission:</strong> Submitting custom research deliverables word-for-word as your own institutional work without your personal synthesis and required academic contributions.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 text-red-950 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Copyright Infringement:</strong> Uploading copyrighted commercial textbooks, proprietary university faculty exams, or unauthorized intellectual property.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 text-red-950 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Fabricated Citations:</strong> Producing fake references, non-existent DOIs, or falsified empirical data sets.
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
              <h2 className="text-xl font-bold text-slate-900">Writer Accountability & Sanctions</h2>
            </div>
            <p className="text-sm">
              Accredited writers found in violation of our Academic Integrity guidelines face immediate administrative sanctions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 pl-2">
              <li><strong>Immediate Milestone Forfeiture:</strong> Escrowed funds are returned 100% to the student client if an unoriginal or plagiarized deliverable is submitted.</li>
              <li><strong>Accreditation Revocation:</strong> Permanent de-listing of writer profile and revocation of researcher accreditation token.</li>
              <li><strong>Catalog Deletion:</strong> Any published study materials failing plagiarism or copyright audits are deleted from the public store.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center font-black text-base shrink-0">
                5
              </div>
              <h2 className="text-xl font-bold text-slate-900">Reporting Academic Misconduct</h2>
            </div>
            <p className="text-sm">
              If you identify any material on StudyNoteHub that infringes your copyright or breaches academic ethics, please notify our moderation board immediately at <a href="mailto:integrity@studynotehub.com" className="text-indigo-600 font-bold hover:underline">integrity@studynotehub.com</a> with the document reference ID. Takedown notices are reviewed within 24 hours.
            </p>
          </section>

        </div>

        {/* Footer CTA */}
        <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base">Need Assistance with a Project Order?</h3>
            <p className="text-xs text-emerald-800">Review our 100% Escrow and dispute protection guidelines.</p>
          </div>
          <Link
            href="/terms"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shrink-0 transition-all"
          >
            View Terms of Escrow
          </Link>
        </div>

      </div>
    </div>
  );
}
