import Link from 'next/link';

export default function StickyHeader() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-indigo-900/80 backdrop-blur-md border-b border-white/10 shadow-lg">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="text-white font-bold text-lg md:text-xl shadow-sm hover:text-purple-200 transition-colors">
                    🌙 Bedtime Stories
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        href="/library"
                        className="text-white/80 hover:text-white font-medium text-sm md:text-base transition-colors"
                    >
                        Library
                    </Link>
                    <Link
                        href="/story"
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm md:text-base font-bold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
                    >
                        Read Story
                    </Link>
                </div>
            </div>
        </div>
    );
}
