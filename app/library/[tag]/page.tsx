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

        // Nature & Outdoors (Expanded)
        if (lower.includes('nature') || lower.includes('forest') || lower.includes('garden') || lower.includes('mountain') || lower.includes('river') || lower.includes('flower')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Immerse your child in the soothing sounds of the natural world with our <strong className="text-pink-200">nature bedtime stories</strong>. Whether it's a secret garden, a misty mountain peak, or a whispering forest, these tales help young readers connect with the beauty of the outdoors from the safety of their covers.</span>
                    <span className="block">The slow, rhythmic descriptions of blooming flowers, flowing water, and rustling leaves act as a natural lullaby. Perfect for calming active minds, our <strong className="text-pink-200">stories about nature</strong> often feature gentle wildlife and the changing seasons, making them an excellent choice for a peaceful night's rest.</span>
                </span>
            );
        }

        // Space & Astronomy
        if (lower.includes('space') || lower.includes('star') || lower.includes('moon') || lower.includes('planet')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Blast off into a universe of dreams with our <strong className="text-pink-200">space stories for kids</strong>. Your little astronaut will drift among twinkling stars, friendly planets, and glowing comets. These cosmic adventures spark imagination and wonder while maintaining a calm, sleepy pace suitable for bedtime.</span>
                    <span className="block">Our <strong className="text-pink-200">astronomy tales</strong> focus on the quiet beauty of the night sky rather than fast-paced action. By turning the vast darkness of space into a cozy, friendly place full of sleeping stars and moonbeams, we help children feel safe, comfortable, and ready to drift off into their own gravity-free dreams.</span>
                </span>
            );
        }

        // Animals & Pets
        if (lower.includes('animal') || lower.includes('pet') || lower.includes('cat') || lower.includes('dog') || lower.includes('bunny') || lower.includes('bear')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Who doesn't love a furry friend? Our <strong className="text-pink-200">animal bedtime stories</strong> feature lovable characters that children adore. From brave puppies to wise old bears, these animal adventures teach important life lessons about kindness, empathy, and understanding others—all without being preachy.</span>
                    <span className="block">Animals provide a sense of comfort and companionship that is perfect for sleep. Our collection includes both domestic pets and wild creatures, all behaving in gentle, friendly ways. Reading these <strong className="text-pink-200">animal tales for toddlers</strong> is a sure way to end the day with a warm, fuzzy feeling.</span>
                </span>
            );
        }

        // Vehicles & Transportation (New)
        if (lower.includes('vehicle') || lower.includes('car') || lower.includes('train') || lower.includes('truck') || lower.includes('plane') || lower.includes('wheel')) {
            return (
                <span className="block space-y-4">
                    <span className="block">For the child who loves things that go, our <strong className="text-pink-200">vehicle bedtime stories</strong> are the perfect pit stop. Follow sleepy trains returning to the station, helpful trucks finishing their day's work, or little cars tucking into their garages. These stories turn mechanical fascination into a winding-down routine.</span>
                    <span className="block">Instead of high-speed races, we focus on the satisfaction of a job well done and the quiet of the night shift. The rhythmic "chug-chug" of a train or the soft hum of an engine can be incredibly soothing. Let your little one ride along on these <strong className="text-pink-200">transportation tales</strong> all the way to dreamland.</span>
                </span>
            );
        }

        // Arts & Creativity (New)
        if (lower.includes('art') || lower.includes('music') || lower.includes('paint') || lower.includes('dance') || lower.includes('creat')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Unleash a canvas of dreams with our <strong className="text-pink-200">stories about art and creativity</strong>. In these colorful tales, characters might paint with moonbeams, dance with the wind, or sing with the birds. It's a celebration of imagination that encourages children to see the beauty and possibility in their own world.</span>
                    <span className="block">Creativity helps process emotions and settle the mind. These calming narratives focus on the joy of making and doing, washing away the day's worries with splashes of color and melody. Let these <strong className="text-pink-200">creative bedtime stories</strong> inspire colorful dreams and a peaceful, artistic sleep.</span>
                </span>
            );
        }

        // Magic & Fantasy
        if (lower.includes('magic') || lower.includes('fairy') || lower.includes('wizard') || lower.includes('dragon') || lower.includes('unicorn')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Step into a world where anything is possible with our <strong className="text-pink-200">magical bedtime stories</strong>. In these enchanted realms, fairies flutter, friendly dragons soar, and wizards cast spells of sweet dreams. Magic sparks a child's creativity and helps them visualize wonderful places as they close their eyes.</span>
                    <span className="block">Our fantasy stories are full of wonder but free from scary monsters. They focus on the magic of kindness, discovery, and believing in oneself. Let your child's imagination take flight with these <strong className="text-pink-200">fantasy stories for kids</strong>, creating a glittering bridge between their day and the dream world.</span>
                </span>
            );
        }

        // Friendship
        if (lower.includes('friendship') || lower.includes('kindness') || lower.includes('social')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Friendship is one of the first and most important lessons a child learns. Our <strong className="text-pink-200">stories about friendship</strong> celebrate the bonds between best friends, whether they are children, animals, or magical beings. These tales model sharing, caring, and working together.</span>
                    <span className="block">Ending the day with a story about connection and love helps children feel secure. These <strong className="text-pink-200">social-emotional stories</strong> reassure little ones that they are loved and that kindness is a superpower. It's the perfect positive note to end the day on before drifting off to sleep.</span>
                </span>
            );
        }

        // Fallback for other tags
        return (
            <span className="block space-y-4">
                <span className="block">Explore our unique collection of <strong className="text-pink-200">{t} bedtime stories</strong>. Every child has different interests, and we believe in checking every box to find the story that captures their heart. Reading about a favorite topic involves them in the bedtime routine and makes it a specialized treat.</span>
                <span className="block">Like all our tales, these stories are crafted to be short, soothing, and safe for young children. Whether you're looking for something educational or just plain fun, these <strong className="text-pink-200">free stories for kids</strong> are ready to be part of your nightly ritual.</span>
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
