'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  backHref,
  backLabel,
}: {
  items: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
}) {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between gap-4 py-2.5 text-xs text-slate-500 overflow-x-auto">
      {/* Breadcrumb Trail */}
      <ol className="flex items-center gap-1.5 shrink-0">
        <li>
          <Link href="/" className="hover:text-slate-900 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <li className="shrink-0">
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-slate-900 transition-colors font-medium">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs block">
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>

      {/* Quick Back Button */}
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all font-semibold shrink-0 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel || 'Back'}</span>
        </Link>
      ) : (
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all font-semibold shrink-0 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel || 'Back'}</span>
        </button>
      )}
    </nav>
  );
}
