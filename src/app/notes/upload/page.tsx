'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Sparkles, 
  ArrowRight,
  School,
  Tag,
  Layers,
  X
} from 'lucide-react';
import { INSTITUTIONS, LEVELS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

export default function UploadNotePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [institution, setInstitution] = useState(INSTITUTIONS[1]);
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('200L');
  const [pageCount, setPageCount] = useState('25');
  const [priceType, setPriceType] = useState<'FREE' | 'PAID'>('PAID');
  const [priceAmount, setPriceAmount] = useState('1500');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const parsedPrice = priceType === 'FREE' ? 0 : Number(priceAmount) || 0;
  const authorEarnings = parsedPrice * 0.85; // 85% creator payout

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseCode || !institution) {
      alert('Please fill in the required fields (Title, Course Code, and Institution).');
      return;
    }

    setIsSubmitting(true);
    // Simulate Supabase Storage upload & Database insertion
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
          Monetize Your Knowledge
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Upload Study Notes & Past Question Solutions
        </h1>
        <p className="text-sm text-slate-600">
          Share your high-yield lecture summaries with thousands of students. Set your own price and receive 85% payouts straight to your wallet on every download.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Document Uploaded Successfully!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your note <strong>"{title}"</strong> has been published to the StudyNoteHub catalog. You will receive real-time wallet notifications whenever a student unlocks it.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => router.push('/notes')}
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md"
            >
              View in Materials Catalog
            </button>
            <button
              onClick={() => {
                setIsSuccess(false);
                setTitle('');
                setFile(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
            >
              Upload Another Note
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md space-y-8">
          
          {/* 1. File Upload Dropzone */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Document File (PDF, DOCX, PPTX) <span className="text-red-500">*</span>
            </label>
            
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                file ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-300 hover:border-primary-400 bg-slate-50/50'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-between max-w-sm mx-auto p-3 rounded-xl bg-white border border-emerald-200 shadow-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div className="text-left truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Drag & Drop your document here, or <label className="text-primary-600 hover:underline cursor-pointer">browse files<input type="file" accept=".pdf,.docx,.pptx" onChange={handleFileChange} className="hidden" /></label>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, PPTX up to 50MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Document Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Note Title / Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Organic Chemistry & Reaction Mechanisms Master Guide"
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                placeholder="e.g. CHM 201"
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Course Full Title (Optional)
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. Intermediate Organic Chemistry"
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                University / Institution <span className="text-red-500">*</span>
              </label>
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500 bg-white"
              >
                {INSTITUTIONS.filter(i => i !== 'All Universities').map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Academic Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500 bg-white"
              >
                {LEVELS.filter(l => l !== 'All Levels').map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Department / Faculty
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Pure & Applied Sciences"
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Total Page Count
              </label>
              <input
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                placeholder="25"
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Detailed Summary & Syllabus Topics Covered
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is contained in this note (e.g. Module 1 to 4, includes midterm solutions and formula cheat sheet)..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-primary-500"
              />
            </div>

          </div>

          {/* 3. Pricing Tier & Royalty Calculator */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Set Access Price
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPriceType('FREE')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  priceType === 'FREE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <p className="font-extrabold text-sm">Offer for Free</p>
                <p className="text-xs text-slate-500 mt-0.5">Help fellow students & build reputation</p>
              </button>

              <button
                type="button"
                onClick={() => setPriceType('PAID')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  priceType === 'PAID'
                    ? 'border-primary-600 bg-primary-50 text-primary-900'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <p className="font-extrabold text-sm">Sell as Premium Note</p>
                <p className="text-xs text-slate-500 mt-0.5">Earn royalties on every single download</p>
              </button>
            </div>

            {priceType === 'PAID' && (
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
                <div className="w-full sm:w-48 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Price in Naira (₦)</label>
                  <input
                    type="number"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    placeholder="1500"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold outline-none focus:border-primary-500"
                  />
                </div>

                <div className="w-full sm:flex-1 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold">Your Royalty Payout: </span>
                    <span>85% creator rate</span>
                  </div>
                  <span className="text-sm font-black text-indigo-700">
                    {formatCurrency(authorEarnings)} / download
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Uploading to Supabase Storage & Publishing...</span>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                Publish Study Note to StudyNoteHub
              </>
            )}
          </button>

        </form>
      )}

    </div>
  );
}
