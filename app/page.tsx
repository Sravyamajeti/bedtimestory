'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
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
        setMessage('🎉 Subscribed! Check your inbox at 6 AM for your first story.');
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🌙 Bedtime Stories
          </h1>
          <p className="text-2xl text-purple-200">
            Magical AI-generated tales delivered every morning
          </p>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-12 mb-12 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Sweet Dreams Start Here ✨
            </h2>
            <p className="text-xl text-purple-100 leading-relaxed mb-4">
              Every night, our AI creates a brand new, calming bedtime story.
            </p>
            <p className="text-lg text-purple-200 leading-relaxed">
              Wake up to a fresh tale in your inbox at 6:00 AM. Simple, safe, and magical.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 rounded-xl p-6 text-center backdrop-blur">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-white font-semibold mb-2">Fresh Daily</h3>
              <p className="text-purple-200 text-sm">New story every single day</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center backdrop-blur">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-white font-semibold mb-2">100% Safe</h3>
              <p className="text-purple-200 text-sm">No scary content, child-friendly</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center backdrop-blur">
              <div className="text-4xl mb-3">✉️</div>
              <h3 className="text-white font-semibold mb-2">Email Delivery</h3>
              <p className="text-purple-200 text-sm">Arrives at 6 AM daily</p>
            </div>
          </div>

          {/* Subscribe Form */}
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-6 py-4 rounded-xl bg-white text-gray-900 text-lg font-medium placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-lg"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe for Free'}
              </button>
            </div>
            {message && (
              <p className={`mt-4 text-center font-medium ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                {message}
              </p>
            )}
          </form>
        </div>

        {/* Read Today's Story Link */}
        <div className="text-center">
          <Link
            href="/story"
            className="inline-block px-8 py-4 bg-white/20 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30"
          >
            📖 Read Today&apos;s Story
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-purple-300 text-sm">
          <p>Made with ❤️ by MOM</p>
        </footer>
      </div>
    </div>
  );
}
