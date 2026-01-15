'use client';

import { useState, useEffect, useMemo } from 'react';
import { subscribeAllVocabularies } from '@/lib/vocabService';
import type { Vocabulary } from '@/lib/vocabService';

interface GroupedVocabs {
    [date: string]: Vocabulary[];
}

export default function ListPage() {
    const [allVocabs, setAllVocabs] = useState<Vocabulary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch data
    useEffect(() => {
        const unsubscribe = subscribeAllVocabularies((vocabs) => {
            setAllVocabs(vocabs);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Group and Filter logic
    const { displayedVocabs, availableDates, groupedVocabs } = useMemo(() => {
        // 1. Filter by Search
        const searchFiltered = allVocabs.filter(v =>
            v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 2. Extract available dates from the FULL list (for the filter dropdown)
        const dates = Array.from(new Set(allVocabs.map(v => v.date))).sort().reverse();

        // 3. Filter by Date if selected
        const dateFiltered = selectedDate === 'all'
            ? searchFiltered
            : searchFiltered.filter(v => v.date === selectedDate);

        // 4. Group by date for "All" view
        const grouped: GroupedVocabs = {};
        if (selectedDate === 'all') {
            dateFiltered.forEach(vocab => {
                if (!grouped[vocab.date]) grouped[vocab.date] = [];
                grouped[vocab.date].push(vocab);
            });
        }

        return {
            displayedVocabs: dateFiltered,
            availableDates: dates,
            groupedVocabs: grouped
        };
    }, [allVocabs, selectedDate, searchTerm]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dateStr === todayStr) return 'Today';
        if (dateStr === yesterdayStr) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen pb-20 pt-12">
            <div className="max-w-5xl mx-auto px-6">

                {/* Header */}
                <header className="mb-10 reveal">
                    <h1 className="text-[34px] font-bold text-[var(--text-main)] mb-2 tracking-tight">
                        Library
                    </h1>
                    <p className="text-[var(--text-secondary)] text-[17px] leading-relaxed">
                        Your personal collection of {allVocabs.length} words.
                    </p>
                </header>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-12 reveal delay-100 sticky top-[60px] z-20">
                    {/* Search */}
                    <div className="relative flex-grow group">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] group-focus-within:text-[var(--primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search library..."
                            className="modern-input pl-11 h-[50px] w-full text-[17px] bg-[var(--bg-glass)] backdrop-blur-md"
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="relative min-w-[200px]">
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="modern-input h-[50px] w-full pl-4 pr-10 appearance-none cursor-pointer bg-[var(--bg-glass)] backdrop-blur-md text-[15px] font-medium"
                            style={{ backgroundImage: `url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2386868b%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
                        >
                            <option value="all">View All History</option>
                            {availableDates.map(date => (
                                <option key={date} value={date}>{formatDate(date)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content */}
                <div className="reveal delay-200">
                    {isLoading ? (
                        <div className="py-32 text-center">
                            <div className="inline-block w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-[var(--text-tertiary)] text-sm">Loading library...</p>
                        </div>
                    ) : displayedVocabs.length === 0 ? (
                        <div className="py-24 text-center bg-[var(--bg-sub)] rounded-[24px]">
                            <div className="w-16 h-16 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </div>
                            <p className="text-[var(--text-main)] font-semibold text-lg mb-1">No matches found</p>
                            <p className="text-[var(--text-secondary)]">Try adjusting your search or filters.</p>
                        </div>
                    ) : selectedDate !== 'all' ? (
                        // Specific Date View
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayedVocabs.map(vocab => (
                                <WordCard key={vocab.id} vocab={vocab} showDate={false} />
                            ))}
                        </div>
                    ) : (
                        // All View (Grouped)
                        <div className="space-y-12">
                            {Object.keys(groupedVocabs).sort().reverse().map(date => (
                                <div key={date}>
                                    <div className="sticky top-[130px] z-10 bg-[var(--bg-main)]/95 backdrop-blur-xl py-3 border-b border-[var(--border-light)] mb-6 flex items-center justify-between">
                                        <h3 className="text-[19px] font-bold text-[var(--text-main)]">
                                            {formatDate(date)}
                                        </h3>
                                        <span className="bg-[var(--bg-sub)] text-[var(--text-secondary)] text-xs font-bold px-2 py-1 rounded-[6px]">
                                            {groupedVocabs[date].length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {groupedVocabs[date].map(vocab => (
                                            <WordCard key={vocab.id} vocab={vocab} showDate={false} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function WordCard({ vocab, showDate = true }: { vocab: Vocabulary; showDate?: boolean }) {
    return (
        <div className="premium-card group p-5 hover:bg-[#fafafa] transition-colors relative overflow-hidden">
            {/* Hover Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 bg-[var(--bg-sub)] rounded-[14px] flex items-center justify-center text-[var(--primary)] font-bold text-lg group-hover:scale-105 transition-transform duration-300">
                    {vocab.word.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex justify-between items-start">
                        <h3 className="text-[17px] font-semibold text-[var(--text-main)] leading-snug mb-1">
                            {vocab.word}
                        </h3>
                        {showDate && (
                            <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                                {vocab.date.split('-').slice(1).join('/')}
                            </span>
                        )}
                    </div>
                    <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                        {vocab.meaning}
                    </p>
                </div>
            </div>
        </div>
    );
}
