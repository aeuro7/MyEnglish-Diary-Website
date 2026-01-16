'use client';

import { useState, useEffect, useCallback } from 'react';
import { addVocabulary } from '@/lib/vocabService';

export default function TranslatePage() {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Debounce logic for translation
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (inputText.trim()) {
                await Promise.all([
                    handleTranslate(inputText),
                    checkSpelling(inputText)
                ]);
            } else {
                setTranslatedText('');
                setSuggestions([]);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [inputText]);

    const checkSpelling = async (text: string) => {
        try {
            // Don't check sentences, basically just simple vocab
            if (text.includes(' ') && text.trim().split(/\s+/).length > 2) {
                setSuggestions([]);
                return;
            }

            const res = await fetch(`https://api.datamuse.com/words?sp=${text}&max=5`);
            const data = await res.json();

            // Filter out the exact word itself (case-insensitive)
            const currentLower = text.trim().toLowerCase();
            const validSuggestions = data
                .map((item: any) => item.word)
                .filter((w: string) => w.toLowerCase() !== currentLower)
                .slice(0, 3); // Take top 3

            setSuggestions(validSuggestions);
        } catch (error) {
            console.error("Spelling check error:", error);
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (word: string) => {
        setInputText(word);
        setSuggestions([]);
        // Trigger immediate translation for the new word
        handleTranslate(word);
    };

    const handleTranslate = async (text: string) => {
        setIsTranslating(true);
        try {
            // Switch to MyMemory API which is often more reliable for free usage without keys
            const encodedText = encodeURIComponent(text);
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|th`);

            if (!res.ok) throw new Error('Translation failed');

            const data = await res.json();
            if (data.responseData && data.responseData.translatedText) {
                setTranslatedText(data.responseData.translatedText);
            }
        } catch (error) {
            console.error("Translation error:", error);
            // Fallback or user feedback could go here
        } finally {
            setIsTranslating(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !translatedText.trim() || isAdding) return;

        setIsAdding(true);
        try {
            const todayIso = new Date().toISOString().split('T')[0];
            // Auto-capitalize first letter
            const formattedWord = inputText.trim().charAt(0).toUpperCase() + inputText.trim().slice(1);

            await addVocabulary(formattedWord, translatedText.trim(), todayIso);

            // Clear inputs
            setInputText('');
            setTranslatedText('');
            // Optional: Show success feedback?
        } catch (error) {
            console.error('Error adding vocabulary:', error);
            alert('Error adding vocabulary');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="min-h-screen pb-24 md:pb-32">
            <div className="max-w-3xl mx-auto px-6 pt-4 md:pt-4">

                {/* Header - Matching Home Style */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 reveal">
                    <div>
                        <p className="text-[13px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                            New
                        </p>
                        <h1 className="text-[34px] md:text-[40px] font-bold text-[var(--text-main)] tracking-tight leading-none">
                            Quick Translate
                        </h1>
                    </div>
                </div>

                {/* Input Card */}
                <div className="reveal delay-100 mb-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white/60">
                        <form onSubmit={handleAdd} className="flex flex-col gap-6">

                            {/* English Input */}
                            <div className="relative group">
                                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                                    English Word
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        className="w-full h-[120px] p-5 bg-white border-2 border-[var(--border-light)] focus:border-[var(--primary)]/10 rounded-[20px] text-[20px] font-medium text-[var(--text-main)] placeholder:text-gray-300 focus:ring-0 transition-all outline-none resize-none shadow-sm"
                                        placeholder="Type to translate..."
                                    />
                                    {inputText && (
                                        <button
                                            type="button"
                                            onClick={() => { setInputText(''); setTranslatedText(''); setSuggestions([]); }}
                                            className="absolute right-4 top-4 text-gray-400 hover:text-[var(--text-main)]"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Suggestions / Did you mean */}
                                <div
                                    className={`
                                        w-full overflow-hidden transition-all duration-300 ease-out 
                                        ${suggestions.length > 0 ? 'max-h-[60px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}
                                    `}
                                >
                                    <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar">
                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest shrink-0 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            Did you mean?
                                        </span>
                                        <div className="flex gap-2">
                                            {suggestions.map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(s)}
                                                    className="px-3 py-1 bg-white border border-[var(--border-light)] text-[var(--text-main)] text-[13px] font-semibold rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all hover:-translate-y-0.5 whitespace-nowrap"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Translation Output */}
                            <div className="relative group">
                                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide flex justify-between items-center">
                                    <span>Thai Meaning {isTranslating && <span className="ml-2 inline-block animate-pulse text-[var(--primary)] text-xs not-italic lowercase">translating...</span>}</span>
                                    <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md">AUTO</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={translatedText}
                                        onChange={(e) => setTranslatedText(e.target.value)}
                                        className="w-full h-[120px] p-5 bg-white border-2 border-[var(--border-light)] focus:border-[var(--primary)]/10 rounded-[20px] text-[20px] font-medium text-[var(--text-main)] placeholder:text-gray-300 focus:ring-0 transition-all outline-none resize-none shadow-sm"
                                        placeholder="Translation will appear here..."
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || !translatedText.trim() || isAdding}
                                    className="w-full h-[60px] rounded-[18px] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-[17px] flex items-center justify-center gap-3 shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:transform-none transition-all duration-300"
                                >
                                    {isAdding ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Saving to Library...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span>Add to Library</span>
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

                {/* Info / Decoration */}
                <div className="reveal delay-200 text-center opacity-60 mt-12">
                    <p className="text-sm text-[var(--text-secondary)]">
                        Powered by MyMemory Translated
                    </p>
                </div>

            </div>
        </div>
    );
}
