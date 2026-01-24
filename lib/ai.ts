import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const STORY_CATEGORIES = [
    'Nature', 'Animals', 'Space', 'Oceans', 'Beach', 'Vacations', 'Kids',
    'Weather', 'Dinosaurs', 'Magic', 'Dragons', 'Unicorns', 'Mermaids', 'Castles',
    'Knights', 'Princess', 'Fairies', 'Gnomes', 'Lilliputs', 'Giants', 'Superpowers',
    'Vehicles', 'Inventions', 'Time Travel', 'Expeditions', 'Family & Home', 'Playgrounds',
    'Classrooms', 'Sports', 'Firefighters', 'Doctors', 'Helpful Neighbors', 'Toys',
    'Bizarre Physics', 'Arts', 'Colors', 'Dreams', 'Nighttime', 'Treehouses',
    'Secret Hideouts', 'Exploration', 'Friendship', 'Plumber', 'Electrician', 'Baker', 'Goldsmith',
    'Teacher', 'Author', 'Music', 'Farmer', 'Tour Guide', 'Carpenter', 'Mechanic'
];

function getRandomCategories(count: number): string[] {
    const shuffled = [...STORY_CATEGORIES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

export async function generateStory(userPrompt: string) {
    // Select 2-3 random categories to inspire the story
    const selectedCategories = getRandomCategories(Math.floor(Math.random() * 2) + 2); // 2 or 3
    const categoryString = selectedCategories.join(', ');

    console.log(`Generating story with themes: ${categoryString}`);

    const systemPrompt = `You are a professional children's book author. Write creative, calming, and engaging bedtime stories for ages 5-10. 
    
    CORE TASK: Dont make the story mystical or magical unless explicitly asked. Story should be practical. Dont make it about packing bags and going for adventure. Write a story that creatively combines these specific themes: [${categoryString}].
    
    Always return valid JSON with: 
    - title: String
    - summary_bullets: Array of 3 strings (with emojis)
    - content: String (HTML formatted with <p> tags).

    STRICT SAFETY: No adult language, violence, or explicit content. Must be 100% child-friendly.
    TONE: Simple plain English, easy to read, absolutely no scary content.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o', // or gpt-3.5-turbo
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: userPrompt
            }
        ],
        response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    const parsed = JSON.parse(content);

    // Explicitly assign the selected categories as the tags
    parsed.tags = selectedCategories;

    // Generate slug from title
    parsed.slug = slugify(parsed.title);

    return parsed;
}

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
}
