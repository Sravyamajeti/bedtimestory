import Link from 'next/link';
import Image from 'next/image';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { getBlogPostBySlug, getStrapiMedia } from '@/lib/strapi';
import StickyHeader from '@/app/components/StickyHeader';
import Footer from '@/app/components/Footer';
import RelatedBlogs from '@/app/components/RelatedBlogs';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await getBlogPostBySlug(resolvedParams.slug);

    if (!post) return { title: 'Story Not Found' };

    const imageUrl = getStrapiMedia(post.attributes.coverImage?.data?.attributes?.url);

    return {
        title: `${post.attributes.title} | Bedtime Stories Blog`,
        description: post.attributes.description,
        openGraph: {
            images: imageUrl ? [imageUrl] : [],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await getBlogPostBySlug(resolvedParams.slug);

    if (!post) {
        notFound();
    }

    const imageUrl = getStrapiMedia(post.attributes.coverImage?.data?.attributes?.url);
    const author = post.attributes.author?.data?.attributes;
    const category = post.attributes.category?.data?.attributes;

    return (
        <div className="min-h-screen bg-indigo-950 text-purple-50 font-sans selection:bg-pink-500/30">
            <StickyHeader />

            <main>
                {/* Hero / Header */}
                <div className="relative pt-32 pb-16 px-4 md:px-8">
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        {category && (
                            <Link
                                href={`/blog?category=${category.slug}`}
                                className="inline-block px-4 py-1 mb-6 rounded-full bg-pink-500/20 border border-pink-500/50 text-pink-200 text-sm font-bold hover:bg-pink-500 hover:text-white transition-colors"
                            >
                                {category.name}
                            </Link>
                        )}

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
                            {post.attributes.title}
                        </h1>

                        <div className="flex items-center justify-center gap-6 text-purple-200/80">
                            <div className="flex items-center gap-2">
                                {author?.avatar?.data && (
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                        <Image
                                            src={getStrapiMedia(author.avatar.data.attributes.url)!}
                                            alt={author.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <span className="font-medium">{author?.name}</span>
                            </div>
                            <span className="w-1 h-1 bg-purple-200/40 rounded-full"></span>
                            <span>{new Date(post.attributes.publishedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                {imageUrl && (
                    <div className="relative w-full aspect-video max-w-5xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                        <Image
                            src={imageUrl}
                            alt={post.attributes.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Content Body */}
                <article className="max-w-3xl mx-auto px-4 md:px-8 prose prose-lg prose-invert prose-purple mb-24">
                    {post.attributes.content ? (
                        <BlocksRenderer
                            content={post.attributes.content}
                            blocks={{
                                image: ({ image }) => (
                                    <div className="relative w-full aspect-video my-8 rounded-xl overflow-hidden">
                                        <Image
                                            src={image.url}
                                            alt={image.alternativeText || ''}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ),
                                paragraph: ({ children }) => <p className="text-purple-100/90 leading-relaxed mb-6">{children}</p>,
                                heading: ({ children, level }) => {
                                    switch (level) {
                                        case 1: return <h1 className="text-4xl font-bold text-white mt-12 mb-6">{children}</h1>;
                                        case 2: return <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b border-white/10 pb-4">{children}</h2>;
                                        case 3: return <h3 className="text-2xl font-bold text-pink-200 mt-8 mb-4">{children}</h3>;
                                        case 4: return <h4 className="text-xl font-bold text-white mt-6 mb-4">{children}</h4>;
                                        case 5: return <h5 className="text-lg font-bold text-white mt-4 mb-2">{children}</h5>;
                                        case 6: return <h6 className="text-base font-bold text-white mt-4 mb-2">{children}</h6>;
                                        default: return <h1 className="text-4xl font-bold text-white mt-12 mb-6">{children}</h1>;
                                    }
                                },
                            }}
                        />
                    ) : (
                        <div className="p-8 bg-white/5 rounded-2xl text-center text-purple-200/60 italic">
                            (No content available)
                        </div>
                    )}
                </article>

                {/* Related Stories */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
                    <RelatedBlogs currentSlug={post.attributes.slug} categorySlug={category?.slug} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
