import { getBlogPosts } from '@/lib/strapi';
import BlogCard from './BlogCard';

interface RelatedBlogsProps {
    currentSlug: string;
    categorySlug?: string;
}

export default async function RelatedBlogs({ currentSlug, categorySlug }: RelatedBlogsProps) {
    if (!categorySlug) return null;

    // Fetch 3 posts from same category, excluding current one
    const { data: posts } = await getBlogPosts(1, 3, {
        slug: { $ne: currentSlug },
        category: { slug: { $eq: categorySlug } },
    });

    if (!posts || posts.length === 0) return null;

    return (
        <div className="mt-16 pt-16 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-8">Related Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.map((post: any) => (
                    <BlogCard key={post.id} article={post} />
                ))}
            </div>
        </div>
    );
}
