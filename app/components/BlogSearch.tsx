'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function BlogSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Sync local state with URL param on load
        const currentSearch = searchParams.get('search');
        if (currentSearch) {
            setSearchTerm(currentSearch);
        }
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());

        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
        } else {
            params.delete('search');
        }

        // Reset page to 1 when searching
        params.delete('page');

        router.push(`/blog?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 pl-12 bg-white/5 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-purple-200/50 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all font-medium"
            />
            <button
                type="submit"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200/50 hover:text-white transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </button>
        </form>
    );
}
