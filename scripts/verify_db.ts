
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Use service role if available for better access, or anon if RLS allows
// Note: In scripts using `supabase-js`, we usually need service role to bypass RLS if not authenticated as user.
// Let's assume the user has SERVICE_ROLE_KEY in .env.local or we use anon key and hope RLS allows reading (we added public read policy?).
// Actually, I added "Allow read access to authenticated users" and "Allow service role full access".
// So anon key might fail if not authenticated.
// Let's check keys available.
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase
        .from('email_metrics')
        .select('*');

    if (error) {
        console.error('Error fetching metrics:', error);
        return;
    }

    console.log('Metrics found:', data);
}

main();
