'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
    categories: any[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');

    return (
        <div className="flex flex-wrap gap-3">
            <Link
                href="/blog"
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${!currentCategory
                        ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                        : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10 hover:text-white'
                    }`}
            >
                All
            </Link>

            {categories.map((category) => {
                const isActive = currentCategory === category.attributes.slug;
                return (
                    <Link
                        key={category.id}
                        href={`/blog?category=${category.attributes.slug}`}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${isActive
                                ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                                : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {category.attributes.name}
                    </Link>
                );
            })}
        </div>
    );
}
