'use client';

import React, { useState } from 'react';

// Mock Data สำหรับการแสดงผลดีไซน์
const MOCK_VOCABS = [
  { id: '1', word: 'Serendipity', meaning: 'การพบสิ่งดีๆ โดยบังเอิญ', date: '2023-10-27' },
  { id: '2', word: 'Luminous', meaning: 'เปล่งแสงสว่าง, โชติช่วง', date: '2023-10-27' },
  { id: '3', word: 'Resilience', meaning: 'ความยืดหยุ่น, การฟื้นตัวจากความยากลำบาก', date: '2023-10-27' },
];

export default function MockupHome() {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#1d1d1f] font-sans pb-20">
      {/* Top Navigation / Status Bar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-black/[0.03] px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V.</span>
            </div>
            <span className="font-bold tracking-tight text-xl">LexiFlow</span>
          </div>
          <div className="text-xs font-medium bg-black/5 px-3 py-1.5 rounded-full text-[#6e6e73]">
            {today}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-gray-900 to-gray-500 bg-clip-text text-transparent">
            Build your lexicon.
          </h1>
          <p className="text-[#86868b] text-lg font-medium">เก็บสะสมคำศัพท์วันละนิด เพื่อคลังสมองที่ยิ่งใหญ่</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white p-6 rounded-[24px] border border-black/[0.04] shadow-sm flex flex-col justify-between">
            <span className="text-sm font-semibold text-[#86868b]">Today's Goal</span>
            <div className="mt-4">
              <span className="text-3xl font-bold">3 / 5</span>
              <div className="w-full bg-black/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-black h-full w-[60%] rounded-full" />
              </div>
            </div>
          </div>
          <div className="bg-black text-white p-6 rounded-[24px] shadow-xl flex flex-col justify-between">
            <span className="text-sm font-medium opacity-70">Total Mastered</span>
            <span className="text-4xl font-bold mt-4">1,284</span>
          </div>
          <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-100 flex flex-col justify-between">
            <span className="text-sm font-semibold text-blue-600">Current Streak</span>
            <span className="text-3xl font-bold text-blue-900 mt-4">12 Days 🔥</span>
          </div>
        </div>

        {/* Form Section - Clean & Floating */}
        <section className="bg-white p-4 rounded-[32px] border border-black/[0.05] shadow-sm mb-16">
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              placeholder="New word..." 
              className="flex-1 bg-gray-50 border-none rounded-[20px] px-6 py-4 focus:ring-2 focus:ring-black/5 transition-all outline-none text-lg"
            />
            <input 
              type="text" 
              placeholder="Meaning or context" 
              className="flex-[1.5] bg-gray-50 border-none rounded-[20px] px-6 py-4 focus:ring-2 focus:ring-black/5 transition-all outline-none text-lg"
            />
            <button className="bg-black text-white px-8 py-4 rounded-[20px] font-bold hover:bg-gray-800 transition-all active:scale-95">
              Add
            </button>
          </div>
        </section>

        {/* List Section */}
        <section>
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-xl font-bold">Recent Discoveries</h2>
            <button className="text-sm font-semibold text-blue-600 hover:underline">View All</button>
          </div>

          <div className="space-y-3">
            {MOCK_VOCABS.map((v) => (
              <div 
                key={v.id} 
                className="group bg-white p-5 rounded-[24px] border border-black/[0.04] hover:border-black/10 hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <span className="text-lg font-bold">{v.word.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">{v.word}</h3>
                    <p className="text-[#86868b] font-medium">{v.meaning}</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}