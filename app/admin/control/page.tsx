'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminControlPage() {
    const [key, setKey] = useState('');
    const [testEmail, setTestEmail] = useState('');
    const [loading, setLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const performAction = async (actionName: string, apiFunc: () => Promise<any>) => {
        setLoading(actionName);
        setMessage(null);
        try {
            const res = await apiFunc();
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Request failed');
            }

            setMessage({ type: 'success', text: data.message || 'Action completed successfully' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Something went wrong' });
        } finally {
            setLoading(null);
        }
    };

    const triggerApi = (action: string, payload: any = {}) => {
        return fetch('/api/admin/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': key.trim(),
            },
            body: JSON.stringify({ action, payload }),
        });
    };

    const handleGenerate = () => performAction('generate', () => fetch('/api/cron/generate'));

    // Explicitly resend approval for the EXISTING draft
    const handleResendApproval = () => performAction('resend_approval', () => triggerApi('resend_approval'));

    const handleWelcome = () => {
        if (!testEmail) return setMessage({ type: 'error', text: 'Enter a test email' });
        performAction('welcome', () => triggerApi('send_welcome', { email: testEmail }));
    };

    const handleStory = () => {
        if (!testEmail) return setMessage({ type: 'error', text: 'Enter a test email' });
        performAction('story', () => triggerApi('send_story', { email: testEmail }));
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-indigo-900">Admin Control Panel</h1>
                    <Link href="/" className="text-indigo-600 hover:text-indigo-800">← Back Home</Link>
                </div>

                {/* Auth Key Input */}
                <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Secret Key</label>
                    <input
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="Enter NEXT_PUBLIC_ADMIN_SECRET"
                        className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">Required for protected actions (Resend Approval, Test Emails).</p>
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`mb-8 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Story Management */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Story Management</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">1. Generate Tomorrow's Story</h3>
                                <p className="text-sm text-gray-500 mb-4">Triggers the AI generation. If draft exists, it will just resend the approval email.</p>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!!loading}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading === 'generate' ? 'Generating...' : 'Trigger Generation'}
                                </button>
                            </div>

                            <hr />

                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">2. Resend Approval Email</h3>
                                <p className="text-sm text-gray-500 mb-4">Explicitly resends the email for the latest PENDING Draft.</p>
                                <button
                                    onClick={handleResendApproval}
                                    disabled={!!loading || !key}
                                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                                >
                                    {loading === 'resend_approval' ? 'Sending...' : 'Resend Email'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Email Testing */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Email Testing</h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Test Email Address</label>
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleWelcome}
                                disabled={!!loading || !key || !testEmail}
                                className="w-full flex justify-center px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                            >
                                {loading === 'welcome' ? 'Sending...' : 'Send Test Welcome Email'}
                            </button>

                            <button
                                onClick={handleStory}
                                disabled={!!loading || !key || !testEmail}
                                className="w-full flex justify-center px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 transition-colors"
                            >
                                {loading === 'story' ? 'Sending...' : "Send Today's Story Email"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* DANGER ZONE: Broadcast */}
                <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-red-100 col-span-1 md:col-span-2">
                    <h2 className="text-xl font-bold mb-6 text-red-800 border-b border-red-100 pb-2">Emergency Broadcast</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-1">Broadcast To All Subscribers</h3>
                            <p className="text-sm text-gray-500">
                                Manually triggers the distribution of <strong>Today's Story</strong> to ALL active subscribers.<br />
                                Use this ONLY if the automated 6 AM schedule failed.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                if (window.confirm("ARE YOU SURE?\n\nThis will send emails to ALL subscribers immediately.")) {
                                    performAction('broadcast', () => triggerApi('distribute'));
                                }
                            }}
                            disabled={!!loading || !key}
                            className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-200"
                        >
                            {loading === 'broadcast' ? 'Broadcasting...' : 'BROADCAST NOW'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
