
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { getStoryEmailHtml } from '@/lib/email-templates';

// Helper for delay to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const maxDuration = 300; // Allow 5 minutes for large lists

export async function POST(req: Request) {
    try {
        // 1. Verify Admin Key
        const adminKey = req.headers.get('x-admin-key');
        if (adminKey !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get today's date (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        console.log('Server Time (UTC):', new Date().toISOString());

        // 2. Find today's story
        const { data: story } = await supabase
            .from('stories')
            .select('*')
            .eq('date', today)
            .maybeSingle();

        if (!story) {
            return NextResponse.json({ error: 'No story found for today' }, { status: 404 });
        }

        if (story.status !== 'APPROVED' && story.status !== 'SENT') {
            return NextResponse.json({ error: `Story status is ${story.status}. Must be APPROVED.` }, { status: 400 });
        }

        // 3. Get Subcribers
        const { data: subscribers } = await supabase
            .from('subscribers')
            .select('email')
            .eq('is_active', true);

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ message: 'No active subscribers found' });
        }

        console.log(`[Admin Broadcast] Sending '${story.title}' to ${subscribers.length} subscribers...`);

        // 4. Send Emails Sequentially (with delay)
        let sentCount = 0;
        let failCount = 0;

        for (const subscriber of subscribers) {
            const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

            try {
                await sendEmail({
                    to: subscriber.email,
                    subject: `🌙 Today's Bedtime Story: ${story.title}`,
                    html: getStoryEmailHtml(story, unsubscribeUrl),
                });
                sentCount++;
            } catch (error) {
                console.error(`Failed to send to ${subscriber.email}:`, error);
                failCount++;
            }

            // Wait 500ms between emails (conservative 2 req/sec limit)
            await delay(500);
        }

        // 5. Update Status
        await supabase
            .from('stories')
            .update({ status: 'SENT' })
            .eq('id', story.id);

        return NextResponse.json({
            message: 'Broadcast completed',
            stats: {
                total: subscribers.length,
                sent: sentCount,
                failed: failCount
            }
        });

    } catch (error) {
        console.error('Broadcast error:', error);
        return NextResponse.json({
            error: 'Failed to broadcast story',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
