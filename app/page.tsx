'use client';

import { useEffect, useMemo, useState } from 'react';
import { addVocabulary, deleteVocabulary, subscribeVocabulariesByDate, subscribeAllVocabularies } from '@/lib/vocabService';
import type { Vocabulary } from '@/lib/vocabService';

export default function Home() {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [todayVocabs, setTodayVocabs] = useState<Vocabulary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showError, setShowError] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Format date like iOS "Monday, 16 January"
  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  }, []);

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    setIsLoading(true);

    const unsubscribeToday = subscribeVocabulariesByDate(todayIso, (vocabs) => {
      setTodayVocabs(vocabs);
      setIsLoading(false);
    });

    const unsubscribeAll = subscribeAllVocabularies((vocabs) => {
      setTotalCount(vocabs.length);
    });

    return () => {
      unsubscribeToday();
      unsubscribeAll();
    };
  }, [todayIso]);

  const handleAddVocab = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation check
    if (!word.trim() || !meaning.trim()) {
      setShowError(true);
      // Shake animation or visual feedback could be added here
      return;
    }

    if (isAdding) return;

    setIsAdding(true);
    setShowError(false);

    try {
      // Auto-capitalize first letter of the word
      const formattedWord = word.trim().charAt(0).toUpperCase() + word.trim().slice(1);

      await addVocabulary(formattedWord, meaning.trim(), todayIso);
      setWord('');
      setMeaning('');
      // Focus back to word input if needed, but let's keep it clean
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      alert('Error adding vocabulary');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null); // Close window immediately for better UX

    try {
      await deleteVocabulary(id);
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-32">
      {/* Background Decor (Optional specific blurred blobs could go here for extra depth) */}

      <div className="max-w-3xl mx-auto px-6 pt-4 md:pt-4">

        {/* Header Section - Apple style centered or leading */}
        <div className="mb-10 reveal">
          <p className="text-[13px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            {formattedToday}
          </p>
          <div className="flex items-center gap-4">
            <h1 className="text-[34px] md:text-[40px] font-bold text-[var(--text-main)] tracking-tight leading-none">
              Today
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-[var(--border-light)] rounded-full shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Total: {totalCount}
              </span>
            </div>
          </div>
        </div>

        {/* Input Section - Glass Panel */}
        <div className="reveal delay-100 mb-12 top-24 z-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-2 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white/60">
            <form onSubmit={handleAddVocab} className="flex flex-col md:flex-row gap-4">

              {/* Word Input */}
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => { setWord(e.target.value); if (e.target.value) setShowError(false); }}
                  className={`w-full h-[60px] pl-6 pr-12 bg-white border-2 focus:border-[var(--primary)]/10 rounded-[20px] text-[17px] font-bold text-[var(--text-main)] placeholder:text-gray-300 placeholder:font-bold focus:ring-0 transition-all outline-none shadow-sm hover:shadow-md focus:shadow-lg ${showError && !word.trim() ? 'border-red-500 animate-pulse' : 'border-transparent'}`}
                  placeholder="New Word"
                  autoComplete="off"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-focus-within:text-[var(--primary)] transition-colors duration-300">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md group-focus-within:bg-[var(--primary)]/10">EN</span>
                </div>
              </div>

              {/* Meaning Input */}
              <div className="flex-[1.5] relative group">
                <input
                  type="text"
                  value={meaning}
                  onChange={(e) => { setMeaning(e.target.value); if (e.target.value) setShowError(false); }}
                  className={`w-full h-[60px] pl-6 pr-12 bg-white border-2 focus:border-[var(--primary)]/10 rounded-[20px] text-[17px] font-medium text-[var(--text-main)] placeholder:text-gray-300 placeholder:font-bold focus:ring-0 transition-all outline-none shadow-sm hover:shadow-md focus:shadow-lg ${showError && !meaning.trim() ? 'border-red-500 animate-pulse' : 'border-transparent'}`}
                  placeholder="Meaning"
                  autoComplete="off"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-focus-within:text-[var(--primary)] transition-colors duration-300">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md group-focus-within:bg-[var(--primary)]/10">TH</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="h-[60px] px-8 rounded-[20px] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-[15px] flex items-center justify-center gap-3 shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/40 hover:-translate-y-1 active:scale-[0.97] transition-all duration-300 min-w-[160px]"
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    <span>Add Word</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="reveal delay-200">

          {/* Divider with Text */}
          <div className="relative flex items-center gap-4 mb-8 opacity-80">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-light)] to-[var(--border-light)]"></div>
            <span className="text-[12px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
              Latest Added Today
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--border-light)] to-[var(--border-light)]"></div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : todayVocabs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {todayVocabs.map((vocab, index) => (
                <div
                  key={vocab.id}
                  className="group bg-white rounded-[20px] p-5 shadow-sm hover:shadow-md border border-[var(--border-light)] transition-all duration-300 relative overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Subtle gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-sub)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="relative flex items-center gap-4">
                    {/* Icon Logo */}
                    <div className="w-14 h-14 rounded-[18px] flex items-center justify-center bg-[var(--bg-sub)] text-[var(--primary)] text-xl font-black shadow-sm shrink-0 border border-[var(--border-light)] group-hover:scale-105 transition-transform duration-300">
                      {vocab.word.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-[19px] font-bold text-[var(--text-main)] mb-1 leading-tight group-hover:text-[var(--primary)] transition-colors">
                        {vocab.word}
                      </h3>
                      <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                        {vocab.meaning}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(vocab.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 opacity-60">
              <div className="w-16 h-16 bg-[var(--bg-sub)] rounded-[20px] flex items-center justify-center mx-auto mb-4 grayscale">
                <span className="text-3xl">✨</span>
              </div>
              <p className="text-[var(--text-main)] font-medium">No words yet today</p>
              <p className="text-sm text-[var(--text-secondary)]">Start adding to build your streak.</p>
            </div>
          )}
        </div>

      </div>

      {/* Custom Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={cancelDelete}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-6 transform scale-100 animate-in zoom-in-95 duration-200 border border-white/40">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>

            <h3 className="text-xl font-bold text-[var(--text-main)] text-center mb-2">
              Delete Word?
            </h3>
            <p className="text-[var(--text-secondary)] text-center mb-8 text-[15px] leading-relaxed">
              Are you sure you want to remove this word from your library? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 h-12 rounded-[16px] font-semibold text-[var(--text-main)] bg-[var(--bg-sub)] hover:bg-[#ebebeb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-12 rounded-[16px] font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all hover:-translate-y-0.5"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
