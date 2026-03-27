'use client';

import { useState, useEffect, useMemo } from 'react';
import { subscribeAllVocabularies, deleteVocabulary, updateVocabulary } from '@/lib/vocabService';
import type { Vocabulary } from '@/lib/vocabService';

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';
type FilterMode = 'all' | 'month' | 'date';

export default function ManagePage() {
    const [allVocabs, setAllVocabs] = useState<Vocabulary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    // Filter & Sort States
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    // Editing State
    const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);
    const [editWord, setEditWord] = useState('');
    const [editMeaning, setEditMeaning] = useState('');
    const [editDate, setEditDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch data
    useEffect(() => {
        const unsubscribe = subscribeAllVocabularies((vocabs) => {
            setAllVocabs(vocabs);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Filter Logic
    const processedVocabs = useMemo(() => {
        let filtered = allVocabs.filter(v =>
            v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'a-z': return a.word.localeCompare(b.word);
                case 'z-a': return b.word.localeCompare(a.word);
                default: return 0;
            }
        });

        return filtered;
    }, [allVocabs, searchTerm, sortBy]);

    const handleDelete = async (id: string, wordStr: string) => {
        if (confirm(`Are you sure you want to delete "${wordStr}"?`)) {
            try {
                await deleteVocabulary(id);
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Failed to delete vocabulary. See console for details.");
            }
        }
    };

    const handleEditClick = (vocab: Vocabulary) => {
        setEditingVocab(vocab);
        setEditWord(vocab.word);
        setEditMeaning(vocab.meaning);
        setEditDate(vocab.date);
    };

    const handleSaveEdit = async () => {
        if (!editingVocab) return;
        if (!editWord.trim() || !editMeaning.trim() || !editDate.trim()) {
            alert("Please fill in all fields.");
            return;
        }

        setIsSaving(true);
        try {
            await updateVocabulary(editingVocab.id, editWord, editMeaning, editDate);
            setEditingVocab(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update vocabulary.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen pb-24 md:pb-32 bg-[var(--bg-main)]">
            <div className="max-w-3xl mx-auto px-6 pt-4 md:pt-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 reveal">
                    <div>
                        <p className="text-[13px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                            Admin Mode
                        </p>
                        <h1 className="text-[34px] md:text-[40px] font-bold text-[var(--text-main)] tracking-tight leading-none">
                            Manage Words
                        </h1>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-glass-strong)] border border-[var(--border-light)] rounded-full shadow-sm backdrop-blur-md">
                            <span className="text-xs font-semibold text-[var(--text-secondary)]">
                                Total Words: {allVocabs.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex gap-3 mb-10 reveal delay-100 top-24 z-20">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search to edit/delete..."
                            className="w-full h-[54px] pl-11 pr-4 bg-white/80 backdrop-blur-xl border border-transparent focus:border-[var(--primary)]/10 rounded-[18px] text-[17px] font-semibold text-[var(--text-main)] placeholder:text-gray-400 focus:ring-0 transition-all outline-none shadow-sm hover:shadow-md focus:shadow-lg focus:bg-white"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="h-[54px] px-4 rounded-[18px] bg-white border-none shadow-sm text-[15px] font-bold text-[var(--text-main)] outline-none"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="a-z">A - Z</option>
                        <option value="z-a">Z - A</option>
                    </select>
                </div>

                {/* Content List */}
                <div className="reveal delay-200 pb-20">
                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : processedVocabs.length === 0 ? (
                        <div className="text-center py-20 opacity-60">
                            <div className="w-16 h-16 bg-[var(--bg-sub)] rounded-[20px] flex items-center justify-center mx-auto mb-4 grayscale">
                                <span className="text-3xl">🔍</span>
                            </div>
                            <p className="text-[var(--text-main)] font-medium">No words found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {processedVocabs.map(vocab => (
                                <div key={vocab.id} className="group bg-white rounded-[24px] p-5 shadow-sm hover:shadow-float border border-transparent hover:border-[var(--border-light)] transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-sub)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative flex items-center gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-[18px] flex items-center justify-center bg-[#f5f5f7] text-[var(--primary)] text-xl font-black shadow-inner">
                                            {vocab.word.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-[18px] font-bold text-[var(--text-main)] truncate leading-snug">
                                                    {vocab.word}
                                                </h3>
                                                <span className="text-[11px] font-semibold text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-md">
                                                    {vocab.date}
                                                </span>
                                            </div>
                                            <p className="text-[15px] text-[var(--text-secondary)] line-clamp-1">
                                                {vocab.meaning}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative flex items-center gap-2 self-end md:self-auto mt-2 md:mt-0">
                                        <button
                                            onClick={() => handleEditClick(vocab)}
                                            className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm hover:bg-blue-100 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vocab.id, vocab.word)}
                                            className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Edit Modal */}
            {editingVocab && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => setEditingVocab(null)} />
                    <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-6 md:p-8 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="mb-6">
                            <h2 className="text-[22px] font-bold text-[var(--text-main)] leading-tight mb-2">Edit Vocabulary</h2>
                            <p className="text-[15px] text-[var(--text-secondary)]">Make changes to your saved word.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 pl-1">Word</label>
                                <input
                                    type="text"
                                    value={editWord}
                                    onChange={e => setEditWord(e.target.value)}
                                    className="w-full h-[54px] px-4 rounded-[18px] bg-[#f5f5f7] border-2 border-transparent focus:border-[var(--primary)] focus:bg-white text-[17px] font-semibold text-[var(--text-main)] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 pl-1">Meaning</label>
                                <input
                                    type="text"
                                    value={editMeaning}
                                    onChange={e => setEditMeaning(e.target.value)}
                                    className="w-full h-[54px] px-4 rounded-[18px] bg-[#f5f5f7] border-2 border-transparent focus:border-[var(--primary)] focus:bg-white text-[17px] font-semibold text-[var(--text-main)] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 pl-1">Date</label>
                                <input
                                    type="date"
                                    value={editDate}
                                    onChange={e => setEditDate(e.target.value)}
                                    className="w-full h-[54px] px-4 rounded-[18px] bg-[#f5f5f7] border-2 border-transparent focus:border-[var(--primary)] focus:bg-white text-[17px] font-semibold text-[var(--text-main)] outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setEditingVocab(null)}
                                className="flex-1 h-[54px] bg-[#f5f5f7] text-[var(--text-main)] rounded-[18px] font-bold text-[17px] hover:bg-[#ebebeb] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="flex-1 h-[54px] bg-[var(--primary)] text-white rounded-[18px] font-bold text-[17px] shadow-lg shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
