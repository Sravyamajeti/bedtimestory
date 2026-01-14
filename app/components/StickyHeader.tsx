'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function StickyHeader() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-300 ${isScrolled ? 'bg-indigo-900/90 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="text-white font-bold text-lg md:text-xl hover:text-purple-200 transition-colors">
                    🌙 Bedtime Stories
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        href="/library"
                        className="text-white/80 hover:text-white font-medium text-sm md:text-base transition-colors"
                    >
                        Library
                    </Link>
                    <Link
                        href="/blog"
                        className="text-white/80 hover:text-white font-medium text-sm md:text-base transition-colors"
                    >
                        Blog
                    </Link>
                    <Link
                        href="/story"
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm md:text-base font-bold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
                    >
                        Read Story
                    </Link>
                </div>
            </div>
        </div>
    );
}
