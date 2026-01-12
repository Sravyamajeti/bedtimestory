
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config({ path: '.env.local' });

// INLINED CODE START
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    try {
        const { data, error } = await resend.emails.send({
            from: `${process.env.SENDER_NAME || 'Bedtime Stories'} <${process.env.SENDER_EMAIL || 'onboarding@resend.dev'}>`,
            to,
            subject,
            html,
        });
        if (error) {
            console.error("Error sending email:", error);
            throw error;
        }
        console.log("Message sent: %s", data?.id);
        return data;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

interface Story {
    title: string;
    summary_bullets: string[];
    content: string;
}

function getStoryEmailHtml(story: Story, unsubscribeUrl: string) {
    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">${story.title}</h1>
      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">📚 Story Summary:</h3>
        <ul>
          ${story.summary_bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
        </ul>
      </div>
      <div style="line-height: 1.8; color: #374151;">
        ${story.content}
      </div>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="font-size: 12px; color: #6B7280; text-align: center;">
        <a href="${unsubscribeUrl}" style="color: #6B7280;">Unsubscribe</a>
      </p>
    </div>
  `;
}
// INLINED CODE END

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function manualDistribute() {
    console.log('🚀 Starting Manual Distribution...');

    const today = '2026-01-13'; // Targeting the APPROVED story
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

    // 0. RESET STATUS to APPROVED (to retry failed sends)
    await supabase.from('stories').update({ status: 'APPROVED' }).eq('id', story.id);
    console.log('🔄 Reset story status to APPROVED for retry.');

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

    console.log(`📧 Sending to ${subscribers.length} subscribers sequentially...`);

    // 3. Send Emails Sequentially
    let sentCount = 0;
    let failCount = 0;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const subscriber of subscribers) {
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

        try {
            await sendEmail({
                to: subscriber.email,
                subject: `🌙 Today's Bedtime Story: ${story.title}`,
                html: getStoryEmailHtml(story, unsubscribeUrl),
            });
            sentCount++;
            console.log(`✅ Sent to ${subscriber.email}`);
        } catch (err) {
            console.error(`❌ Failed to send to ${subscriber.email}:`, err);
            failCount++;
        }
        await delay(1000); // Wait 1 second
    }

    console.log(`✅ Finished: ${sentCount} sent, ${failCount} failed.`);

    // 4. Update Status to SENT
    if (sentCount > 0) { // Only mark SENT if at least some went through, or maybe only if strict? 
        // For now, if we sent to most, mark sent.
        await supabase
            .from('stories')
            .update({ status: 'SENT' })
            .eq('id', story.id);
        console.log('✅ Story status updated to SENT.');
    }
}

manualDistribute();
