
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeTimestamps() {
    console.log('Analyzing Story Timestamps...');
    const { data: stories } = await supabase
        .from('stories')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

    if (!stories) return;

    console.log('Date (Target) | Created At (UTC)          | Status   | Time Gap (Hours before Target 6AM)');
    console.log('---------------------------------------------------------------------------------------');

    stories.forEach(s => {
        const targetDate = new Date(`${s.date}T06:00:00Z`); // Cron runs at 6AM UTC on this date
        const createdDate = new Date(s.created_at);
        const diffMs = targetDate.getTime() - createdDate.getTime();
        const diffHours = (diffMs / (1000 * 60 * 60)).toFixed(1);

        console.log(`${s.date}    | ${s.created_at.substring(0, 19)} | ${s.status.padEnd(8)} | ${diffHours} hours`);
    });
}

analyzeTimestamps();
