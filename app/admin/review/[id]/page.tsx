'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Story {
    id: string;
    title: string;
    summary_bullets: string[];
    content: string;
    status: string;
    date: string;
}

export default function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const secretKey = searchParams.get('secret_key');

    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check secret key
        if (secretKey !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
            setError('Unauthorized: Invalid secret key');
            setLoading(false);
            return;
        }

        // Fetch story
        fetch(`/api/stories/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setStory(data);
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load story');
                setLoading(false);
            });
    }, [id, secretKey]);

    const handleApprove = async () => {
        if (!story) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/stories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...story,
                    status: 'APPROVED',
                }),
            });

            if (res.ok) {
                alert('✅ Story approved! It will be sent to subscribers at 6 AM.');
                router.push('/');
            } else {
                alert('Failed to approve story');
            }
        } catch (error) {
            alert('Error approving story');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-2xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!story) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            📝 Review Story
                        </h1>
                        <p className="text-gray-600">
                            Date: {story.date} | Status: <span className="font-semibold">{story.status}</span>
                        </p>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={story.title}
                            onChange={(e) => setStory({ ...story, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Summary Bullets */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Summary Bullets (3 items)
                        </label>
                        {story.summary_bullets.map((bullet, index) => (
                            <input
                                key={index}
                                type="text"
                                value={bullet}
                                onChange={(e) => {
                                    const newBullets = [...story.summary_bullets];
                                    newBullets[index] = e.target.value;
                                    setStory({ ...story, summary_bullets: newBullets });
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder={`Bullet ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Story Content (HTML)
                        </label>
                        <textarea
                            value={story.content}
                            onChange={(e) => setStory({ ...story, content: e.target.value })}
                            rows={12}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Preview */}
                    <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
                        <h2 className="text-2xl font-bold text-purple-900 mb-4">{story.title}</h2>
                        <div className="mb-4">
                            <ul className="space-y-1">
                                {story.summary_bullets.map((bullet, index) => (
                                    <li key={index} className="text-gray-700">• {bullet}</li>
                                ))}
                            </ul>
                        </div>
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: story.content }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleApprove}
                            disabled={saving || story.status === 'APPROVED'}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Approving...' : story.status === 'APPROVED' ? '✅ Already Approved' : '✅ Approve & Schedule'}
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
