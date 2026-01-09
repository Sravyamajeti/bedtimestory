// Mock data store (in-memory)
let mockStories: any[] = [
    {
        _id: 'mock-story-1',
        date: new Date().toISOString().split('T')[0], // Today's date
        status: 'SENT',
        title: 'Luna and the Starlight Garden',
        summary_bullets: [
            '🌟 Luna discovers a magical garden that only appears at night',
            '🦋 She meets friendly fireflies who guide her through the glowing flowers',
            '💫 Luna learns that kindness makes the stars shine brighter'
        ],
        content: `
      <p>Once upon a time, in a cozy little house at the edge of a quiet town, lived a curious girl named Luna. Every night, she would gaze out her window at the twinkling stars and wonder what secrets they held.</p>
      
      <p>One evening, as the moon rose high in the sky, Luna noticed something magical. Her backyard, which looked ordinary during the day, was now glowing with soft, colorful lights. Flowers she had never seen before were blooming, their petals shimmering like tiny rainbows.</p>
      
      <p>"What a beautiful garden!" Luna whispered, stepping outside in her pajamas and slippers.</p>
      
      <p>As she walked through the garden, tiny fireflies appeared, dancing around her in circles. "Welcome, Luna!" they chimed in tiny, musical voices. "This is the Starlight Garden. It only appears for children with kind hearts."</p>
      
      <p>Luna smiled and followed the fireflies deeper into the garden. They showed her flowers that giggled when tickled, trees that hummed gentle lullabies, and a pond where the water sparkled like liquid moonlight.</p>
      
      <p>"Why is everything so magical here?" Luna asked.</p>
      
      <p>The brightest firefly landed on her hand. "Because this garden grows from kindness and wonder. Every time someone does something kind, a new star is born in the sky, and a new flower blooms here."</p>
      
      <p>Luna thought about all the kind things she had done—helping her little brother, sharing her toys, and saying thank you. She felt warm and happy inside.</p>
      
      <p>As the night grew late, the fireflies guided Luna back to her house. "Will I see you again?" she asked.</p>
      
      <p>"Always," they replied. "Just look at the stars and remember to be kind. We'll be here, waiting for you."</p>
      
      <p>Luna climbed back into bed, her heart full of joy. She looked out the window one last time and saw the stars twinkling extra bright, as if they were winking at her. With a smile on her face, she drifted off to sleep, dreaming of the magical Starlight Garden.</p>
      
      <p>The End. Sweet dreams! 🌙</p>
    `,
        created_at: new Date(),
    }
];

let mockSubscribers: any[] = [];

export const mockData = {
    // Story operations
    async findStory(query: any) {
        if (query.date) {
            return mockStories.find(s => s.date === query.date &&
                (query.status?.$in ? query.status.$in.includes(s.status) : true));
        }
        return mockStories[0];
    },

    async getStories() {
        return mockStories;
    },

    async findStoryById(id: string) {
        return mockStories.find(s => s._id === id);
    },

    async createStory(data: any) {
        const newStory = {
            _id: `mock-story-${Date.now()}`,
            ...data,
            created_at: new Date(),
        };
        mockStories.push(newStory);
        return newStory;
    },

    async updateStory(id: string, updates: any) {
        const story = mockStories.find(s => s._id === id);
        if (story) {
            Object.assign(story, updates);
        }
        return story;
    },

    // Subscriber operations
    async findSubscriber(email: string) {
        return mockSubscribers.find(s => s.email === email);
    },

    async createSubscriber(email: string) {
        const newSub = {
            _id: `mock-sub-${Date.now()}`,
            email,
            is_active: true,
            created_at: new Date(),
        };
        mockSubscribers.push(newSub);
        return newSub;
    },

    async updateSubscriber(email: string, updates: any) {
        const sub = mockSubscribers.find(s => s.email === email);
        if (sub) {
            Object.assign(sub, updates);
        }
        return sub;
    },

    async getActiveSubscribers() {
        return mockSubscribers.filter(s => s.is_active);
    },

    // Mock AI generation
    async generateStory() {
        return {
            title: 'The Moonlight Adventure',
            summary_bullets: [
                '🌙 A brave little rabbit explores the moonlit forest',
                '✨ She discovers magical creatures who need her help',
                '💝 Friendship and courage save the day'
            ],
            content: '<p>A wonderful bedtime story about friendship and adventure...</p>'
        };
    },

    // Mock email sending
    async sendEmail(options: any) {
        console.log('📧 [MOCK] Email sent to:', options.to);
        console.log('📧 [MOCK] Subject:', options.subject);
        return { messageId: `mock-${Date.now()}` };
    }
};
