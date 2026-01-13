import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
    // Dynamic import to ensure env vars are loaded first
    const { supabase } = await import('../lib/supabase');

    console.log("Checking Environment Variables...");
    const vars = [
        'RESEND_API_KEY',
        'ADMIN_EMAIL',
        'SENDER_EMAIL',
        'NEXT_PUBLIC_ADMIN_SECRET',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'OPENAI_API_KEY'
    ];
    const missing: string[] = [];
    vars.forEach(v => {
        if (process.env[v]) {
            console.log(`${v}: Present`);
        } else {
            console.log(`${v}: MISSING`);
            missing.push(v);
        }
    });

    if (missing.length > 0) {
        console.error("Missing variables:", missing);
        process.exit(1);
    }

    console.log("\nChecking Latest Stories...");
    const { data: stories, error } = await supabase
        .from('stories')
        .select('id, title, date, status, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error("Error fetching stories:", error);
    } else {
        console.table(stories);
    }
}

main().catch(console.error);
