
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStories() {
    console.log('--- Checking Recent Stories ---');
    const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .order('date', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching stories:', error);
    } else {
        stories.forEach(s => {
            console.log(`Date: ${s.date} | Status: ${s.status} | Title: ${s.title} | ID: ${s.id} | CreatedAt: ${s.created_at}`);
        });
    }

    console.log('\n--- Checking Subscribers ---');
    const { count, error: subError } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

    if (subError) {
        console.error('Error checking subscribers:', subError);
    } else {
        console.log(`Active Subscribers: ${count}`);
    }
}

checkStories();
