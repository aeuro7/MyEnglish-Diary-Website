'use client';

import { useState, useEffect } from 'react';
import { subscribeAllVocabularies } from '@/lib/vocabService';
import type { Vocabulary } from '@/lib/vocabService';

type QuizMode = 'word-to-meaning' | 'meaning-to-word';

export default function QuizPage() {
    const [allVocabs, setAllVocabs] = useState<Vocabulary[]>([]);
    const [currentVocab, setCurrentVocab] = useState<Vocabulary | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [quizMode, setQuizMode] = useState<QuizMode>('word-to-meaning');
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeAllVocabularies((vocabs) => {
            setAllVocabs(vocabs);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const startQuiz = () => {
        if (allVocabs.length < 4) {
            alert('You need at least 4 words to start the quiz!');
            return;
        }
        setScore(0);
        setTotalQuestions(0);
        setGameState('playing');
        generateQuestion();
    };

    const generateQuestion = () => {
        setSelectedAnswer('');
        setIsCorrect(null);

        const randomIndex = Math.floor(Math.random() * allVocabs.length);
        const vocab = allVocabs[randomIndex];
        setCurrentVocab(vocab);

        const correctAnswer = quizMode === 'word-to-meaning' ? vocab.meaning : vocab.word;
        const wrongOptions: string[] = [];

        while (wrongOptions.length < 3) {
            const randomVocab = allVocabs[Math.floor(Math.random() * allVocabs.length)];
            const option = quizMode === 'word-to-meaning' ? randomVocab.meaning : randomVocab.word;
            if (option !== correctAnswer && !wrongOptions.includes(option)) {
                wrongOptions.push(option);
            }
        }

        setOptions([...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5));
    };

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);
        const correctAnswer = quizMode === 'word-to-meaning' ? currentVocab?.meaning : currentVocab?.word;
        const correct = answer === correctAnswer;
        setIsCorrect(correct);
        setTotalQuestions(prev => prev + 1);
        if (correct) setScore(prev => prev + 1);
    };

    return (
        <div className="min-h-screen pb-20 pt-12">
            <div className="max-w-3xl mx-auto px-6">

                <header className="mb-10 text-center reveal">
                    <h1 className="text-[34px] font-bold text-[var(--text-main)] mb-2 tracking-tight">
                        Practice
                    </h1>
                    <p className="text-[var(--text-secondary)] text-[17px]">
                        Test your memory.
                    </p>
                </header>

                {gameState === 'idle' ? (
                    <div className="premium-card p-10 text-center reveal delay-100 max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-[var(--bg-sub)] rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-sm">
                            <svg className="w-10 h-10 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-[22px] font-bold text-[var(--text-main)] mb-3">Choose Mode</h2>
                        <p className="text-[var(--text-secondary)] mb-8">
                            How do you want to quiz yourself?
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => { setQuizMode('word-to-meaning'); startQuiz(); }}
                                disabled={allVocabs.length < 4}
                                className="btn-modern btn-pink w-full h-[50px] text-[17px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Word → Meaning
                            </button>
                            <button
                                onClick={() => { setQuizMode('meaning-to-word'); startQuiz(); }}
                                disabled={allVocabs.length < 4}
                                className="btn-modern btn-outline w-full h-[50px] text-[17px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-sub)]"
                            >
                                Meaning → Word
                            </button>
                        </div>

                        {allVocabs.length < 4 && !isLoading && (
                            <p className="mt-6 text-sm text-[var(--primary)] font-medium">
                                * Need {4 - allVocabs.length} more words to start
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="reveal">
                        {/* Stats bar */}
                        <div className="premium-card p-4 flex items-center justify-between mb-8 shadow-sm bg-[var(--bg-main)]/50 backdrop-blur-md sticky top-[70px] z-30">
                            <div className="flex items-center gap-6 px-2">
                                <div>
                                    <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Score</p>
                                    <p className="text-xl font-bold text-[var(--text-main)]">{score}/{totalQuestions}</p>
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
                        <div className="premium-card py-20 px-8 mb-8 text-center bg-[#1d1d1f] text-white shadow-xl relative overflow-hidden ring-4 ring-black/5">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-orange-500"></div>
                            <p className="text-[11px] font-bold text-[rgba(255,255,255,0.4)] mb-3 uppercase tracking-[0.2em]">Question</p>
                            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                                {quizMode === 'word-to-meaning' ? currentVocab?.word : currentVocab?.meaning}
                            </h2>
                        </div>

                        {/* Options */}
                        <div className="grid gap-3 mb-10">
                            {options.map((option, i) => {
                                const isSelected = selectedAnswer === option;
                                const isAnswerCorrect = (quizMode === 'word-to-meaning' ? currentVocab?.meaning : currentVocab?.word) === option;

                                let cardStyle = "premium-card p-5 text-left transition-all duration-200 cursor-pointer border-2 ";
                                if (!selectedAnswer) {
                                    cardStyle += "border-transparent hover:border-[var(--primary)] hover:shadow-md active:scale-[0.98]";
                                } else if (isAnswerCorrect) {
                                    cardStyle += "bg-green-50/50 border-green-500 shadow-sm";
                                } else if (isSelected && !isAnswerCorrect) {
                                    cardStyle += "bg-red-50/50 border-red-500 opacity-60";
                                } else {
                                    cardStyle += "border-transparent opacity-40 cursor-not-allowed bg-[var(--bg-sub)]";
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(option)}
                                        disabled={!!selectedAnswer}
                                        className={cardStyle}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-[13px] font-bold shrink-0 transition-colors ${isSelected
                                                ? isAnswerCorrect
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'
                                                : 'bg-[var(--bg-sub)] text-[var(--text-secondary)]'
                                                }`}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className="text-[17px] font-medium text-[var(--text-main)] w-full">{option}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next Button */}
                        <div className={`flex justify-center transition-all duration-300 ${selectedAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                            <button
                                onClick={generateQuestion}
                                className="btn-modern btn-pink px-10 py-3.5 text-[17px] shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Next Question
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
