
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function slugify(text: string): string {
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

async function backfillSlugs() {
    console.log('Starting slug backfill...');

    // 1. Fetch stories with NULL slugs
    const { data: stories, error } = await supabase
        .from('stories')
        .select('id, title, slug')
        .is('slug', null);

    if (error) {
        console.error('Error fetching stories:', error);
        return;
    }

    if (!stories || stories.length === 0) {
        console.log('No stories found with missing slugs.');
        return;
    }

    console.log(`Found ${stories.length} stories with missing slugs.`);

    // 2. Update each story
    for (const story of stories) {
        if (!story.title) continue;

        const slug = slugify(story.title);
        console.log(`Updating story "${story.title}" -> slug: "${slug}"`);

        const { error: updateError } = await supabase
            .from('stories')
            .update({ slug })
            .eq('id', story.id);

        if (updateError) {
            console.error(`Failed to update story ${story.id}:`, updateError);
        }
    }

    console.log('Backfill complete!');
}

backfillSlugs();
