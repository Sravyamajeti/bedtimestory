import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="text-center mt-12 text-purple-300 text-sm py-8 border-t border-white/10">
            <div className="flex justify-center gap-6 mb-4">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <Link href="/library" className="hover:text-white transition-colors">Story Library</Link>
                <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
            </div>
            <p>Made with ❤️ by MOM</p>
        </footer>
    );
}
