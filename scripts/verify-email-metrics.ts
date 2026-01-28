
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import AWS from 'aws-sdk'; // Not needed, but preventing typescript check errs if environment is messy

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyDirectInsert() {
    console.log('--- Verifying Direct Insert ---');
    const date = new Date().toISOString().split('T')[0];
    const emailType = 'test_metric_direct';

    // Clean up potential previous failed runs
    await supabase.from('email_metrics').delete().eq('email_type', emailType);

    const { error: insertError } = await supabase.from('email_metrics').insert({
        date,
        email_type: emailType,
        sent_count: 1
    });

    if (insertError) {
        console.error('Direct Insert Failed:', insertError);
        return false;
    }

    console.log('Direct Insert Successful');

    // Clean up
    await supabase.from('email_metrics').delete().eq('email_type', emailType);
    return true;
}

async function verifyWebhookLogic() {
    console.log('\n--- Verifying Webhook Logic (via fetch) ---');
    // Need to have the server running for this, OR we can mock the handler. 
    // Since I can't guarantee server is running, I'll simulate the HANDLER logic directly 
    // by importing it? No, Next.js routes are hard to import directly as functions due to ecosystem.
    // I will assume for now we just want to test if the DB permissions are good (done above)
    // But to test the route logic without running server, I'd need to mock Request objects which is flaky.
    // Instead, I will assume the server MIGHT be running on localhost:3000, if not I'll skip this part.

    try {
        const res = await fetch('http://localhost:3000/api/webhooks/resend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'email.sent',
                data: {
                    tags: [{ name: 'type', value: 'test_webhook_simulation' }]
                }
            })
        });

        if (res.status === 200) {
            console.log('Webhook endpoint responded with 200 OK');
            // Check DB
            const { data } = await supabase
                .from('email_metrics')
                .select('*')
                .eq('email_type', 'test_webhook_simulation')
                .maybeSingle();

            if (data && data.sent_count >= 1) {
                console.log('Webhook Logic Verified: Data found in DB');
                // Cleanup
                await supabase.from('email_metrics').delete().eq('email_type', 'test_webhook_simulation');
                return true;
            } else {
                console.error('Webhook Logic Failed: Data NOT found in DB');
                return false;
            }
        } else {
            console.log('Webhook endpoint did not respond with 200. Is the server running?');
            console.log('Status:', res.status);
            return false;
        }

    } catch (e) {
        console.log('Could not connect to localhost:3000. Skipping webhook integration test.');
        return null;
    }
}

async function main() {
    const directSuccess = await verifyDirectInsert();
    if (directSuccess) {
        await verifyWebhookLogic();
    }
}

main();
