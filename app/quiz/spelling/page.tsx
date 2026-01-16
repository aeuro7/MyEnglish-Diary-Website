'use client';

import { useState, useEffect, useMemo } from 'react';
import { subscribeAllVocabularies } from '@/lib/vocabService';
import type { Vocabulary } from '@/lib/vocabService';
import Link from 'next/link';

type FilterMode = 'all' | 'month';

export default function SpellingGamePage() {
    const [allVocabs, setAllVocabs] = useState<Vocabulary[]>([]);
    const [gameVocabs, setGameVocabs] = useState<Vocabulary[]>([]);

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterMode, setFilterMode] = useState<FilterMode>('all');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [currentVocab, setCurrentVocab] = useState<Vocabulary | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');
    const [isLoading, setIsLoading] = useState(true);

    const availableYears = useMemo(() => {
        const years = new Set(allVocabs.map(v => new Date(v.date).getFullYear()));
        years.add(new Date().getFullYear());
        return Array.from(years).sort((a, b) => b - a);
    }, [allVocabs]);

    const filteredVocabs = useMemo(() => {
        if (filterMode === 'all') return allVocabs;
        return allVocabs.filter(v => {
            const d = new Date(v.date);
            return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        });
    }, [filterMode, selectedMonth, selectedYear, allVocabs]);

    const getMonthName = (monthIndex: number) => {
        return new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });
    };

    useEffect(() => {
        const unsubscribe = subscribeAllVocabularies((vocabs) => {
            setAllVocabs(vocabs);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const startGame = () => {
        if (filteredVocabs.length < 1) {
            alert('你需要至少1个单词来开始!');
            return;
        }
        setGameVocabs(filteredVocabs);
        setScore(0);
        setTotalQuestions(0);
        setGameState('playing');
        generateQuestion(filteredVocabs);
    };

    const generateQuestion = (pool = gameVocabs) => {
        if (pool.length === 0) return;
        const randomIndex = Math.floor(Math.random() * pool.length);
        setCurrentVocab(pool[randomIndex]);
        setSelectedAnswer('');
        setIsCorrect(null);
    };

    const handleAnswer = (answer: string) => {
        if (isCorrect !== null) return;

        const target = currentVocab?.word?.trim().toLowerCase() || '';
        const input = answer.trim().toLowerCase();
        const correct = input === target;

        setIsCorrect(correct);
        setTotalQuestions(prev => prev + 1);
        if (correct) setScore(prev => prev + 1);

        // Does not auto advance for spelling? User has to click next usually, or wait?
        // Original logic didn't auto advance for spelling, it showed result then Next button.
        // But if correct, maybe auto advance?
        // Let's stick to manual next or auto if correct after delay?
        // The original logic didn't auto advance for spelling. It showed a Next button.
        // Wait, checking original code... "Auto advance ONLY for non-spelling modes". Correct.
    };

    return (
        <div className="min-h-screen pb-20 pt-12">
            <div className="max-w-3xl mx-auto px-6">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/quiz" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm font-semibold transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Menu
                    </Link>
                </div>

                {gameState === 'idle' ? (
                    <div className="premium-card p-10 text-center reveal delay-100 max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <h2 className="text-[22px] font-bold text-[var(--text-main)] mb-3">Spelling</h2>
                        <p className="text-[var(--text-secondary)] mb-8">
                            Listen (or read) and type the correct word.
                        </p>

                        {/* Filter Trigger Button */}
                        <div className="mb-8">
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className={`w-full h-[54px] px-5 rounded-[18px] font-bold text-[15px] flex items-center justify-between transition-all shadow-sm hover:shadow-md border ${filterMode !== 'all'
                                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                    : 'bg-white text-[var(--text-main)] border-[var(--border-light)] hover:border-[#d1d1d1]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                    <span>
                                        {filterMode === 'all'
                                            ? 'Filter: All Time'
                                            : `Filter: ${getMonthName(selectedMonth)} ${selectedYear}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold opacity-80 px-2 py-1 rounded-md bg-black/10">
                                        {filteredVocabs.length} words
                                    </span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={startGame}
                            disabled={filteredVocabs.length < 1}
                            className="btn-modern btn-pink w-full h-[54px] text-[17px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Spelling
                        </button>
                    </div>
                ) : (
                    <div className="reveal">
                        {/* Stats bar */}
                        <div className="premium-card p-4 flex items-center justify-between mb-8 shadow-sm bg-[var(--bg-main)]/50 backdrop-blur-md sticky top-[70px] z-30">
                            <div className="flex items-center gap-6 px-2">
                                <div>
                                    <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Score</p>
                                    <p className="text-xl font-bold text-[var(--text-main)]">{score} / {gameVocabs.length}</p>
                                </div>
                                <div className="w-px h-8 bg-[var(--border-light)]"></div>
                                <div>
                                    <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Accuracy</p>
                                    <p className="text-xl font-bold text-[var(--primary)]">
                                        {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setGameState('idle')}
                                className="px-4 py-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] bg-[var(--bg-sub)] hover:bg-[#ebebeb] rounded-lg transition-all"
                            >
                                STOP
                            </button>
                        </div>

                        {/* Question Card */}
                        <div className="premium-card py-20 px-8 mb-8 text-center shadow-md relative overflow-hidden">
                            <p className="text-[11px] font-bold text-[var(--text-tertiary)] mb-4 uppercase tracking-[0.2em]">Translate this</p>
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-[var(--primary)] drop-shadow-sm">
                                {currentVocab?.meaning}
                            </h2>
                            <p className="text-[15px] text-[var(--text-secondary)] mt-4">
                                Type the matching English word
                            </p>
                        </div>

                        <div className="max-w-md mx-auto mb-10">
                            <form onSubmit={(e) => { e.preventDefault(); handleAnswer(selectedAnswer); }}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={selectedAnswer}
                                        onChange={(e) => isCorrect === null && setSelectedAnswer(e.target.value)}
                                        disabled={isCorrect !== null}
                                        autoFocus
                                        placeholder="Type the word here..."
                                        className={`modern-input w-full h-[60px] text-center text-xl font-bold rounded-[16px] shadow-sm transition-all duration-300 ${isCorrect === true ? 'bg-green-50 border-green-500 text-green-700' :
                                            isCorrect === false ? 'bg-red-50 border-red-500 text-red-700 shake' :
                                                'focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10'
                                            }`}
                                    />
                                    {isCorrect !== null && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {isCorrect ? (
                                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isCorrect === false && (
                                    <div className="mt-4 text-center animate-in fade-in slide-in-from-top-2">
                                        <p className="text-[var(--text-secondary)] text-sm mb-1">Correct spelling:</p>
                                        <p className="text-xl font-bold text-green-600 tracking-wide">{currentVocab?.word}</p>
                                    </div>
                                )}

                                {!isCorrect && isCorrect !== false && (
                                    <button
                                        type="submit"
                                        disabled={!selectedAnswer.trim()}
                                        className="btn-modern btn-pink w-full mt-6 h-[54px] text-[17px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Check Answer
                                    </button>
                                )}

                                {/* Next Button for Spelling Mode */}
                                {isCorrect !== null && (
                                    <button
                                        type="button"
                                        onClick={() => generateQuestion()}
                                        autoFocus
                                        className="btn-modern btn-pink w-full mt-6 h-[54px] text-[17px] shadow-lg hover:shadow-xl hover:scale-105 animate-in fade-in slide-in-from-bottom-2"
                                    >
                                        Next Question
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Modal */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between bg-white/80 backdrop-blur-xl">
                            <h2 className="text-[19px] font-bold text-[var(--text-main)]">Filter Words</h2>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#86868b] hover:bg-[#ebebeb] hover:text-[#1d1d1f] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-8">
                            <div>
                                <label className="block text-[13px] font-bold text-[#86868b] uppercase tracking-wider mb-3 pl-1">
                                    Time Period
                                </label>
                                <div className="space-y-3">
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
                        <div className="p-6 border-t border-[#f0f0f0] bg-[#fafafa]">
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-full h-[54px] bg-[var(--text-main)] text-white rounded-[18px] font-bold text-[17px] shadow-lg shadow-black/5 active:scale-[0.98] transition-all"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
