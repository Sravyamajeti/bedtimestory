import Link from 'next/link';
import Image from 'next/image';
import { getStrapiMedia } from '@/lib/strapi';

interface BlogCardProps {
    article: any;
}

export default function BlogCard({ article }: BlogCardProps) {
    const imageUrl = getStrapiMedia(article.attributes.coverImage?.data?.attributes?.url);
    const category = article.attributes.category?.data?.attributes;
    const author = article.attributes.author?.data?.attributes;

    return (
        <Link
            href={`/blog/${article.attributes.slug}`}
            className="group flex flex-col h-full bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
        >
            {/* Image Container */}
            <div className="relative h-48 w-full overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={article.attributes.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                        <span className="text-4xl">🌙</span>
                    </div>
                )}

                {category && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20">
                        {category.name}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-6">
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-pink-200 transition-colors">
                    {article.attributes.title}
                </h3>

                <p className="text-purple-200/80 text-sm line-clamp-3 mb-6 flex-grow">
                    {article.attributes.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        {author?.avatar?.data && (
                            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
                                <Image
                                    src={getStrapiMedia(author.avatar.data.attributes.url)!}
                                    alt={author.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <span className="text-xs text-purple-200/60 font-medium">
                            {author?.name || 'Bedtime Stories'}
                        </span>
                    </div>
                    <span className="text-xs text-purple-200/40">
                        {new Date(article.attributes.publishedAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </Link>
    );
}
