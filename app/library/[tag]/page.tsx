import { supabase, DEMO_MODE } from '@/lib/supabase';
import { mockData } from '@/lib/mockData';
import StickyHeader from '@/app/components/StickyHeader';
import Footer from '@/app/components/Footer';
import SubscribeForm from '@/app/components/SubscribeForm';
import FAQ from '@/app/components/FAQ';
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

        // Princess & Royalty
        if (lower.includes('princess') || lower.includes('queen') || lower.includes('prince') || lower.includes('royal') || lower.includes('castle')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Enter a world of elegance and courage with our <strong className="text-pink-200">princess bedtime stories</strong>. Whether it's a brave princess solving a kingdom's problem or a kind prince making a new friend, these tales are filled with royal wonder and grace.</span>
                    <span className="block">Our <strong className="text-pink-200">stories about royalty</strong> go beyond the crown, focusing on leadership, kindness, and being true to oneself. These gentle adventures in sparkling castles and blooming gardens are the perfect way to invite sweet, majestic dreams.</span>
                </span>
            );
        }

        // Inventions & Science
        if (lower.includes('invention') || lower.includes('robot') || lower.includes('science') || lower.includes('gadget') || lower.includes('build')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Spark your little one's curiosity with our <strong className="text-pink-200">stories about inventions</strong>. Watch as clever characters build helpful robots, design flying machines, or discover new ways to make the world better. These tales celebrate creativity and the joy of figuring things out.</span>
                    <span className="block">Perfect for budding engineers, our <strong className="text-pink-200">science bedtime stories</strong> combine learning with imagination. They show that even the biggest ideas start with a dream, encouraging your child to close their eyes and imagine what they might create tomorrow.</span>
                </span>
            );
        }

        // Classrooms & School
        if (lower.includes('classroom') || lower.includes('school') || lower.includes('teacher') || lower.includes('learn')) {
            return (
                <span className="block space-y-4">
                    <span className="block">Open the book on learning and fun with our <strong className="text-pink-200">classroom stories for kids</strong>. From the excitement of the first day to the magic of a show-and-tell, these tales capture the friendly and welcoming spirit of school.</span>
                    <span className="block">Our <strong className="text-pink-200">stories about school</strong> focus on friendship, curiosity, and the joy of discovering new things. They are perfect for settling down after a busy school day or for comforting little ones, reminding them that learning is a wonderful adventure.</span>
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
                {(() => {
                    const categoryFAQs: Record<string, { question: string; answer: string }[]> = {
                        space: [
                            { question: "Are these space stories scary for young children?", answer: "Not at all! Our space adventures focus on the wonder of the universe, friendly star-travel, and the beauty of the cosmos. You won't find scary aliens or intense conflicts here—just peaceful journeys through the stars." },
                            { question: "Will my child learn real facts about space?", answer: "While our primary goal is a soothing bedtime story, many of our tales gently weave in real concepts about planets, stars, and the moon, helping to spark a love for science and astronomy in a relaxing way." },
                            { question: "Are these stories good for sleep?", answer: "Yes. Even though they take place in the vastness of space, the narratives are designed to be grounding and rhythmic, perfect for helping little astronauts drift off to sleep after a long day." }
                        ],
                        magic: [
                            { question: "What kind of magic is in these stories?", answer: "Our stories feature \"gentle magic\"—think glowing fireflies, whispering trees, and friendly fairies. We focus on enchantment and wonder rather than complex spell-casting or scary witches." },
                            { question: "Are these fairytales or original stories?", answer: "These are brand-new, original tales generated by our AI! While they may have the classic feel of a fairytale, you'll be reading a unique story that you haven't heard a thousand times before." },
                            { question: "Do these stories have moral lessons?", answer: "Many of our magical tales center around themes of friendship, kindness, and helping others, wrapping positive social values in a layer of sparkling fun." }
                        ],
                        forest: [
                            { question: "What animals will we meet in the forest?", answer: "Our forest stories are full of woodland friends like wise owls, busy squirrels, sleepy bears, and gentle deer. It’s a cozy community of critters that helps children feel safe and connected to nature." },
                            { question: "Are these stories educational?", answer: "Yes! Forest stories often highlight the changing seasons, the sounds of nature, and the habits of animals, providing a lovely way to learn about the natural world before bed." },
                            { question: "Is the \"forest\" setting safe for bedtime?", answer: "Absolutely. We ensure our forests are depicted as cozy, welcoming homes for animals, not dark or spooky places. They are designed to feel like a warm, green blanket." }
                        ],
                        art: [
                            { question: "How can a story be about \"Arts\"?", answer: "These stories follow characters who love to paint, draw, sing, or create. They focus on the joy of expression, the beauty of colors, and the satisfaction of making something new." },
                            { question: "Will these stories inspire my child to create?", answer: "Definitely! Don't be surprised if your little one wakes up wanting to draw a picture of the story you read the night before. These tales celebrate imagination and creativity." },
                            { question: "Are these stories simple enough for toddlers?", answer: "Yes. We focus on simple concepts like mixing colors, finding shapes in clouds, and the fun of getting messy (in a good way!), which are relatable concepts for even the youngest artists." }
                        ],
                        princess: [
                            { question: "Are these traditional \"damsel in distress\" stories?", answer: "No. Our princess stories focus on themes of kindness, exploration, friendship, and curiosity. Our royals are active participants in their own gentle adventures." },
                            { question: "Do these stories always feature princes?", answer: "Not necessarily! Many of our stories focus on the princess's relationship with her family, her animal friends, or her kingdom, rather than just romance." },
                            { question: "Is there magic involved?", answer: "Often, yes! Our Princess stories frequently crossover with our Magic themes, featuring enchanted gardens, talking royal pets, and sparkling castles." }
                        ],
                        vehicle: [
                            { question: "Can a story about cars be calming?", answer: "Surprisingly, yes! We focus on the rhythmic journey of travel—the hum of an engine, the rolling wheels, and the process of parking or \"going to sleep\" in the garage. It’s perfect for winding down active kids." },
                            { question: "What types of vehicles are included?", answer: "You’ll find stories about sleepy trains, helpful trucks, soaring airplanes, and speedy race cars that learn to slow down." },
                            { question: "My child is obsessed with trucks. Are these technically accurate?", answer: "We aim for stories that respect the different jobs vehicles do (like digging or hauling) while keeping the tone whimsical and story-focused rather than like an instruction manual." }
                        ],
                        garden: [
                            { question: "What are Garden stories about?", answer: "These tales explore the tiny world of a garden—flowers blooming, seeds growing, and the busy lives of butterflies and bees. It’s a lesson in patience and the beauty of small things." },
                            { question: "Are these stories seasonal?", answer: "Our collection covers all seasons, from the first buds of spring to the sleepy rest of winter, helping children understand the cycle of the year." },
                            { question: "Are bugs portrayed as scary?", answer: "Never! In our garden stories, insects are helpful friends and colorful characters, helping children appreciate even the smallest creatures." }
                        ],
                        mountain: [
                            { question: "Are mountain stories too adventurous for bedtime?", answer: "We balance the spirit of adventure with a slow, steady pace. Think of a long, rewarding hike that ends with a beautiful sunset and a cozy campfire sleep, rather than a dangerous cliffhanger." },
                            { question: "What themes do these stories explore?", answer: "Mountain stories often touch on themes of perseverance (\"climbing the hill\"), gaining a new perspective, and the majesty of the outdoors." },
                            { question: "Are there yetis or monsters?", answer: "We keep our mountains safe! You might meet a shy, friendly mythical creature now and then, but they are always gentle and kind, never frightening." }
                        ]
                    };

                    // Match tag to key (simple inclusion check or direct match)
                    const lowerTag = decodedTag.toLowerCase();
                    let selectedKey = Object.keys(categoryFAQs).find(k => lowerTag.includes(k));

                    // Fallback to general library FAQ if no specific category match
                    const selectedFAQs = selectedKey ? categoryFAQs[selectedKey] : [
                        { question: `What are ${decodedTag} stories?`, answer: `Our ${decodedTag} stories are soothing tales designed to help children relax and drift off to sleep, featuring themes of ${decodedTag}.` },
                        { question: "Are these stories safe?", answer: "Yes, all our stories are AI-generated and human-reviewed to ensure they are safe, calm, and age-appropriate for children." }
                    ];

                    return <FAQ items={selectedFAQs} title={`Frequency Asked Questions about ${decodedTag}`} />;
                })()}

                <Footer />
            </div>
        </div>
    );
}
