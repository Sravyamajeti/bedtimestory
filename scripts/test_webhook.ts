
const events = [
    {
        type: 'email.sent',
        payload: {
            type: 'email.sent',
            data: {
                created_at: new Date().toISOString(),
                email_id: 're_123',
                to: ['test@example.com'],
                subject: 'Test Email',
                tags: [{ name: 'type', value: 'story' }]
            }
        }
    },
    {
        type: 'email.delivered',
        payload: {
            type: 'email.delivered',
            data: {
                created_at: new Date().toISOString(),
                email_id: 're_123',
                to: ['test@example.com'],
                subject: 'Test Email',
                tags: [{ name: 'type', value: 'story' }]
            }
        }
    },
    {
        type: 'email.opened',
        payload: {
            type: 'email.opened',
            data: {
                created_at: new Date().toISOString(),
                email_id: 're_123',
                to: ['test@example.com'],
                subject: 'Test Email',
                tags: [{ name: 'type', value: 'story' }]
            }
        }
    },
    {
        type: 'email.clicked',
        payload: {
            type: 'email.clicked',
            data: {
                created_at: new Date().toISOString(),
                email_id: 're_123',
                tags: [{ name: 'type', value: 'story' }]
            }
        }
    },
    {
        type: 'email.bounced',
        payload: {
            type: 'email.bounced',
            data: {
                created_at: new Date().toISOString(),
                email_id: 're_123',
                tags: [{ name: 'type', value: 'story' }]
            }
        }
    },
    {
        type: 'email.failed',
        payload: {
            type: 'email.failed',
            data: {
                created_at: new Date().toISOString(),
                email_id: 're_123',
                tags: [{ name: 'type', value: 'story' }]
            }
        }
    },
    {
        type: 'email.received',
        payload: {
            type: 'email.received',
            data: {
                created_at: new Date().toISOString(),
                email_id: 're_123',
                // Inbound emails might not have tags, but for testing we can add them or rely on default logic
                tags: []
            }
        }
    }
];

async function runTest() {
    const url = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/resend';
    console.log(`Testing Webhook at ${url}...`);

    for (const event of events) {
        console.log(`Sending ${event.type}...`);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event.payload)
            });
            console.log(`Response: ${res.status} ${res.statusText}`);
            if (!res.ok) {
                const text = await res.text();
                console.log('Error body:', text);
            }
        } catch (err) {
            console.error('Failed to send request:', err);
        }
    }

    console.log('Done. Check your database or local logs.');
}

runTest();
