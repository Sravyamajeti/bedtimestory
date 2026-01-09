import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    // Get today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Find today's story
    const { data: story } = await supabase
      .from('stories')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (!story) {
      // No story for today - alert admin
      await sendEmail({
        to: process.env.ADMIN_EMAIL!,
        subject: '⚠️ No Story for Today',
        html: `<p>No story was found for ${today}. Please check the system.</p>`,
      });
      return NextResponse.json({ error: 'No story found for today' }, { status: 404 });
    }

    if (story.status !== 'APPROVED') {
      // Story not approved - alert admin
      await sendEmail({
        to: process.env.ADMIN_EMAIL!,
        subject: '⚠️ Story Not Approved',
        html: `<p>The story for ${today} is still in ${story.status} status. It has not been sent to subscribers.</p>`,
      });
      return NextResponse.json({ error: 'Story not approved' }, { status: 400 });
    }

    // Get all active subscribers
    const { data: subscribers } = await supabase
      .from('subscribers')
      .select('email')
      .eq('is_active', true);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No active subscribers' });
    }

    // Send to all subscribers
    const emailPromises = subscribers.map((subscriber) => {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

      return sendEmail({
        to: subscriber.email,
        subject: `🌙 Today's Bedtime Story: ${story.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">${story.title}</h1>
            
            <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">📚 Story Summary:</h3>
              <ul>
                ${story.summary_bullets.map((bullet: string) => `<li>${bullet}</li>`).join('')}
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
        `,
      });
    });

    await Promise.all(emailPromises);

    // Update story status to SENT
    await supabase
      .from('stories')
      .update({ status: 'SENT' })
      .eq('id', story.id);

    return NextResponse.json({
      message: 'Story distributed successfully',
      subscriberCount: subscribers.length
    });
  } catch (error) {
    console.error('Distribute error:', error);
    return NextResponse.json({ error: 'Failed to distribute story' }, { status: 500 });
  }
}
