import { NextResponse } from 'next/server';
import { supabase, DEMO_MODE } from '@/lib/supabase';
import { mockData } from '@/lib/mockData';

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

        if (existing) {
            // Re-activate if exists
            await supabase
                .from('subscribers')
                .update({ is_active: true })
                .eq('id', existing.id);
            return NextResponse.json({ message: 'Subscribed successfully' });
        }

        // Create new
        const { error } = await supabase
            .from('subscribers')
            .insert([{ email, is_active: true }]);

        if (error) throw error;

        return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
