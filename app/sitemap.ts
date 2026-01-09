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
            .select('id, date')
            .in('status', ['APPROVED', 'SENT'])
            .order('date', { ascending: false });
        stories = data || [];
    }

    const storyRoutes = stories.map((story: any) => ({
        url: `${baseUrl}/story/${story.id || story._id}`,
        lastModified: story.date,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    return [...routes, ...storyRoutes];
}
