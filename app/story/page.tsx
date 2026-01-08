import Link from 'next/link';
import { supabase, DEMO_MODE } from '@/lib/supabase';
import { mockData } from '@/lib/mockData';

async function getTodayStory() {
    const today = new Date().toISOString().split('T')[0];

    // Demo mode: use mock data
    if (DEMO_MODE) {
        return await mockData.findStory({
            date: today,
            status: { $in: ['APPROVED', 'SENT'] }
        });
    }

    // Production mode: use Supabase
    const { data: story } = await supabase
        .from('stories')
        .select('*')
        .eq('date', today)
        .in('status', ['APPROVED', 'SENT'])
        .maybeSingle();

    return story;
}

export default async function StoryPage() {
    const story = await getTodayStory();

    if (!story) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
                <div className="max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/20">
                    <div className="text-8xl mb-6">🌙</div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        No Story Yet Today
                    </h1>
                    <p className="text-xl text-purple-200 mb-8">
                        Come back later or subscribe to get stories delivered to your inbox at 6:00 AM!
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Demo Mode Badge */}
                {DEMO_MODE && (
                    <div className="text-center mb-4">
                        <span className="inline-block px-4 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded-full text-sm">
                            🎭 Demo Mode - Using Sample Story
                        </span>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <Link
                        href="/"
                        className="inline-block text-purple-200 hover:text-white mb-6 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                    <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
                        {story.title}
                    </h1>
                    <p className="text-purple-200">Today&apos;s Bedtime Story</p>
                </div>

                {/* Story Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                    {/* Summary Bullets */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
                        <h2 className="text-2xl font-bold text-purple-900 mb-4">📚 Story Summary</h2>
                        <ul className="space-y-2">
                            {story.summary_bullets.map((bullet: string, index: number) => (
                                <li key={index} className="text-lg text-gray-700 flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Story Content */}
                    <div
                        className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: story.content }}
                    />

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                        <p className="text-gray-600 mb-4">Sweet dreams! 🌙</p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                        >
                            Subscribe for Daily Stories
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
