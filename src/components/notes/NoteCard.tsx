'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Star, 
  User, 
  School, 
  Eye, 
  CheckCircle, 
  Sparkles,
  Lock
} from 'lucide-react';
import { DocumentItem } from '@/types/database.types';
import { formatCurrency, formatFileSize } from '@/lib/utils';
import { PaymentModal } from '@/components/payments/PaymentModal';

interface NoteCardProps {
  note: DocumentItem;
}

export function NoteCard({ note }: NoteCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!note) return null;

  const isFree = Number(note.price || 0) === 0;

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFree) {
      setIsDownloaded(true);
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-primary-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
        
        {/* Top Header & Badges */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
              <FileText className="w-3.5 h-3.5" />
              {note.course_code}
            </span>

            {/* Price Badge */}
            {isFree ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                FREE
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-900">
                {formatCurrency(note.price)}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/notes/${note.id}`} className="block">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
              {note.title}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {note.description}
          </p>

          {/* Institution & Level */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
            <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{note.institution}</span>
            {note.level && (
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold shrink-0">
                {note.level}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3.5">
            <div className="flex items-center gap-1.5">
              <img
                src={note.uploader?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                alt={note.uploader?.full_name || 'Author'}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="truncate max-w-[110px] font-medium">{note.uploader?.full_name}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {note.rating.toFixed(1)}
              </span>
              <span className="text-slate-400">•</span>
              <span>{note.page_count} pgs</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/notes/${note.id}`}
              className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              Preview
            </Link>

            <button
              onClick={handleDownload}
              className={`w-full flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isFree
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/20'
              }`}
            >
              {isFree ? (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Unlock
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal for paid note */}
      {!isFree && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Unlock "${note.title}"`}
          amount={note.price}
          itemType="NOTE_PURCHASE"
          itemId={note.id}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            setIsDownloaded(true);
          }}
        />
      )}
    </>
  );
}
