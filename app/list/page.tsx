'use client';

import { useState, useEffect, useMemo } from 'react';
import { subscribeAllVocabularies } from '@/lib/vocabService';
import type { Vocabulary } from '@/lib/vocabService';

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';
type FilterMode = 'all' | 'month';

interface GroupedVocabs {
    [key: string]: Vocabulary[];
}

export default function ListPage() {
    const [allVocabs, setAllVocabs] = useState<Vocabulary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    // Filter & Sort States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filterMode, setFilterMode] = useState<FilterMode>('all');

    // Month/Year Selection defaults to current
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Available Years for dropdown (from data)
    const availableYears = useMemo(() => {
        const years = new Set(allVocabs.map(v => new Date(v.date).getFullYear()));
        years.add(new Date().getFullYear());
        return Array.from(years).sort((a, b) => b - a);
    }, [allVocabs]);

    // Fetch data
    useEffect(() => {
        const unsubscribe = subscribeAllVocabularies((vocabs) => {
            setAllVocabs(vocabs);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Filter Logic
    const { processedVocabs, groupingType } = useMemo(() => {
        // 1. Text Search
        let filtered = allVocabs.filter(v =>
            v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 2. Time Filter
        if (filterMode === 'month') {
            filtered = filtered.filter(v => {
                const d = new Date(v.date);
                return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
            });
        }

        // 3. Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'a-z': return a.word.localeCompare(b.word);
                case 'z-a': return b.word.localeCompare(a.word);
                default: return 0;
            }
        });

        // 4. Grouping Strategy
        const groups: GroupedVocabs = {};
        const isDateSort = sortBy === 'newest' || sortBy === 'oldest';

        if (isDateSort) {
            // Group by Date
            filtered.forEach(vocab => {
                if (!groups[vocab.date]) groups[vocab.date] = [];
                groups[vocab.date].push(vocab);
            });
        } else {
            // Group by First Letter
            filtered.forEach(vocab => {
                const letter = vocab.word.charAt(0).toUpperCase();
                if (!groups[letter]) groups[letter] = [];
                groups[letter].push(vocab);
            });
        }

        return {
            processedVocabs: groups,
            groupingType: isDateSort ? 'date' : 'letter'
        };
    }, [allVocabs, searchTerm, sortBy, filterMode, selectedMonth, selectedYear]);

    // Helpers
    const formatDateHeader = (dateStr: string) => {
        const date = new Date(dateStr);
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateStr === todayStr) return 'Today';
        return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const getMonthName = (monthIndex: number) => {
        return new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });
    };

    return (
        <div className="min-h-screen pb-24 md:pb-32 bg-[var(--bg-main)]">
            <div className="max-w-3xl mx-auto px-6 pt-4 md:pt-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 reveal">
                    <div>
                        <p className="text-[13px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                            Your Collection
                        </p>
                        <h1 className="text-[34px] md:text-[40px] font-bold text-[var(--text-main)] tracking-tight leading-none">
                            Library
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
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full h-[54px] pl-11 pr-4 bg-white/80 backdrop-blur-xl border border-transparent focus:border-[var(--primary)]/10 rounded-[18px] text-[17px] font-semibold text-[var(--text-main)] placeholder:text-gray-400 focus:ring-0 transition-all outline-none shadow-sm hover:shadow-md focus:shadow-lg focus:bg-white"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`h-[54px] px-5 rounded-[18px] font-bold text-[15px] flex items-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95 ${isFilterOpen || filterMode !== 'all' || sortBy !== 'newest'
                                ? 'bg-[var(--text-main)] text-white'
                                : 'bg-white text-[var(--text-main)] hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        <span>Filter</span>
                        {(filterMode !== 'all' || sortBy !== 'newest') && (
                            <div className="w-2 h-2 rounded-full bg-[var(--primary)] ml-1" />
                        )}
                    </button>
                </div>

                {/* Content List */}
                <div className="reveal delay-200 pb-20">
                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : Object.keys(processedVocabs).length === 0 ? (
                        <div className="text-center py-20 opacity-60">
                            <div className="w-16 h-16 bg-[var(--bg-sub)] rounded-[20px] flex items-center justify-center mx-auto mb-4 grayscale">
                                <span className="text-3xl">🔍</span>
                            </div>
                            <p className="text-[var(--text-main)] font-medium">No words found</p>
                            <p className="text-sm text-[var(--text-secondary)]">Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Sort keys primarily by logic (Date desc/asc or Letter asc/desc) */}
                            {Object.keys(processedVocabs).map(groupKey => (
                                <div key={groupKey}>
                                    <div className="top-[160px] z-10 py-3 mb-4 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-light)] to-transparent" />
                                        <span className="text-[13px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider bg-[var(--bg-main)] px-3 py-1 rounded-full border border-[var(--border-light)]/50 shadow-sm backdrop-blur-md">
                                            {groupingType === 'date' ? formatDateHeader(groupKey) : groupKey}
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-light)] to-transparent" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {processedVocabs[groupKey].map(vocab => (
                                            <WordCard key={vocab.id} vocab={vocab} showDate={groupingType !== 'date'} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Premium Filter Modal */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsFilterOpen(false)}
                    />

                    {/* Modal Panel */}
                    <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between bg-white/80 backdrop-blur-xl">
                            <h2 className="text-[19px] font-bold text-[var(--text-main)]">Filter & Sort</h2>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#86868b] hover:bg-[#ebebeb] hover:text-[#1d1d1f] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">

                            {/* 1. Sort Section */}
                            <div>
                                <label className="block text-[13px] font-bold text-[#86868b] uppercase tracking-wider mb-3 pl-1">
                                    Sort By
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <FilterChip
                                        label="Newest First"
                                        active={sortBy === 'newest'}
                                        onClick={() => setSortBy('newest')}
                                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    />
                                    <FilterChip
                                        label="Oldest First"
                                        active={sortBy === 'oldest'}
                                        onClick={() => setSortBy('oldest')}
                                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    />
                                    <FilterChip
                                        label="A - Z"
                                        active={sortBy === 'a-z'}
                                        onClick={() => setSortBy('a-z')}
                                        icon={<span className="text-xs font-bold">AZ</span>}
                                    />
                                    <FilterChip
                                        label="Z - A"
                                        active={sortBy === 'z-a'}
                                        onClick={() => setSortBy('z-a')}
                                        icon={<span className="text-xs font-bold">ZA</span>}
                                    />
                                </div>
                            </div>

                            {/* 2. Time Period Section */}
                            <div>
                                <label className="block text-[13px] font-bold text-[#86868b] uppercase tracking-wider mb-3 pl-1">
                                    Time Period
                                </label>
                                <div className="space-y-3">
                                    {/* All Time Option */}
                                    <div
                                        onClick={() => setFilterMode('all')}
                                        className={`flex items-center gap-3 p-4 rounded-[16px] border cursor-pointer transition-all ${filterMode === 'all'
                                                ? 'border-[var(--primary)] bg-[rgba(250,45,72,0.03)] ring-1 ring-[var(--primary)]'
                                                : 'border-[#e5e5e5] hover:border-[#d1d1d1] bg-white'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${filterMode === 'all' ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[#d1d1d1]'
                                            }`}>
                                            {filterMode === 'all' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <span className={`text-[15px] font-medium ${filterMode === 'all' ? 'text-[var(--primary)]' : 'text-[#1d1d1f]'}`}>
                                            All History
                                        </span>
                                    </div>

                                    {/* Specific Month Option */}
                                    <div
                                        onClick={() => setFilterMode('month')}
                                        className={`p-4 rounded-[16px] border cursor-pointer transition-all ${filterMode === 'month'
                                                ? 'border-[var(--primary)] bg-[rgba(250,45,72,0.03)] ring-1 ring-[var(--primary)]'
                                                : 'border-[#e5e5e5] hover:border-[#d1d1d1] bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${filterMode === 'month' ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[#d1d1d1]'
                                                }`}>
                                                {filterMode === 'month' && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                            <span className={`text-[15px] font-medium ${filterMode === 'month' ? 'text-[var(--primary)]' : 'text-[#1d1d1f]'}`}>
                                                Specific Month
                                            </span>
                                        </div>

                                        {/* Dropdowns (Only active if selected) */}
                                        <div className={`flex gap-3 pl-8 transition-opacity duration-200 ${filterMode === 'month' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                            <div className="flex-1 relative">
                                                <select
                                                    value={selectedMonth}
                                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                                    className="w-full h-10 pl-3 pr-8 rounded-lg bg-[#f5f5f7] text-[15px] font-medium text-[#1d1d1f] appearance-none outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                                >
                                                    {Array.from({ length: 12 }, (_, i) => (
                                                        <option key={i} value={i}>{getMonthName(i)}</option>
                                                    ))}
                                                </select>
                                                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                            <div className="w-[100px] relative">
                                                <select
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                    className="w-full h-10 pl-3 pr-8 rounded-lg bg-[#f5f5f7] text-[15px] font-medium text-[#1d1d1f] appearance-none outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                                >
                                                    {availableYears.map(year => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-[#f0f0f0] bg-[#fafafa]">
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-full h-[54px] bg-[var(--text-main)] text-white rounded-[18px] font-bold text-[17px] shadow-lg shadow-black/5 active:scale-[0.98] transition-all"
                            >
                                Apply Changes
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

function FilterChip({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon?: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-[16px] border transition-all duration-200 h-[80px] ${active
                    ? 'border-[var(--primary)] bg-[rgba(250,45,72,0.04)] text-[var(--primary)] shadow-sm'
                    : 'border-[#e5e5e5] bg-white text-[#86868b] hover:border-[#d1d1d1]'
                }`}
        >
            {icon && <div className={active ? 'text-[var(--primary)]' : 'text-[#86868b]'}>{icon}</div>}
            <span className="text-[13px] font-bold">{label}</span>
        </button>
    );
}

function WordCard({ vocab, showDate }: { vocab: Vocabulary; showDate?: boolean }) {
    return (
        <div className="group bg-white rounded-[24px] p-5 shadow-sm hover:shadow-float border border-transparent hover:border-[var(--border-light)] transition-all duration-300 relative overflow-hidden">
            {/* Subtle gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-sub)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-[18px] flex items-center justify-center bg-[#f5f5f7] text-[var(--primary)] text-xl font-black shadow-inner">
                    {vocab.word.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                        <h3 className="text-[18px] font-bold text-[var(--text-main)] truncate leading-snug">
                            {vocab.word}
                        </h3>
                        {showDate && (
                            <span className="text-[11px] font-semibold text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-md">
                                {vocab.date.split('-').slice(1).join('/')}
                            </span>
                        )}
                    </div>
                    <p className="text-[15px] text-[var(--text-secondary)] line-clamp-1">
                        {vocab.meaning}
                    </p>
                </div>
            </div>
        </div>
    );
}
