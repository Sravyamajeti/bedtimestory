import { config } from 'dotenv';
config({ path: '.env.local' });
// Dynamic import for supabase to ensure env vars are loaded
async function main() {
    const { supabase } = await import('../lib/supabase');

    console.log("Fixing Incorrect Story Date...");

    // 1. Find the incorrect story (Unicorn story on Jan 13)
    // We target by title just to be safe we don't move a NEW story if one appeared.
    const { data: story, error } = await supabase
        .from('stories')
        .select('*')
        .eq('date', '2026-01-13')
        .ilike('title', '%Unicorn%')
        .maybeSingle();

    if (error) {
        console.error("Error finding story:", error);
        return;
    }

    if (!story) {
        console.error("Story not found for 2026-01-13 with 'Unicorn' in title.");
        return;
    }

    console.log(`Found story: "${story.title}" (ID: ${story.id}) currently on ${story.date}`);

    // 2. Update to Jan 12
    const { error: updateError } = await supabase
        .from('stories')
        .update({ date: '2026-01-12' })
        .eq('id', story.id);

    if (updateError) {
        console.error("Failed to update story:", updateError);
    } else {
        console.log("✅ Successfully moved story to 2026-01-12.");
    }
}

main().catch(console.error);
