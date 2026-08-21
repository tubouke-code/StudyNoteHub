'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  BookOpen, 
  PenTool, 
  Wallet, 
  Shield, 
  UploadCloud, 
  FileText, 
  X, 
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{
    id: string;
    title: string;
    subtitle: string;
    url: string;
    icon: any;
    category: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open command palette
          window.dispatchEvent(new CustomEvent('open-command-palette'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Default Quick Navigation Shortcuts based on role
  const defaultActions = React.useMemo(() => {
    const actions = [
      { id: 'browse-notes', title: 'Browse Study Notes & Projects', subtitle: 'Search course codes, past questions & summaries', url: '/notes', icon: BookOpen, category: 'Navigation' },
      { id: 'hire-writer', title: 'Commission New Academic Project', subtitle: 'Post custom paper requirements for writer bids', url: '/hire-writer/new', icon: PenTool, category: 'Academic Services' },
      { id: 'referrals', title: 'Affiliate & Referral Dashboard', subtitle: 'Earn 5% recurring lifetime royalties', url: '/referrals', icon: Sparkles, category: 'Earnings' },
    ];

    if (user?.role === 'WRITER' || user?.role === 'ADMIN') {
      actions.push(
        { id: 'writer-jobs', title: 'Open Project Feed & Bidding', subtitle: 'Bid on live student orders and earn', url: '/writer-dashboard', icon: PenTool, category: 'Writer Hub' },
        { id: 'upload-notes', title: 'Upload & Sell Study Material', subtitle: 'Earn 90% royalty per download', url: '/notes/upload', icon: UploadCloud, category: 'Writer Hub' }
      );
    }

    if (user?.role === 'ADMIN') {
      actions.unshift(
        { id: 'admin-portal', title: 'Super Admin Operations Center', subtitle: 'Moderate notes, manage users, disputes & finances', url: '/admin', icon: Shield, category: 'Admin' }
      );
    }

    if (user?.role === 'STUDENT') {
      actions.unshift(
        { id: 'hirer-dashboard', title: 'Hirer Command Center', subtitle: 'Manage orders, live bids, wallet & downloads', url: '/dashboard', icon: Wallet, category: 'Dashboard' }
      );
    }

    return actions;
  }, [user]);

  // Perform live search across documents & navigation
  useEffect(() => {
    if (!query.trim()) {
      setResults(defaultActions);
      return;
    }

    const term = query.toLowerCase().trim();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data: docs } = await supabase
          .from('documents')
          .select('id, title, course_code, institution, price')
          .or(`title.ilike.%${term}%,course_code.ilike.%${term}%,institution.ilike.%${term}%`)
          .limit(6);

        const matchedActions = defaultActions.filter(
          a => a.title.toLowerCase().includes(term) || a.subtitle.toLowerCase().includes(term) || a.category.toLowerCase().includes(term)
        );

        const docResults = (docs || []).map(d => ({
          id: d.id,
          title: `[${d.course_code || 'NOTE'}] ${d.title}`,
          subtitle: `${d.institution || 'University Repository'} • ₦${Number(d.price).toLocaleString()}`,
          url: `/notes/${d.id}`,
          icon: BookOpen,
          category: 'Study Materials'
        }));

        setResults([...matchedActions, ...docResults]);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, defaultActions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a course code (e.g. ECO401), topic, or action..."
            autoFocus
            className="w-full text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 divide-y divide-slate-50">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No matching results found</p>
              <p className="text-xs text-slate-400">Try searching for a course code like "CSC201" or "Post Project"</p>
            </div>
          ) : (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onClose();
                    router.push(item.url);
                  }}
                  className="w-full p-3.5 flex items-center justify-between gap-4 rounded-2xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">{item.title}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Navigate with <strong>↑</strong> <strong>↓</strong> and <strong>Enter</strong></span>
          <span>Press <strong>Ctrl + K</strong> anytime</span>
        </div>
      </div>
    </div>
  );
}
