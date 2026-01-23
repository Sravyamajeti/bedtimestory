import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { type, data } = payload;

        // We typically expect data.tags to contain our metadata
        // tags: [ { name: 'type', value: 'story' } ]
        const tags = data.tags || [];
        const emailTypeTag = tags.find((t: any) => t.name === 'type');
        const emailType = emailTypeTag ? emailTypeTag.value : 'unknown'; // specific fallback logic can be added

        // We only care about specific events
        const validEvents = [
            'email.sent', 'email.delivered', 'email.opened',
            'email.failed', 'email.bounced', 'email.clicked', 'email.received'
        ];
        if (!validEvents.includes(type)) {
            return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
        }

        const today = new Date().toISOString().split('T')[0];

        // Determine column to increment
        let columnToIncrement = '';
        if (type === 'email.sent') columnToIncrement = 'sent_count';
        if (type === 'email.delivered') columnToIncrement = 'delivered_count';
        if (type === 'email.opened') columnToIncrement = 'opened_count';
        if (type === 'email.failed') columnToIncrement = 'failed_count';
        if (type === 'email.bounced') columnToIncrement = 'bounced_count';
        if (type === 'email.clicked') columnToIncrement = 'clicked_count';
        if (type === 'email.received') columnToIncrement = 'received_count';

        // We can't easily doing an UPSERT with increment in one simple standard SQL command via simple Supabase JS client 
        // without a stored procedure or manual read-modify-write, 
        // BUT we can use an RPC or just try to insert ignore and then update.
        // simpler approach: READ currently, then Update/Insert. 
        // Better concurrent approach: RPC. 
        // Let's stick to standard Supabase upsert for simplicity first, or RPC if we want atomicity.
        // Given the scale, read-modify-write might have race conditions.
        // A raw SQL query or RPC is best for atomic increments.
        // Let's try to use an RPC later if needed, but for now, simple read/write.
        // Actually, we can assume low concurrency for a personal project.

        // Check if row exists
        const { data: existingData, error: selectError } = await supabase
            .from('email_metrics')
            .select('*')
            .eq('date', today)
            .eq('email_type', emailType)
            .maybeSingle();

        if (selectError) throw selectError;

        if (existingData) {
            // Update
            const updateData: any = {};
            updateData[columnToIncrement] = existingData[columnToIncrement] + 1;

            const { error: updateError } = await supabase
                .from('email_metrics')
                .update(updateData)
                .eq('date', today)
                .eq('email_type', emailType);

            if (updateError) throw updateError;
        } else {
            // Insert
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

            const { error: insertError } = await supabase
                .from('email_metrics')
                .insert(insertData);

            if (insertError) throw insertError;
        }

        return NextResponse.json({ message: 'Metrics updated' }, { status: 200 });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
