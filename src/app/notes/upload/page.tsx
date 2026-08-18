'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, 
  BookOpen, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Presentation,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES, INSTITUTIONS, LEVELS } from '@/lib/mock-data';

const MATERIAL_TYPES = [
  { id: 'lecture_note', name: 'Lecture Notes & Study Handouts', desc: 'Semester summaries & course outlines', icon: '📝' },
  { id: 'project_complete', name: 'Complete Final Year Project (Chapters 1-5)', desc: 'Full research work with questionnaires & methodology', icon: '📚' },
  { id: 'past_questions', name: 'Solved Past Exam Questions', desc: 'Step-by-step solutions to university exams', icon: '🎯' },
  { id: 'seminar_paper', name: 'Seminar Paper / Term Paper', desc: 'Detailed academic review paper', icon: '📑' },
  { id: 'presentation_deck', name: 'PowerPoint Slide Defense Deck', desc: 'Defense slides with charts and speaker notes', icon: '📊' },
];

export default function UploadNotesPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  const [materialType, setMaterialType] = useState('project_complete');
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [institution, setInstitution] = useState(INSTITUTIONS[1]);
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [level, setLevel] = useState('400L');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(3000);
  const [isFree, setIsFree] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Pre-written Material Royalty Calculations (90% to Creator, 10% Platform Hosting)
  const actualPrice = isFree ? 0 : Number(price) || 0;
  const creatorRoyaltyPerDownload = Math.round(actualPrice * 0.90);
  const platformHostingFee = actualPrice - creatorRoyaltyPerDownload;
  const estimatedSales = 25;
  const estimatedTotalEarnings = creatorRoyaltyPerDownload * estimatedSales;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login?redirect=/notes/upload');
      return;
    }

    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setUploadSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
            Monetize Pre-Written Work
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Upload & Sell Notes, Projects & Study Guides
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Earn <strong>90% recurring royalties</strong> every time another student downloads your work (only 10% platform hosting).
          </p>
        </div>

        {uploadSuccess ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Upload Submitted for Review!</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your material is in the <strong>Admin Moderation Queue</strong>. Once approved, it will be published to the catalog and start generating 90% royalties!
            </p>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-8">
            
            {/* Step 1: Select Material Type */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                1. What Type of Academic Material Are You Selling?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MATERIAL_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setMaterialType(type.id);
                      if (type.id === 'project_complete') setPrice(4500);
                      else if (type.id === 'presentation_deck') setPrice(2500);
                      else setPrice(1500);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start justify-between ${
                      materialType === type.id
                        ? 'border-primary-600 bg-primary-50/60 text-primary-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">{type.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{type.desc}</p>
                      </div>
                    </div>
                    {materialType === type.id && (
                      <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Document Details */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                2. Document Details & University Tagging
              </label>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design and Implementation of an Online Escrow System (Chapters 1-5 + Source Code)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Course Code / Subject</label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CSC 499 / Project"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Course Title</label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="e.g. Final Year Research Project"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">University / Institution</label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
                  >
                    {INSTITUTIONS.filter(i => i !== 'All Universities').map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category / Field</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All Materials').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Academic Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
                  >
                    {LEVELS.filter(l => l !== 'All Levels').map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Overview / Chapter Breakdown</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what chapters, tables, formulas, or solved questions are covered in this document..."
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Step 3: File Upload Dropzone */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                3. Upload PDF / Document File
              </label>

              <div className="border-2 border-dashed border-slate-300 hover:border-primary-500 rounded-3xl p-8 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="doc-upload"
                  required
                  accept=".pdf,.docx,.doc,.pptx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="doc-upload" className="cursor-pointer block space-y-3">
                  <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      {file ? file.name : 'Click to select or drag & drop document'}
                    </span>
                    <span className="text-xs text-slate-400">PDF, DOCX, or PPTX up to 50MB</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 4: Pricing & 90% Royalty Calculator (10% Platform Fee) */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  4. Set Your Price & Royalty Earnings (90% Creator Split)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4 accent-primary-600 rounded"
                  />
                  <span>Make this material FREE (₦0)</span>
                </label>
              </div>

              {!isFree && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Download Price (₦ NGN)</label>
                    <input
                      type="number"
                      min={200}
                      step={100}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 text-lg font-black text-slate-900 outline-none focus:border-primary-500"
                    />
                  </div>

                  {/* Royalty Calculator Preview Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950 text-white shadow-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400">Your Take-Home Royalty (90%)</span>
                        <p className="text-2xl font-black text-emerald-300">
                          {formatCurrency(creatorRoyaltyPerDownload)} <span className="text-xs font-normal text-slate-300">per download</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Platform Hosting (10%)</span>
                        <p className="text-sm font-bold text-slate-300">{formatCurrency(platformHostingFee)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Estimated Passive Earnings (at ~25 downloads):</span>
                      <span className="text-emerald-400 font-black text-base">{formatCurrency(estimatedTotalEarnings)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-sm shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading & Registering for Moderation...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Publish & Start Earning 90% Royalties
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
