import React from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQProps {
    items: FAQItem[];
    title?: string;
}

export default function FAQ({ items, title = "Frequently Asked Questions" }: FAQProps) {
    // Generate Schema.org Structured Data
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': items.map(item => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': item.answer
            }
        }))
    };

    return (
        <section className="width-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto mb-16 text-white">
                <h2 className="text-3xl font-bold text-center mb-8 drop-shadow-md">{title}</h2>
                <div className="space-y-6">
                    {items.map((item, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold mb-2">{item.question}</h3>
                            <div className="text-purple-100" dangerouslySetInnerHTML={{ __html: item.answer }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
