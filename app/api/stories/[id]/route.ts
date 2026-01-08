import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { data: story, error } = await supabase
            .from('stories')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !story) {
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        return NextResponse.json(story);
    } catch (error) {
        console.error('Get story error:', error);
        return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { data: story, error } = await supabase
            .from('stories')
            .update({
                title: body.title,
                summary_bullets: body.summary_bullets,
                content: body.content,
                status: body.status,
            })
            .eq('id', id)
            .select()
            .single();

        if (error || !story) {
            return NextResponse.json({ error: 'Story not found or update failed' }, { status: 404 });
        }

        return NextResponse.json(story);
    } catch (error) {
        console.error('Update story error:', error);
        return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
    }
}
