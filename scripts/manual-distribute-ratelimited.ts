
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Dynamic imports
const getEmailLib = async () => import('../lib/email');
const getTemplatesLib = async () => import('../lib/email-templates');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function manualDistribute() {
    console.log('🚀 Starting Manual Distribution (With Rate Limiting)...');

    // Load libs
    const { sendEmail } = await getEmailLib();
    const { getStoryEmailHtml } = await getTemplatesLib();

    const today = '2026-01-11';

    // 1. Find story
    const { data: story } = await supabase
        .from('stories')
        .select('*')
        .eq('date', today)
        .maybeSingle();

    if (!story) return console.error('❌ FAIL: No story found.');

    // Note: It might be marked SENT partially now, so we can't check purely for APPROVED.
    // Instead, we should check which subscribers actually got it? 
    // Or just re-send to everyone (ignoring duplicates? Resend doesn't dedup automatically).
    // Better: Query subscribers again, and maybe just retry all? 
    // Ideally we'd track who got it, but we don't have a 'sent_emails' table yet.
    // Given the failure was strict 429, safe to assume most failed.
    // Let's just retry.

    console.log(`✅ Found Story: "${story.title}"`);

    // 2. Get Subscribers
    const { data: subscribers } = await supabase
        .from('subscribers')
        .select('email')
        .eq('is_active', true);

    if (!subscribers) return console.error('❌ FAIL: No subscribers.');

    console.log(`📧 preparing to send to ${subscribers.length} subscribers...`);

    let sentCount = 0;
    let failCount = 0;

    // 3. Send Emails Sequentially (safe)
    for (const [index, subscriber] of subscribers.entries()) {
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

        try {
            console.log(`[${index + 1}/${subscribers.length}] Sending to ${subscriber.email}...`);
            await sendEmail({
                to: subscriber.email,
                subject: `🌙 Today's Bedtime Story: ${story.title}`,
                html: getStoryEmailHtml(story, unsubscribeUrl),
            });
            console.log('   ✅ Sent.');
            sentCount++;
        } catch (err: any) {
            console.error('   ❌ Failed:', err.message);
            failCount++;
        }

        // Wait 1 second between emails to respect 2 req/sec limit safely
        await delay(1000);
    }

    console.log(`✅ Finished: ${sentCount} sent, ${failCount} failed.`);

    // 4. Update Status (Ensure it is SENT)
    await supabase.from('stories').update({ status: 'SENT' }).eq('id', story.id);
}

manualDistribute();
