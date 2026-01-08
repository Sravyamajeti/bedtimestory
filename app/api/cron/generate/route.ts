import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateStory } from '@/lib/ai';
import { sendEmail } from '@/lib/email';

export async function GET() {
    try {
        // Calculate tomorrow's date (YYYY-MM-DD)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        // Check if story already exists for tomorrow
        const { data: existing } = await supabase
            .from('stories')
            .select('id')
            .eq('date', dateStr)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ message: 'Story already exists for tomorrow', storyId: existing.id });
        }

        // Generate story via AI
        const prompt = "Write a story about a random creative theme (e.g. Nature, Space, Magic, Friendship). Length: 400 words.";
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
            }])
            .select()
            .single();

        if (error || !story) throw error || new Error('Failed to insert story');

        // Send email to Admin
        const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
        const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/review/${story.id}?secret_key=${process.env.NEXT_PUBLIC_ADMIN_SECRET}`;

        await sendEmail({
            to: adminEmail!,
            subject: `📖 Review Tomorrow's Story: ${aiResponse.title}`,
            html: `
        <h2>New Story Generated for ${dateStr}</h2>
        <h3>${aiResponse.title}</h3>
        <p>Click the link below to review and approve:</p>
        <a href="${reviewUrl}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Review Story</a>
      `,
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
