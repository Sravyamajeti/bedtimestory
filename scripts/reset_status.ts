import { config } from 'dotenv';
config({ path: '.env.local' });
// Dynamic import for supabase to ensure env vars are loaded
async function main() {
    const { supabase } = await import('../lib/supabase');

    console.log("Resetting Story Status to DRAFT...");

    const { data: story } = await supabase
        .from('stories')
        .select('*')
        .eq('date', '2026-01-12')
        .ilike('title', '%Unicorn%')
        .maybeSingle();

    if (!story) {
        console.error("Story not found for 2026-01-12.");
        return;
    }

    // Reset to DRAFT so admin options appear
    await supabase
        .from('stories')
        .update({ status: 'DRAFT' })
        .eq('id', story.id);

    console.log("✅ Story reset to DRAFT.");
}

main().catch(console.error);
