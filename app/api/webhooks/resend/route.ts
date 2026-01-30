import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        // Step 1: Parse payload with error handling
        let payload;
        try {
            payload = await req.json();
        } catch (parseError) {
            console.error('[Webhook] JSON Parse Error:', parseError);
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        const { type, data } = payload;

        if (!type || !data) {
            console.error('[Webhook] Missing type or data in payload');
            return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 });
        }

        console.log(`[Webhook] Received event: ${type}`);

        // Step 2: Validate environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log('[Webhook] Env check - URL exists:', !!supabaseUrl);
        console.log('[Webhook] Env check - Key exists:', !!supabaseServiceKey);

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[Webhook] Missing Supabase credentials');
            console.error('[Webhook] URL:', supabaseUrl ? 'SET' : 'MISSING');
            console.error('[Webhook] Key:', supabaseServiceKey ? 'SET' : 'MISSING');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Step 3: Create Supabase client with error handling
        let supabaseAdmin;
        try {
            supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
            console.log('[Webhook] Supabase client created successfully');
        } catch (clientError) {
            console.error('[Webhook] Supabase Client Creation Error:', clientError);
            return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
        }

        // Step 4: Extract email type from tags
        // Note: Resend sends tags as an object like { "type": "story_email" }, not as an array
        const tags = data.tags || {};
        const emailType = tags.type || 'unknown';

        console.log(`[Webhook] Email Type: ${emailType}, Tags:`, JSON.stringify(tags));

        // Step 5: Validate event type
        const validEvents = [
            'email.sent', 'email.delivered', 'email.opened',
            'email.failed', 'email.bounced', 'email.clicked', 'email.received'
        ];

        if (!validEvents.includes(type)) {
            console.log(`[Webhook] Event type '${type}' ignored (not in valid events)`);
            return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
        }

        // Step 6: Determine column to increment
        const columnMap: Record<string, string> = {
            'email.sent': 'sent_count',
            'email.delivered': 'delivered_count',
            'email.opened': 'opened_count',
            'email.failed': 'failed_count',
            'email.bounced': 'bounced_count',
            'email.clicked': 'clicked_count',
            'email.received': 'received_count'
        };

        const columnToIncrement = columnMap[type];
        const today = new Date().toISOString().split('T')[0];

        console.log(`[Webhook] Will increment '${columnToIncrement}' for date ${today}, email_type ${emailType}`);

        // Step 7: Check if row exists
        const { data: existingData, error: selectError } = await supabaseAdmin
            .from('email_metrics')
            .select('*')
            .eq('date', today)
            .eq('email_type', emailType)
            .maybeSingle();

        if (selectError) {
            console.error('[Webhook] Select Error:', JSON.stringify(selectError, null, 2));
            return NextResponse.json({
                error: 'Database query error',
                details: selectError.message
            }, { status: 500 });
        }

        // Step 8: Update or Insert
        if (existingData) {
            console.log('[Webhook] Existing record found, updating...');
            const updateData: any = {};
            updateData[columnToIncrement] = (existingData[columnToIncrement] || 0) + 1;

            const { error: updateError } = await supabaseAdmin
                .from('email_metrics')
                .update(updateData)
                .eq('date', today)
                .eq('email_type', emailType);

            if (updateError) {
                console.error('[Webhook] Update Error:', JSON.stringify(updateError, null, 2));
                return NextResponse.json({
                    error: 'Database update error',
                    details: updateError.message
                }, { status: 500 });
            }
            console.log('[Webhook] Update Successful');
        } else {
            console.log('[Webhook] No existing record, inserting new...');
            const insertData: any = {
                date: today,
                email_type: emailType,
                sent_count: 0,
                delivered_count: 0,
                opened_count: 0,
                unsubscribe_count: 0,
                failed_count: 0,
                bounced_count: 0,
                clicked_count: 0,
                received_count: 0,
            };
            insertData[columnToIncrement] = 1;

            const { error: insertError } = await supabaseAdmin
                .from('email_metrics')
                .insert(insertData);

            if (insertError) {
                console.error('[Webhook] Insert Error:', JSON.stringify(insertError, null, 2));
                return NextResponse.json({
                    error: 'Database insert error',
                    details: insertError.message
                }, { status: 500 });
            }
            console.log('[Webhook] Insert Successful');
        }

        return NextResponse.json({ message: 'Metrics updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('[Webhook] Unexpected Error:', error);
        console.error('[Webhook] Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
