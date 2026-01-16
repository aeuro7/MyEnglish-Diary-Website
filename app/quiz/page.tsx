'use client';

import Link from 'next/link';

export default function QuizMenuPage() {
    return (
        <div className="min-h-screen pb-20 pt-12">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-12 reveal">
                    <h1 className="text-[40px] font-bold text-[var(--text-main)] mb-4 leading-tight">
                        Practice Mode
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg">
                        Select a game type to start reviewing
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 reveal delay-100">

                    {/* Flashcards */}
                    <Link href="/quiz/flashcard" className="group premium-card p-6 flex flex-col items-center text-center hover:border-[var(--primary)] transition-all">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Flashcards</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Review words and meanings with flip cards.</p>
                    </Link>

                    {/* Spelling */}
                    <Link href="/quiz/spelling" className="group premium-card p-6 flex flex-col items-center text-center hover:border-[var(--primary)] transition-all">
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Spelling</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Type the word correctly from its meaning.</p>
                    </Link>

                    {/* Word to Meaning */}
                    <Link href="/quiz/word-meaning" className="group premium-card p-6 flex flex-col items-center text-center hover:border-[var(--primary)] transition-all">
                        <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Word → Meaning</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Choose the correct meaning for the given word.</p>
                    </Link>

                    {/* Meaning to Word */}
                    <Link href="/quiz/meaning-word" className="group premium-card p-6 flex flex-col items-center text-center hover:border-[var(--primary)] transition-all">
                        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Meaning → Word</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Choose the correct word for the given meaning.</p>
                    </Link>

                </div>
            </div>
        </div>
    );
}
