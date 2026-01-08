import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we're in demo mode (no Supabase credentials configured)
export const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Story {
    id: string;
    date: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT';
    title: string;
    summary_bullets: string[];
    content: string;
    created_at: string;
}

export interface Subscriber {
    id: string;
    email: string;
    is_active: boolean;
    created_at: string;
}
