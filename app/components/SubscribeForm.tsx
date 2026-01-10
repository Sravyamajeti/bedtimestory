'use client';

import { useState } from 'react';

export default function SubscribeForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('🎉 Subscribed! Check your inbox (and spam folder). Please mark us as "not spam" to ensure delivery!');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to subscribe. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubscribe} className="max-w-md mx-auto mb-8 w-full">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-6 py-4 rounded-xl bg-white text-gray-900 text-lg font-medium placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-lg w-full"
                />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 whitespace-nowrap"
                >
                    {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
            </div>
            {message && (
                <p className={`mt-4 text-center font-medium ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                    {message}
                </p>
            )}
        </form>
    );
}
