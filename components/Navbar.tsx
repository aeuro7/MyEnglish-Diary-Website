'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="glass-nav sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity duration-200">
                    <div className="w-8 h-8 bg-[var(--primary)] rounded-[8px] flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-bold">V</span>
                    </div>
                    <span className="text-[17px] font-semibold text-[var(--text-main)] tracking-tight">
                        Vocabulary
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    <NavLink href="/" active={isActive('/')} label="Today" />
                    <NavLink href="/list" active={isActive('/list')} label="Library" />
                    <NavLink href="/quiz" active={isActive('/quiz')} label="Practice" />
                </div>

                {/* Mobile Nav */}
                <div className="flex md:hidden items-center gap-3">
                    <Link href="/" className={`p-2 rounded-full transition-colors ${isActive('/') ? 'text-[var(--primary)] bg-[rgba(250,45,72,0.1)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </Link>
                    <Link href="/list" className={`p-2 rounded-full transition-colors ${isActive('/list') ? 'text-[var(--primary)] bg-[rgba(250,45,72,0.1)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </Link>
                    <Link href="/quiz" className={`p-2 rounded-full transition-colors ${isActive('/quiz') ? 'text-[var(--primary)] bg-[rgba(250,45,72,0.1)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
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
            className={`px-4 py-1.5 rounded-lg text-[15px] font-medium transition-all duration-200 ${active
                ? 'text-[var(--primary)] bg-[rgba(250,45,72,0.1)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sub)]'
                }`}
        >
            {label}
        </Link>
    );
}
