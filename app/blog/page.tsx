import { Suspense } from 'react';
import { getBlogPosts, getCategories } from '@/lib/strapi';
import StickyHeader from '@/app/components/StickyHeader';
import Footer from '@/app/components/Footer';
import BlogCard from '@/app/components/BlogCard';
import BlogSearch from '@/app/components/BlogSearch';
import CategoryFilter from '@/app/components/CategoryFilter';

export const metadata = {
    title: 'Blog | Bedtime Stories',
    description: 'Read our latest stories, tips for bedtime, and updates from the Bedtime Stories team.',
};

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const search = resolvedSearchParams.search || '';
    const categorySlug = resolvedSearchParams.category || '';

    // Build filters
    const filters: any = {};
    if (search) {
        filters.title = { $containsi: search };
    }
    if (categorySlug) {
        filters.category = { slug: { $eq: categorySlug } };
    }

    // Parallel data fetching
    const [postsData, categoriesData] = await Promise.all([
        getBlogPosts(page, 12, filters),
        getCategories(),
    ]);

    const posts = postsData?.data || [];
    const meta = postsData?.meta || {};
    const categories = categoriesData?.data || [];

    return (
        <div className="min-h-screen bg-indigo-950 text-purple-50 font-sans selection:bg-pink-500/30">
            <StickyHeader />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 drop-shadow-sm">
                        Bedtime Stories Blog
                    </h1>
                    <p className="text-lg text-purple-200/80 max-w-2xl mx-auto">
                        Discover magical tales, helpful tips for sleepy time, and updates from our library.
                    </p>

                    {/* Search & Filter */}
                    <div className="flex flex-col items-center gap-6 mt-8">
                        <BlogSearch />
                        <CategoryFilter categories={categories} />
                    </div>
                </div>

                {/* Blog Grid */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post: any) => (
                            <BlogCard key={post.id} article={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                        <span className="text-4xl block mb-4">💤</span>
                        <h3 className="text-xl font-bold text-white mb-2">No stories found</h3>
                        <p className="text-purple-200/60">
                            Try adjusting your search or category filter.
                        </p>
                    </div>
                )}

                {/* Pagination (Simple) */}
                {meta.pagination && meta.pagination.pageCount > 1 && (
                    <div className="flex justify-center gap-4 mt-16">
                        {page > 1 && (
                            <a
                                href={`/blog?page=${page - 1}${search ? `&search=${search}` : ''}${categorySlug ? `&category=${categorySlug}` : ''}`}
                                className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                            >
                                ← Previous
                            </a>
                        )}
                        <span className="px-4 py-2 text-purple-200">
                            Page {page} of {meta.pagination.pageCount}
                        </span>
                        {page < meta.pagination.pageCount && (
                            <a
                                href={`/blog?page=${page + 1}${search ? `&search=${search}` : ''}${categorySlug ? `&category=${categorySlug}` : ''}`}
                                className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                            >
                                Next →
                            </a>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
