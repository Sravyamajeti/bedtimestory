"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Metric {
    date: string;
    email_type: string;
    sent_count: number;
    delivered_count: number;
    opened_count: number;
    unsubscribe_count: number;
    failed_count: number;
    bounced_count: number;
    clicked_count: number;
    received_count: number;
}

export default function MetricsPage() {
    const router = useRouter();
    const [metrics, setMetrics] = useState<Metric[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/admin/login'); // Redirect if not logged in
                return;
            }

            const { data, error } = await supabase
                .from('email_metrics')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching metrics:', error);
            } else {
                setMetrics(data);
            }
            setLoading(false);
        }
        init();
    }, [router]);

    if (loading) {
        return <div className="p-8">Loading metrics...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Email Metrics</h1>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicked</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bounced</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unsubscribed</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {metrics?.map((metric) => (
                                    <tr key={`${metric.date}-${metric.email_type}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${metric.email_type === 'story' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {metric.email_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.sent_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.delivered_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.opened_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.clicked_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.bounced_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.failed_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.received_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.unsubscribe_count}</td>
                                    </tr>
                                ))}
                                {(!metrics || metrics.length === 0) && (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-4 text-center text-gray-500">No metrics found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
