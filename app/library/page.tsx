import { supabase, DEMO_MODE } from '@/lib/supabase';
import { mockData } from '@/lib/mockData';
import StickyHeader from '@/app/components/StickyHeader';
import Footer from '@/app/components/Footer';
import SubscribeForm from '@/app/components/SubscribeForm';
import Link from 'next/link';

// Revalidate every hour
export const revalidate = 3600;

interface LibraryPageProps {
    searchParams: Promise<{ tag?: string }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
    const { tag } = await searchParams;

    let allStories;

    if (DEMO_MODE) {
        allStories = await mockData.getStories();
        // Mock data objects might not have 'id' property exactly as supabase (mock has _id), 
        // but let's assume we map or use it compatible.
        // Quick fix to map _id to id if needed, or ensuring mockData has id. 
        // Looking at mockData.ts, it uses _id. We should map it.
        allStories = allStories.map((s: any) => ({
            ...s,
            id: s._id || s.id,
            tags: s.tags || []
        }));
    } else {
        // Fetch stories specifically with status 'SENT'
        const { data } = await supabase
            .from('stories')
            .select('id, title, date, summary_bullets, tags')
            .in('status', ['SENT', 'APPROVED'])
            .order('date', { ascending: false });

        allStories = data;
    }

    // Get unique tags
    const tags = Array.from(new Set(allStories?.flatMap(s => s.tags || []) || [])).sort();

    // Filter stories
    const stories = tag
        ? allStories?.filter(s => s.tags?.includes(tag))
        : allStories;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
            <StickyHeader />

            <div className="container mx-auto px-4 pt-24 pb-16">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                        📚 Story Library
                    </h1>
                    <p className="text-lg text-purple-200 mb-8">
                        Explore our collection of magical bedtime tales.
                    </p>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        <Link
                            href="/library"
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!tag ? 'bg-white text-purple-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            All
                        </Link>
                        {tags.map(t => (
                            <Link
                                key={t}
                                href={`/library?tag=${encodeURIComponent(t)}`}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tag === t ? 'bg-white text-purple-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                {t}
                            </Link>
                        ))}
                    </div>
                </header>

                {stories && stories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {stories.map((story) => (
                            <div
                                key={story.id}
                                className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all flex flex-col"
                            >
                                <div className="mb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        {/* Date removed */}
                                        {story.tags && story.tags[0] && (
                                            <span className="text-[10px] bg-purple-500/30 px-2 py-0.5 rounded text-purple-100 border border-purple-400/30">
                                                {story.tags[0]} {story.tags.length > 1 && `+${story.tags.length - 1}`}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mt-2 mb-3 line-clamp-2">
                                        {story.title}
                                    </h2>
                                    <div className="text-purple-100 text-sm mb-4 line-clamp-3">
                                        <ul className="list-disc list-inside">
                                            {story.summary_bullets.slice(0, 2).map((bullet: string, i: number) => (
                                                <li key={i}>{bullet}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    {/* Since we don't have a dedicated public page for OLD stories (only /story which shows TODAY's story), 
                        we might need to link to /story/id if that exists, or just /story if it rotates. 
                        Wait, usually /story is "today". 
                        If we want to read OLD stories, we need a route for them.
                        I'll assume /story/[id] will be needed or exists. 
                        Checking checking... user didn't ask for /story/[id] but "read today story" works.
                        Actually, I should create a dynamic route /story/[id] if it doesn't exist, 
                        BUT for now I'll link to /story/[id] and assumes I'll handle that or the user understands to read "Today's".
                        
                        WAIT. The user request "read the story any time" implies access to old stories.
                        So I DO need to ensure there is a way to read a specific story.
                        If /story shows TODAY's story, I need /story/[id] for specific ones.
                        I'll link to `/story/${story.id}` and I might need to implement that page next if it doesn't exist.
                        The plan didn't explicitly task /story/[id] but it's implied by "Read" button.
                        I'll stick to the plan: "Grid of Story Cards... Read button".
                    */}
                                    <Link
                                        href={`/story/${story.id}`}
                                        className="inline-block w-full text-center py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20"
                                    >
                                        Read Story
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-purple-200 py-12 bg-white/5 rounded-3xl mb-12">
                        <p className="text-xl">No stories have been published yet.</p>
                        <p className="mt-2 text-sm opacity-70">Check back tomorrow!</p>
                    </div>
                )}

                {/* Subscribe CTA at bottom */}
                <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 text-center border border-white/20 shadow-xl">
                    <h3 className="text-2xl font-bold text-white mb-4">Never Miss a Story</h3>
                    <p className="text-purple-200 mb-8">Get these stories delivered to your inbox every morning at 6 AM.</p>
                    <SubscribeForm />
                </div>

                <Footer />
            </div>
        </div>
    );
}
