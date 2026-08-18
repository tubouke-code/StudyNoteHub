'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Loader2,
  Download
} from 'lucide-react';

interface TurnitinReportCardProps {
  similarityScore: number;
  aiScore: number;
  fileName: string;
  reportUrl?: string;
  onRescan?: () => void;
}

export function TurnitinReportCard({
  similarityScore,
  aiScore,
  fileName,
  reportUrl = 'https://turnitin.com',
  onRescan,
}: TurnitinReportCardProps) {
  const [isScanning, setIsScanning] = useState(false);

  const isSimilarityClean = similarityScore <= 15;
  const isAIClean = aiScore <= 10;

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (onRescan) onRescan();
    }, 2000);
  };

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Turnitin Originality & AI Report
              </h4>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                Official Scan
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-xs">{fileName}</p>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Re-run Turnitin Scan"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Similarity Score */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isSimilarityClean
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-red-50/70 border-red-200 text-red-950'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Similarity Index
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                isSimilarityClean ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {similarityScore}%
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {isSimilarityClean ? '(Acceptable <15%)' : '(High Plagiarism)'}
            </span>
          </div>
        </div>

        {/* AI Score */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isAIClean
              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            AI Content Score
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                isAIClean ? 'text-indigo-700' : 'text-amber-700'
              }`}
            >
              {aiScore}%
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {isAIClean ? '(100% Human)' : '(AI Generated)'}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Notice */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
          {isSimilarityClean && isAIClean ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Repository benchmark passed. Safe to submit.</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span className="text-red-600 font-bold">Requires revision before release.</span>
            </>
          )}
        </div>

        <a
          href={reportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:underline"
        >
          View Full Breakdown <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
