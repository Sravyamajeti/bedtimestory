import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const maxDuration = 60; // Allow up to 60 seconds

// Simple slugify function
function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
}

export async function GET(request: Request) {
    // Security check: require the admin secret
    const { searchParams } = new URL(request.url);
    if (searchParams.get('key') !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Fetch stories with NULL slugs
        const { data: stories, error: fetchError } = await supabaseAdmin
            .from('stories')
            .select('id, title')
            .is('slug', null);

        if (fetchError) {
            console.error("Error fetching stories:", fetchError);
            throw fetchError;
        }

        if (!stories || stories.length === 0) {
            return NextResponse.json({ message: 'No stories found with missing slugs.' });
        }

        const results = [];
        let successCount = 0;
        let failCount = 0;

        // 2. Update each story
        for (const story of stories) {
            if (!story.title) {
                results.push({ id: story.id, status: 'skipped_no_title' });
                continue;
            }

            const newSlug = slugify(story.title);

            const { error: updateError } = await supabaseAdmin
                .from('stories')
                .update({ slug: newSlug })
                .eq('id', story.id);

            if (updateError) {
                console.error(`Failed to update ${story.id}:`, updateError);
                results.push({ id: story.id, title: story.title, error: updateError.message });
                failCount++;
            } else {
                results.push({ id: story.id, title: story.title, slug: newSlug, status: 'updated' });
                successCount++;
            }
        }

        return NextResponse.json({
            message: `Processed stories. Updated: ${successCount}. Failed: ${failCount}.`,
            details: results
        });

    } catch (e) {
        console.error("Backfill error:", e);
        return NextResponse.json({
            error: e instanceof Error ? e.message : 'Unknown error'
        }, { status: 500 });
    }
}
