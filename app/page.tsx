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
    if (!word.trim() || !meaning.trim() || isAdding) return;

    setIsAdding(true);
    try {
      await addVocabulary(word, meaning, todayIso);
      setWord('');
      setMeaning('');
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      alert('Error adding vocabulary');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this word?')) return;
    try {
      await deleteVocabulary(id);
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="mb-10 reveal">
          <p className="text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            {formattedToday}
          </p>
          <div className="flex items-baseline justify-between">
            <h1 className="text-[34px] leading-tight font-bold text-[var(--text-main)] tracking-tight">
              Today's Vocabulary
            </h1>
            <div className="hidden sm:block">
              <span className="bg-[var(--bg-sub)] text-[var(--text-secondary)] px-3 py-1 rounded-full text-xs font-semibold">
                Total: {totalCount}
              </span>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="reveal delay-100 mb-12">
          <div className="premium-card p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary)]"></div>

            <form onSubmit={handleAddVocab} className="flex flex-col gap-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--text-secondary)] ml-1">Word</label>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="New Word"
                    className="modern-input w-full h-[50px] px-4"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--text-secondary)] ml-1">Meaning</label>
                  <input
                    type="text"
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    placeholder="Definition or example"
                    className="modern-input w-full h-[50px] px-4"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-[var(--text-tertiary)] hidden sm:block">
                  Press <span className="font-medium text-[var(--text-secondary)]">Enter</span> to save
                </p>
                <button
                  type="submit"
                  disabled={!word.trim() || !meaning.trim() || isAdding}
                  className="btn-modern btn-pink h-[44px] px-8 text-[15px] w-full sm:w-auto ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? 'Adding...' : 'Add Word'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Words List */}
        <div className="reveal delay-200">
          <h2 className="text-[22px] font-bold text-[var(--text-main)] mb-6 px-1">
            Latest Additions
          </h2>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : todayVocabs.length > 0 ? (
              todayVocabs.map((vocab) => (
                <div
                  key={vocab.id}
                  className="premium-card group p-5 flex items-center gap-5 hover:bg-[#fafafa] transition-colors"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-[12px] flex items-center justify-center bg-[var(--bg-sub)] text-[var(--primary)] font-bold text-lg shadow-sm shrink-0">
                    {vocab.word.charAt(0).toUpperCase()}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] font-semibold text-[var(--text-main)] leading-snug">
                      {vocab.word}
                    </h3>
                    <p className="text-[15px] text-[var(--text-secondary)] truncate">
                      {vocab.meaning}
                    </p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDelete(vocab.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:bg-[var(--bg-sub)] rounded-full transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="py-16 text-center bg-[var(--bg-sub)] rounded-[18px]">
                <p className="text-[var(--text-secondary)] font-medium">No words added today</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">Your collection starts here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
