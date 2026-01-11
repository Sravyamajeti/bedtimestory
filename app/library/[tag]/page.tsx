import { supabase, DEMO_MODE } from '@/lib/supabase';
import { mockData } from '@/lib/mockData';
import StickyHeader from '@/app/components/StickyHeader';
import Footer from '@/app/components/Footer';
import SubscribeForm from '@/app/components/SubscribeForm';
import Link from 'next/link';

// Revalidate frequently to show new stories immediately
export const revalidate = 0;



interface LibraryPageProps {
    params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: LibraryPageProps) {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);
    return {
        title: `Bedtime Stories about ${decodedTag} | Free Kids Stories`,
        description: `Read free, AI-generated bedtime stories about ${decodedTag}. Short, calming tales for children aged 3-10.`,
        alternates: {
            canonical: `/library/${tag}`,
        },
    };
}

export default async function LibraryPage({ params }: LibraryPageProps) {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);

    let allStories;

    if (DEMO_MODE) {
        // Mock Data Support
        allStories = await mockData.getStories();
        // ... (mock data mapping logic remains if needed, but simplified for clarity)
        allStories = allStories.map((s: any) => ({
            ...s,
            id: s._id || s.id,
            tags: s.tags || [],
            slug: s.slug || s.id // Fallback
        }));
    } else {
        // Fetch stories with slugs
        const { data } = await supabase
            .from('stories')
            .select('id, title, date, summary_bullets, tags, slug')
            .in('status', ['SENT', 'APPROVED'])
            .order('date', { ascending: false });

        allStories = data;
    }

    // Filter stories by tag
    // Supabase query could be filtered server-side, but client-side filtering (in-memory) is fine for small scale
    const stories = allStories?.filter(s => s.tags?.includes(decodedTag)) || [];

    // Get unique tags for the filter bar (from ALL stories, or just display "All" + current?)
    // Ideally we show related tags or all tags. Let's show all tags for navigation.
    const tags = Array.from(new Set(allStories?.flatMap(s => s.tags || []) || [])).sort();

    // Conditional Intro Text
    const getIntroText = (t: string) => {
        const lower = t.toLowerCase();

        if (lower.includes('nature') || lower.includes('forest')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Immerse your child in the soothing sounds of the natural world with our <strong className="text-pink-200">nature bedtime stories</strong>. These tales take young readers on gentle journeys through whispering forests, sun-dappled meadows, and bubbling brooks, helping them connect with the beauty of the outdoors from the comfort of their bed.</span>
                    <span className="block">Perfect for calming active minds, our nature stories often feature friendly woodland creatures and the changing seasons. The slow, rhythmic descriptions of rustling leaves and swaying trees act as a natural lullaby, making these <strong className="text-pink-200">calming stories for sleep</strong> an excellent choice for a peaceful night's rest.</span>
                </span>
            );
        }

        if (lower.includes('space') || lower.includes('star') || lower.includes('moon')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Blast off into a universe of dreams with our collection of <strong className="text-pink-200">space bedtime stories for kids</strong>. Your little astronaut will drift among twinkling stars, friendly planets, and glowing comets, exploring the wonders of the cosmos in a way that sparks imagination without being too exciting for bedtime.</span>
                    <span className="block">These cosmic tales often focus on the quiet beauty of the night sky, helping children feel safe and comfortable in the dark. Whether it's a story about a sleepy moon or a star looking for a friend, our <strong className="text-pink-200">astronomy stories for children</strong> are designed to turn the vastness of space into a cozy blanket for sleep.</span>
                </span>
            );
        }

        if (lower.includes('animal') || lower.includes('pet') || lower.includes('cat') || lower.includes('dog')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Who doesn't love a furry friend? Our <strong className="text-pink-200">short animal stories for kids</strong> feature lovable characters that children can easily relate to. From brave puppies to wise old owls, these animal adventures teach important life lessons about kindness, empathy, and understanding others.</span>
                    <span className="block">Animals are a timeless favorite for bedtime because they offer comfort and companionship. Our collection includes both domestic pets and wild creatures, all behaving in gentle, friendly ways. Reading these <strong className="text-pink-200">animal tales for toddlers</strong> is a sure way to end the day with a smile and a warm feeling in your heart.</span>
                </span>
            );
        }

        if (lower.includes('magic') || lower.includes('fairy') || lower.includes('wizard') || lower.includes('dragon')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Step into a world where anything is possible with our <strong className="text-pink-200">magical bedtime stories</strong>. In these enchanted realms, fairies flutter, friendly dragons soar, and wizards cast spells of sleep and sweet dreams. Magic sparks a child's creativity and helps them visualize wonderful places as they close their eyes.</span>
                    <span className="block">Our fantasy stories strike a careful balance—they are full of wonder but free from scary monsters or intense conflict. Instead, they focus on the magic of kindness and discovery. Let your child's imagination take flight with these <strong className="text-pink-200">fantasy stories for kids</strong>, creating a bridge between their day and the dream world.</span>
                </span>
            );
        }

        if (lower.includes('friendship') || lower.includes('kindness')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Friendship is one of the first and most important lessons a child learns. Our <strong className="text-pink-200">stories about friendship</strong> celebrate the bonds between best friends, whether they are children, animals, or magical beings. These tales model sharing, caring, and working together to solve simple problems.</span>
                    <span className="block">Ending the day with a story about connection and love helps children feel secure and valued. These <strong className="text-pink-200">social-emotional stories</strong> reassure little ones that they are not alone and that kindness is a superpower. It's the perfect positive note to end the day on before drifting off to sleep.</span>
                </span>
            );
        }

        // Fallback for other tags
        return (
            <span className="block space-y-4">
                <span className="block">Explore our unique collection of <strong className="text-pink-200">{t} bedtime stories</strong>. Every child has different interests, and we believe in checking every box to find the story that captures their heart. Reading about a favorite topic helps engage reluctant readers and makes bedtime a specialized treat.</span>
                <span className="block">Like all our tales, these stories are crafted to be short, soothing, and safe for young children. Whether you're looking for something educational or just plain fun, these <strong className="text-pink-200">free stories for kids</strong> are ready to be part of your nightly routine.</span>
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
            <StickyHeader />

            <div className="container mx-auto px-4 pt-24 pb-16">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg capitalize">
                        {decodedTag} Bedtime Stories
                    </h1>
                    <p className="text-lg text-purple-200 mb-8">
                        {getIntroText(decodedTag)}
                    </p>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        <Link
                            href="/library"
                            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all bg-white/10 text-white hover:bg-white/20"
                        >
                            All
                        </Link>
                        {tags.map(t => (
                            <Link
                                key={t}
                                href={`/library/${encodeURIComponent(t)}`}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${decodedTag === t ? 'bg-white text-purple-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
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
                                    <Link
                                        href={`/story/${story.slug || story.id}`}
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
                <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 text-center border border-white/20 shadow-xl mb-24">
                    <h3 className="text-2xl font-bold text-white mb-4">Never Miss a Story</h3>
                    <p className="text-purple-200 mb-8">Get these stories delivered to your inbox everyday.</p>
                    <SubscribeForm />
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mb-16 text-white">
                    <h2 className="text-3xl font-bold text-center mb-8 drop-shadow-md">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold mb-2">Are these bedtime stories free to read?</h3>
                            <p className="text-purple-100">Yes, all our <em className="text-pink-200">short bedtime stories for kids</em> are completely free to read online. Our library is updated daily with new <em className="text-pink-200">AI-generated tales</em>.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold mb-2">How does the AI story generator work?</h3>
                            <p className="text-purple-100">Our <em className="text-pink-200">AI story generator</em> creates unique, child-safe tales every night. Each story is human-reviewed to ensure it's perfect for a peaceful night's sleep.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold mb-2">What age group are these stories for?</h3>
                            <p className="text-purple-100">Our stories are written to be calm and engaging for children aged 3-10. They make excellent <em className="text-pink-200">short stories for sleep</em> and quiet time.</p>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}
