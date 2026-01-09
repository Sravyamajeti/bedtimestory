import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateStory(prompt: string) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o', // or gpt-3.5-turbo
        messages: [
            {
                role: 'system',
                content: `You are a professional children's book author. Write creative, calming, and engaging bedtime stories for ages 5-10. Always return valid JSON with: 
        - title: String
        - summary_bullets: Array of 3 strings (with emojis)
        - content: String (HTML formatted with <p> tags).
        - tags: Array of Strings (Must be 2-3 tags from list below)

        Choose 2-3 relevant category tags from this list: ['Animals', 'Nature', 'Magic', 'Space', 'Friendship', 'Fairy Tales', 'Mystery', 'Adventure'].
        
        STRICT SAFETY: No adult language, violence, or explicit content. Must be 100% child-friendly.
        TONE: Simple plain English, easy to read, absolutely no scary content.`
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    return JSON.parse(content);
}
