import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscriber from '@/models/Subscriber';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return new NextResponse('Email is required', { status: 400 });
    }

    try {
        await dbConnect();
        await Subscriber.findOneAndUpdate({ email }, { is_active: false });

        return new NextResponse(`
      <html>
        <head><title>Unsubscribed</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>You have been unsubscribed.</h1>
          <p>You will no longer receive bedtime stories. Sleep tight!</p>
        </body>
      </html>
    `, {
            headers: { 'Content-Type': 'text/html' },
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
