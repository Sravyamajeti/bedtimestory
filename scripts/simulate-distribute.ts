
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateDistribute() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Simulating distribution for: ${today}`);

    // 1. Find story
    const { data: story } = await supabase
        .from('stories')
        .select('*')
        .eq('date', today)
        .maybeSingle();

    if (!story) {
        console.error('❌ FAIL: No story found.');
        return;
    }
    console.log(`✅ Story Found: ${story.title} (${story.status})`);

    // 2. Check Status
    if (story.status !== 'APPROVED') {
        console.error(`❌ FAIL: Status is ${story.status}, expected APPROVED.`);
        return;
    }

    // 3. Subscribers
    const { data: subscribers, error } = await supabase
        .from('subscribers')
        .select('email')
        .eq('is_active', true);

    if (error) {
        console.error('❌ FAIL: Database error fetching subscribers:', error);
        return;
    }

    if (!subscribers || subscribers.length === 0) {
        console.error('❌ FAIL: No active subscribers found.');
        return;
    }

    console.log(`✅ Success! Found ${subscribers.length} subscribers.`);
    console.log('Sample subscribers:', subscribers.slice(0, 3).map(s => s.email));
    console.log('Conclusion: Logic is valid. Cron likely failed to trigger or error happened during email send (API limit?).');
}

simulateDistribute();
