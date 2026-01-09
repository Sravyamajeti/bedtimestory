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
        {/* Header */}
        <header className="text-center mb-8 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 md:mb-4 drop-shadow-lg">
            🌙 Bedtime Stories
          </h1>
          <p className="text-lg md:text-2xl text-purple-200 px-4">
            Magical AI-generated tales delivered every morning
          </p>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-12 mb-8 md:mb-12 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              Sweet Dreams Start Here ✨
            </h2>
            <p className="text-base md:text-xl text-purple-100 leading-relaxed mb-4 hidden md:block">
              Every night, our AI creates a brand new, calming bedtime story.
            </p>
            <p className="text-base md:text-lg text-purple-200 leading-relaxed mb-6">
              Wake up to a fresh tale in your inbox at 6:00 AM.
            </p>

            {/* Read Today's Story Link (Moved Up) */}
            <div className="mb-8">
              <Link
                href="/story"
                className="inline-block w-full md:w-auto px-8 py-4 bg-white/20 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30"
              >
                📖 Read Today&apos;s Story
              </Link>
            </div>

            {/* Subscribe Form (Moved Up) */}
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto mb-8">
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
                  {status === 'loading' ? 'Values...' : 'Subscribe'}
                </button>
              </div>
              {message && (
                <p className={`mt-4 text-center font-medium ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>

          {/* Features (Moved Down) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white/10 rounded-xl p-4 md:p-6 text-center backdrop-blur flex items-center md:block">
              <div className="text-3xl md:text-4xl mr-4 md:mr-0 md:mb-3">📚</div>
              <div className="text-left md:text-center">
                <h3 className="text-white font-semibold mb-1 md:mb-2">Fresh Daily</h3>
                <p className="text-purple-200 text-sm">New story every single day</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 md:p-6 text-center backdrop-blur flex items-center md:block">
              <div className="text-3xl md:text-4xl mr-4 md:mr-0 md:mb-3">🛡️</div>
              <div className="text-left md:text-center">
                <h3 className="text-white font-semibold mb-1 md:mb-2">100% Safe</h3>
                <p className="text-purple-200 text-sm">No scary content</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 md:p-6 text-center backdrop-blur flex items-center md:block">
              <div className="text-3xl md:text-4xl mr-4 md:mr-0 md:mb-3">✉️</div>
              <div className="text-left md:text-center">
                <h3 className="text-white font-semibold mb-1 md:mb-2">Email Delivery</h3>
                <p className="text-purple-200 text-sm">Arrives at 6 AM daily</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-purple-300 text-sm">
          <p>Made with ❤️ by MOM</p>
        </footer>
      </div>
    </div>
  );
}
