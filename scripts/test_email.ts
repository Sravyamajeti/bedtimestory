import { config } from 'dotenv';
config({ path: '.env.local' });
// We need to import sendEmail but it is a named export.
// We'll use dynamic import in the function.

async function main() {
    const { sendEmail } = await import('../lib/email');
    console.log("Sending test email to ADMIN_EMAIL...");

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.error("ADMIN_EMAIL is missing");
        return;
    }

    try {
        await sendEmail({
            to: adminEmail,
            subject: 'Test Email from Debugger',
            html: '<p>This is a test email to verify your configuration.</p>'
        });
        console.log("Test email sent successfully.");
    } catch (e) {
        console.error("Failed to send test email:", e);
    }
}

main().catch(console.error);
