'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Sparkles, 
  School, 
  Tag, 
  Layers, 
  DollarSign, 
  UploadCloud, 
  SlidersHorizontal,
  X,
  Loader2
} from 'lucide-react';
import { CATEGORIES, INSTITUTIONS, LEVELS } from '@/lib/constants';
import { NoteCard } from '@/components/notes/NoteCard';
import { createClient } from '@/lib/supabase/client';
import { DocumentItem } from '@/types/database.types';
import Link from 'next/link';

export default function BrowseNotesPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('All Universities');
  const [selectedCategory, setSelectedCategory] = useState('All Materials');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('documents')
          .select('*, uploader:profiles(*)')
          .eq('status', 'APPROVED')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setDocuments(data as DocumentItem[]);
        }
      } catch (err) {
        console.error('Error fetching documents from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  const filteredNotes = useMemo(() => {
    return documents.filter((note) => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (note.institution && note.institution.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesInstitution = 
        selectedInstitution === 'All Universities' || 
        (note.institution && note.institution.toLowerCase().includes(selectedInstitution.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All Materials' ||
        (note.faculty && note.faculty.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (note.department && note.department.toLowerCase().includes(selectedCategory.toLowerCase()));

      const matchesLevel = 
        selectedLevel === 'All Levels' || note.level === selectedLevel;

      const matchesPrice = 
        priceFilter === 'ALL' ||
        (priceFilter === 'FREE' && Number(note.price) === 0) ||
        (priceFilter === 'PAID' && Number(note.price) > 0);

      return matchesSearch && matchesInstitution && matchesCategory && matchesLevel && matchesPrice;
    });
  }, [documents, searchQuery, selectedInstitution, selectedCategory, selectedLevel, priceFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedInstitution('All Universities');
    setSelectedCategory('All Materials');
    setSelectedLevel('All Levels');
    setPriceFilter('ALL');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-900 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-300">
            Study Repository
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Browse Lecture Notes & Materials
          </h1>
          <p className="text-sm text-slate-300">
            Download verified course notes, past exams solutions, and research materials with instant in-browser sample previews.
          </p>
        </div>
        <Link
          href="/notes/upload"
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          Upload & Sell Notes (90% Cut)
        </Link>
      </div>

      {/* Main Layout (Filters + Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary-600" />
              Filter Materials
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-primary-600 hover:underline font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Pricing Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pricing Tier
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(['ALL', 'FREE', 'PAID'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setPriceFilter(tier)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    priceFilter === tier
                      ? 'bg-white text-primary-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tier === 'ALL' ? 'All' : tier === 'FREE' ? 'Free' : 'Paid'}
                </button>
              ))}
            </div>
          </div>

          {/* University / Institution Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5" /> Institution
            </label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white focus:border-primary-500 outline-none"
            >
              {INSTITUTIONS.map((inst) => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Academic Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white focus:border-primary-500 outline-none"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Subject Category
            </label>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Notes Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Search bar & Mobile filter button */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search course code, topic, department or keyword..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium outline-none focus:border-primary-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center gap-2 text-sm font-semibold shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-primary-600" />
              Filters
            </button>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <p>
              Showing <strong className="text-slate-900">{filteredNotes.length}</strong> study materials
            </p>
          </div>

          {/* Loading, Empty State, or Grid */}
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span>Loading live materials from database...</span>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No study notes found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No materials currently match your search. Be the first to upload lecture notes or complete projects to start earning!
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  Clear Filters
                </button>
                <Link
                  href="/notes/upload"
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700"
                >
                  Upload Note
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}

        </main>

      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Filter Materials</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Pricing Tier</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(['ALL', 'FREE', 'PAID'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setPriceFilter(tier)}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      priceFilter === tier
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Institution</label>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full mt-2 p-3 rounded-xl border border-slate-200 text-sm font-medium"
              >
                {INSTITUTIONS.map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md"
            >
              Apply Filters ({filteredNotes.length} Results)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
