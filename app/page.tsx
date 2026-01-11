'use client';

import StickyHeader from './components/StickyHeader';
import SubscribeForm from './components/SubscribeForm';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <StickyHeader />

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 md:mb-4 drop-shadow-lg">
            🌙 Bedtime Stories
          </h1>
          <p className="text-lg md:text-2xl text-purple-200 px-4">
            Magical AI-generated human curated tales delivered everyday
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
            <p className="text-base md:text-lg text-purple-200 leading-relaxed mb-8">
              Wake up to a fresh tale in your inbox.
            </p>

            {/* Subscribe Form (Top) */}
            <div className="mb-8 md:mb-12">
              <SubscribeForm />
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left">
              {/* Feature 1 */}
              <div className="bg-white/10 rounded-xl p-5 md:p-6 backdrop-blur hover:bg-white/20 transition-colors">
                <div className="text-3xl md:text-4xl mb-3">🛡️</div>
                <h3 className="text-white font-bold text-lg mb-2">Human Vetted Safe</h3>
                <p className="text-purple-100 text-sm leading-relaxed">
                  Every story is reviewed by a real person before publishing. No scary surprises, just sweet dreams.
                </p>
              </div>

              {/* Feature 2: Merged Benefit */}
              <div className="bg-white/10 rounded-xl p-5 md:p-6 backdrop-blur hover:bg-white/20 transition-colors">
                <div className="text-3xl md:text-4xl mb-3">🧘</div>
                <h3 className="text-white font-bold text-lg mb-2">Cut the Clutter</h3>
                <p className="text-purple-100 text-sm leading-relaxed">
                  No need to spend endless time searching. We curate and deliver a single, perfect story for you every day.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/10 rounded-xl p-5 md:p-6 backdrop-blur hover:bg-white/20 transition-colors">
                <div className="text-3xl md:text-4xl mb-3">💌</div>
                <h3 className="text-white font-bold text-lg mb-2">Daily Delivery</h3>
                <p className="text-purple-100 text-sm leading-relaxed">
                  A fresh, creative story lands in your inbox everyday. Start the day (or end it) with magic.
                </p>
              </div>
            </div>

            {/* Subscribe Form (Bottom) */}
            <div className="mt-12">
              <p className="text-purple-200 mb-4 font-semibold">Ready to join the magic?</p>
              <SubscribeForm />
            </div>

          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
