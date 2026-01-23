import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export async function sendEmail({ to, subject, html, tags }: { to: string; subject: string; html: string; tags?: { name: string; value: string }[] }) {
    try {
        const { data, error } = await resend.emails.send({
            from: `${process.env.SENDER_NAME || 'Bedtime Stories'} <${process.env.SENDER_EMAIL || 'onboarding@resend.dev'}>`,
            to,
            subject,
            html,
            tags,
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
