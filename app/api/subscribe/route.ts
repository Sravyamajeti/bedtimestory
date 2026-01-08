import { NextResponse } from 'next/server';
import { supabase, DEMO_MODE } from '@/lib/supabase';
import { mockData } from '@/lib/mockData';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Demo mode: use mock data
        if (DEMO_MODE) {
            const existing = await mockData.findSubscriber(email);
            if (existing) {
                existing.is_active = true;
                return NextResponse.json({ message: '✅ Subscribed successfully! (Demo Mode)' });
            }
            await mockData.createSubscriber(email);
            return NextResponse.json({ message: '✅ Subscribed successfully! (Demo Mode)' }, { status: 201 });
        }

        // Production mode: use Supabase
        const { data: existing } = await supabase
            .from('subscribers')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        const sendWelcomeEmail = async () => {
            try {
                const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;
                await sendEmail({
                    to: email,
                    subject: '🌙 Welcome to Bedtime Stories!',
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #4F46E5;">Welcome to Bedtime Stories! 🌙</h1>
                            <p style="color: #374151; font-size: 16px;">
                                You've successfully subscribed. Get ready for magical tales delivered straight to your inbox every morning at 6 AM.
                            </p>
                            <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0;">✨ What to expect:</h3>
                                <ul style="color: #4B5563;">
                                    <li>Unique, AI-generated stories appropriate for children.</li>
                                    <li>Adventures, fables, and calming bedtime tales.</li>
                                    <li>A perfect way to start or end the day!</li>
                                </ul>
                            </div>
                            <p style="font-size: 12px; color: #6B7280; text-align: center; margin-top: 40px;">
                                If you wish to stop receiving stories, you can <a href="${unsubscribeUrl}" style="color: #6B7280;">unsubscribe here</a>.
                            </p>
                        </div>
                    `
                });
            } catch (e) {
                console.error("Failed to send welcome email:", e);
                // Don't fail the request if email fails, just log it
            }
        };

        if (existing) {
            // Re-activate if exists
            await supabase
                .from('subscribers')
                .update({ is_active: true })
                .eq('id', existing.id);

            await sendWelcomeEmail();
            return NextResponse.json({ message: 'Subscribed successfully' });
        }

        // Create new
        const { error } = await supabase
            .from('subscribers')
            .insert([{ email, is_active: true }]);

        if (error) throw error;

        await sendWelcomeEmail();
        return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
