'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path: string) => pathname === path;

    return (
        <nav
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-[rgba(255,255,255,0.85)] backdrop-blur-xl border-b border-black/5 shadow-sm'
                : 'bg-[rgba(255,255,255,0.5)] backdrop-blur-sm border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="group flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#fa2d48] to-[#ff5d73] rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white text-lg font-bold">V</span>
                    </div>
                    {/* <span className="text-[19px] font-bold text-[var(--text-main)] tracking-tight">
                        
                    </span> */}
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-2">
                    <NavLink href="/" active={isActive('/')} label="Today" />
                    <NavLink href="/list" active={isActive('/list')} label="Library" />
                    <NavLink href="/quiz" active={isActive('/quiz')} label="Practice" />
                    <NavLink href="/more" active={isActive('/more')} label="Translate" />
                </div>

                {/* Mobile Nav */}
                <div className="flex md:hidden items-center gap-4">
                    <Link href="/" className={`p-2.5 rounded-full transition-all duration-200 ${isActive('/') ? 'text-[var(--primary)] bg-red-50' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-black/5'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </Link>
                    <Link href="/list" className={`p-2.5 rounded-full transition-all duration-200 ${isActive('/list') ? 'text-[var(--primary)] bg-red-50' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-black/5'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </Link>
                    <Link href="/quiz" className={`p-2.5 rounded-full transition-all duration-200 ${isActive('/quiz') ? 'text-[var(--primary)] bg-red-50' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-black/5'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </Link>
                    <Link href="/more" className={`p-2.5 rounded-full transition-all duration-200 ${isActive('/more') ? 'text-[var(--primary)] bg-red-50' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-black/5'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, active, label }: { href: string; active: boolean; label: string }) {
    return (
        <Link
            href={href}
            className={`relative px-5 py-2.5 text-[15px] font-semibold transition-all duration-300 rounded-full
                ${active
                    ? 'text-[var(--primary)] bg-red-50/80 shadow-sm shadow-red-100'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-black/5'
                }`}
        >
            {label}
        </Link>
    );
}
