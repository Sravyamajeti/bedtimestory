import { MetadataRoute } from 'next';
import { supabase, DEMO_MODE } from '@/lib/supabase';
import { mockData } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://bedtimestories.productmama.dev';

    // Static routes
    const routes = [
        '',
        '/library',
        '/categories',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Fetch stories for dynamic routes
    let stories = [];
    if (DEMO_MODE) {
        stories = await mockData.getStories();
    } else {
        const { data } = await supabase
            .from('stories')
            .select('id, date, slug, tags')
            .in('status', ['APPROVED', 'SENT'])
            .order('date', { ascending: false });
        stories = data || [];
    }

    const storyRoutes = stories.map((story: any) => ({
        url: `${baseUrl}/story/${story.slug || story.id}`,
        lastModified: story.date,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Generate Tag Routes
    const allTags = new Set<string>();
    stories.forEach((s: any) => {
        if (s.tags) s.tags.forEach((t: string) => allTags.add(t));
    });

    const tagRoutes = Array.from(allTags).map(tag => ({
        url: `${baseUrl}/library/${encodeURIComponent(tag)}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...routes, ...storyRoutes, ...tagRoutes];
}
