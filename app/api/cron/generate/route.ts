import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateStory } from '@/lib/ai';
import { sendEmail } from '@/lib/email';
import { getAdminReviewEmailHtml } from '@/lib/email-templates';

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

export async function GET() {
    try {
        // Calculate target date (robust against midnight crossing)
        // If running at 20:00 UTC (intended), it's "today" -> target "tomorrow".
        // If running at 00:41 UTC (delayed), it's already "tomorrow" -> target "today" (which is same date).
        const now = new Date();
        const hour = now.getUTCHours();
        const targetDate = new Date(now);

        // If it's effectively the "previous day's night" (late UTC), add 1 day.
        // If it's "early morning" (post-midnight UTC), it's already the target date.
        // Threshold: 12:00 UTC. (Cron is 20:00).
        if (hour >= 12) {
            targetDate.setDate(targetDate.getDate() + 1);
        }
        // else: leave as is (targetDate is already the correct 'next' day)

        const dateStr = targetDate.toISOString().split('T')[0];

        // Check if story already exists for tomorrow
        const { data: existing } = await supabase
            .from('stories')
            .select('*')
            .eq('date', dateStr)
            .maybeSingle();

        if (existing) {
            if (existing.status === 'DRAFT') {
                console.log('Story exists but is in DRAFT. Resending email...');
                const adminEmail = process.env.ADMIN_EMAIL;
                const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/review/${existing.id}?secret_key=${process.env.NEXT_PUBLIC_ADMIN_SECRET}`;

                await sendEmail({
                    to: adminEmail!,
                    subject: `📖 Review Tomorrow's Story: ${existing.title}`,
                    html: getAdminReviewEmailHtml(existing.title, reviewUrl, dateStr, true),
                });
                return NextResponse.json({ message: 'Resent email for existing draft', storyId: existing.id });
            }
            return NextResponse.json({ message: 'Story already exists for tomorrow', storyId: existing.id });
        }

        // Generate story via AI
        // We pass a simple instruction here because the System Prompt in lib/ai.ts now handles the random category selection.
        const prompt = "Write a creative bedtime story based on the themes provided in the system instruction. Length: approx 400 words.";
        const aiResponse = await generateStory(prompt);

        // Save to DB
        const { data: story, error } = await supabase
            .from('stories')
            .insert([{
                date: dateStr,
                status: 'DRAFT',
                title: aiResponse.title,
                summary_bullets: aiResponse.summary_bullets,
                content: aiResponse.content,
                tags: aiResponse.tags || [], // New field
                slug: aiResponse.slug,
            }])
            .select()
            .single();

        if (error || !story) throw error || new Error('Failed to insert story');

        // Send email to Admin
        const adminEmail = process.env.ADMIN_EMAIL;
        const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/review/${story.id}?secret_key=${process.env.NEXT_PUBLIC_ADMIN_SECRET}`;

        await sendEmail({
            to: adminEmail!,
            subject: `📖 Review Tomorrow's Story: ${aiResponse.title}`,
            html: getAdminReviewEmailHtml(aiResponse.title, reviewUrl, dateStr, false),
        });

        return NextResponse.json({ message: 'Story generated successfully', storyId: story.id });
    } catch (error) {
        console.error('Generate error:', error);
        return NextResponse.json({
            error: 'Failed to generate story',
            details: error instanceof Error ? error.message : JSON.stringify(error, null, 2)
        }, { status: 500 });
    }
}
