import Link from 'next/link';
import StickyHeader from '@/app/components/StickyHeader';
import Footer from '@/app/components/Footer';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

export const revalidate = 3600; // Update every hour

export const metadata: Metadata = {
    title: "Bedtime Story Categories",
    description: "Browse our magical collection of sleep stories by topic. From Animals to Space, find the perfect tale.",
};

export default async function CategoriesPage() {
    // Determine categories by fetching all tags. 
    // In a larger app, we might have a distinct 'categories' table.
    // Here we derive from stories.

    const { data: stories } = await supabase
        .from('stories')
        .select('tags')
        .in('status', ['SENT', 'APPROVED']);

    // Extract unique tags
    const allTags = stories?.flatMap(s => s.tags || []) || [];
    const uniqueTags = Array.from(new Set(allTags)).sort();

    // Map tags to emojis (simple manual mapping or generic)
    const getEmojiForTag = (tag: string) => {
        const lower = tag.toLowerCase();
        if (lower.includes('animal')) return '🦁';
        if (lower.includes('space') || lower.includes('star')) return '🚀';
        if (lower.includes('magic') || lower.includes('wizar')) return '✨';
        if (lower.includes('dinosaur')) return '🦕';
        if (lower.includes('ocean') || lower.includes('sea')) return '🌊';
        if (lower.includes('forest') || lower.includes('tree')) return '🌲';
        if (lower.includes('dragon')) return '🐉';
        return '📚';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
            <StickyHeader />

            <div className="container mx-auto px-4 pt-24 pb-16">
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                        Explore Categories
                    </h1>
                    <p className="text-xl text-purple-200">
                        Find the perfect story for tonight's dream.
                    </p>
                </header>

                {uniqueTags.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
                        {uniqueTags.map(tag => (
                            <Link
                                key={tag}
                                href={`/library/${encodeURIComponent(tag)}`}
                                className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/10 hover:bg-white/20 transition-all hover:scale-105"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {getEmojiForTag(tag)}
                                </div>
                                <h2 className="text-xl font-bold text-white group-hover:text-pink-200 transition-colors">
                                    {tag}
                                </h2>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-white/60 py-12">
                        <p>No categories found yet. Check back soon!</p>
                    </div>
                )}

                <div className="text-center">
                    <Link
                        href="/library"
                        className="inline-block px-8 py-3 bg-white/5 hover:bg-white/10 text-purple-200 rounded-full transition-all border border-white/10"
                    >
                        View All Stories
                    </Link>
                </div>

                <Footer />
            </div>
        </div>
    );
}
