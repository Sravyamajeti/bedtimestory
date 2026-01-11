
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Dynamic imports for libraries
const getEmailLib = async () => import('../lib/email');
const getTemplatesLib = async () => import('../lib/email-templates');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function manualDistribute() {
    console.log('🚀 Starting Manual Distribution...');

    // Load libs
    const { sendEmail } = await getEmailLib();
    const { getStoryEmailHtml } = await getTemplatesLib();

    const today = '2026-01-11'; // Explicitly targeting the missing date
    console.log(`Target Date: ${today}`);

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

    if (story.status !== 'APPROVED') {
        console.error(`❌ FAIL: Story status is ${story.status}. Must be APPROVED.`);
        return;
    }

    console.log(`✅ Found Story: "${story.title}"`);

    // 2. Get Subscribers
    const { data: subscribers } = await supabase
        .from('subscribers')
        .select('email')
        .eq('is_active', true);

    if (!subscribers || subscribers.length === 0) {
        console.error('❌ FAIL: No subscribers found.');
        return;
    }

    console.log(`📧 Sending to ${subscribers.length} subscribers...`);

    // 3. Send Emails
    const emailPromises = subscribers.map((subscriber) => {
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

        return sendEmail({
            to: subscriber.email,
            subject: `🌙 Today's Bedtime Story: ${story.title}`,
            html: getStoryEmailHtml(story, unsubscribeUrl),
        });
    });

    const results = await Promise.allSettled(emailPromises);
    const sentCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Finished: ${sentCount} sent, ${failCount} failed.`);

    // 4. Update Status to SENT
    if (sentCount > 0) {
        await supabase
            .from('stories')
            .update({ status: 'SENT' })
            .eq('id', story.id);
        console.log('✅ Story status updated to SENT.');
    }
}

manualDistribute();
