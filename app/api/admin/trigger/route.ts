import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { getWelcomeEmailHtml, getStoryEmailHtml, getAdminReviewEmailHtml } from '@/lib/email-templates';

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, payload } = body;

        if (!action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 });
        }

        const authHeader = request.headers.get('x-admin-key');
        if (authHeader !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Send Welcome Email
        if (action === 'send_welcome') {
            const { email } = payload;
            if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

            const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;
            await sendEmail({
                to: email,
                subject: '🌙 Welcome to Bedtime Stories! (Test)',
                html: getWelcomeEmailHtml(unsubscribeUrl),
                tags: [{ name: 'type', value: 'welcome' }]
            });

            return NextResponse.json({ message: `Welcome email sent to ${email}` });
        }

        // 2. Send Story Email (Today's Story)
        if (action === 'send_story') {
            const { email } = payload;
            if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

            // Get today's story (or latest approved)
            const today = new Date().toISOString().split('T')[0];
            const { data: story } = await supabase
                .from('stories')
                .select('*')
                .eq('date', today)
                .maybeSingle();

            if (!story) {
                return NextResponse.json({ error: `No story found for today (${today})` }, { status: 404 });
            }

            const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;
            await sendEmail({
                to: email,
                subject: `🌙 Today's Bedtime Story: ${story.title} (Test)`,
                html: getStoryEmailHtml(story, unsubscribeUrl),
                tags: [{ name: 'type', value: 'story' }]
            });

            return NextResponse.json({ message: `Story email sent to ${email}` });
        }

        // 3. Resend Approval Email
        if (action === 'resend_approval') {
            // Find latest DRAFT story
            const { data: drafts } = await supabase
                .from('stories')
                .select('*')
                .eq('status', 'DRAFT')
                .order('date', { ascending: false })
                .limit(1);

            const story = drafts?.[0];

            if (!story) {
                return NextResponse.json({ error: 'No pending draft stories found' }, { status: 404 });
            }

            const adminEmail = process.env.ADMIN_EMAIL;
            if (!adminEmail) return NextResponse.json({ error: 'ADMIN_EMAIL not configured' }, { status: 500 });

            const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/review/${story.id}?secret_key=${process.env.NEXT_PUBLIC_ADMIN_SECRET}`;

            await sendEmail({
                to: adminEmail,
                subject: `📖 Review Story: ${story.title} (Resend)`,
                html: getAdminReviewEmailHtml(story.title, reviewUrl, story.date, true),
                tags: [{ name: 'type', value: 'admin_approval' }]
            });

            return NextResponse.json({ message: `Approval email resent for "${story.title}"` });
        }

        // 4. Manual Broadcast (Proxies to specific route logic or implements it here)
        // Since we created api/admin/distribute/route.ts, let's keep logic there and just error if called here, 
        // OR better: Update the Frontend to call the new route.
        // But wait, the Frontend creates a `triggerApi` helper that posts to `/api/admin/trigger`.
        // Let's add the logic here to keep it consistent with the helper.

        if (action === 'distribute') {
            // For consistency/DRY, we'll re-implement the simplified call here, 
            // but actually it is better to have one source of truth.
            // We will redirect/rewrite logic here or just import the handler?
            // Next.js API routes are independent. 
            // Let's just implement the logic here cleanly.

            // Get today's story
            const today = new Date().toISOString().split('T')[0];
            const { data: story } = await supabase.from('stories').select('*').eq('date', today).maybeSingle();

            if (!story) return NextResponse.json({ error: 'No story found for today' }, { status: 404 });
            if (story.status !== 'APPROVED' && story.status !== 'SENT') return NextResponse.json({ error: 'Story must be APPROVED' }, { status: 400 });

            const { data: subscribers } = await supabase.from('subscribers').select('email').eq('is_active', true);
            if (!subscribers?.length) return NextResponse.json({ message: 'No active subscribers' });

            // Sequential send
            let sent = 0;
            const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

            for (const sub of subscribers) {
                const unsub = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
                try {
                    await sendEmail({
                        to: sub.email,
                        subject: `🌙 Today's Bedtime Story: ${story.title}`,
                        html: getStoryEmailHtml(story, unsub),
                        tags: [{ name: 'type', value: 'story' }]
                    });
                    sent++;
                } catch (e) {
                    console.error(`Broadcast fail for ${sub.email}`, e);
                }
                await delay(500);
            }

            await supabase.from('stories').update({ status: 'SENT' }).eq('id', story.id);
            return NextResponse.json({ message: `Broadcasted to ${sent}/${subscribers.length} subscribers` });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Admin Trigger Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
