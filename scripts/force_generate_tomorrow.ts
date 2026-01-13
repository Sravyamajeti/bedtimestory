
import { config } from 'dotenv';
config({ path: '.env.local' });

// We need to use dynamic imports for lib modules
async function main() {
    const { supabase } = await import('../lib/supabase');
    const { generateStory } = await import('../lib/ai');
    const { sendEmail } = await import('../lib/email');
    const { getAdminReviewEmailHtml } = await import('../lib/email-templates');

    console.log("🚀 Starting Force Generation for Tomorrow...");

    // 1. Calculate Target Date (Jan 13 if today is Jan 12 PST / Jan 13 UTC)
    // We want to force it to be "tomorrow relative to local time" or just explicitly the next open slot.
    // Since we cleared Jan 13 (by moving the old one to Jan 12), let's target Jan 13.
    const targetDateStr = '2026-01-13';
    console.log(`Target Date: ${targetDateStr}`);

    // 2. Check if exists
    const { data: existing } = await supabase
        .from('stories')
        .select('*')
        .eq('date', targetDateStr)
        .maybeSingle();

    if (existing) {
        console.log(`⚠️ Story already exists for ${targetDateStr}: ${existing.title}`);
        return;
    }

    // 3. Generate
    console.log("🧠 Generating story via AI...");
    const prompt = "Write a creative bedtime story based on the themes provided in the system instruction. Length: approx 400 words.";
    const aiResponse = await generateStory(prompt);

    console.log(`✨ Generated: "${aiResponse.title}"`);

    // 4. Insert
    const { data: story, error } = await supabase
        .from('stories')
        .insert([{
            date: targetDateStr,
            status: 'DRAFT',
            title: aiResponse.title,
            summary_bullets: aiResponse.summary_bullets,
            content: aiResponse.content,
            tags: aiResponse.tags || [],
        }])
        .select()
        .single();

    if (error) {
        console.error("❌ Database Insert Error:", error);
        return;
    }

    console.log(`✅ Saved to DB (ID: ${story.id})`);

    // 5. Send Email
    const adminEmail = process.env.ADMIN_EMAIL;
    // Construct review URL manually since we are in script
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const reviewUrl = `${appUrl}/admin/review/${story.id}?secret_key=${process.env.NEXT_PUBLIC_ADMIN_SECRET}`;

    console.log(`📧 Sending approval email to ${adminEmail}...`);

    await sendEmail({
        to: adminEmail!,
        subject: `📖 Review Tomorrow's Story: ${aiResponse.title}`,
        html: getAdminReviewEmailHtml(aiResponse.title, reviewUrl, targetDateStr, false),
    });

    console.log("✅ Email sent!");
}

main().catch(console.error);
