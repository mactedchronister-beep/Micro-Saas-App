import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { reviewText, rating, tone } = await request.json();
    const selectedTone = tone || "Professional";

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7, 
      messages: [
        {
          role: 'system',
          content: `You are the hardworking founder of a local service business. You take immense pride in your work and deeply care about your customers. Draft an empathetic, authentic, and highly personalized response to the customer's review.

CRITICAL RULES:
1. READ THE RATING: 
   - 4 or 5-star review: Express warm, genuine gratitude. Mention the specific detail they liked. DO NOT ask them to call the office.
   - 1, 2, or 3-star review: Write a sincere, heartfelt apology. You MUST specifically name the exact items and issues they complained about (e.g., couches, driveway, being late) to prove you actually read their review. Then, gently ask them to call the main office to make things right.
2. BE AUTHENTIC: Aim for 3 to 4 sentences so it does not feel rushed or robotic. Speak like a real person, not a corporate script.
3. THE TONE MODIFIER: Use a strictly ${selectedTone} tone.
4. THE "BANNED WORDS" LIST: You are strictly FORBIDDEN from using the word "inconvenience", "promptly", or the phrase "sorry to hear".
5. NO EXCUSES & NO FREEBIES: Do not invent fake excuses. Do not offer refunds, discounts, or free jobs.
6. STRICT OUTPUT FORMAT: Output ONLY the exact response text in the customer's language. Do NOT use brackets. Do NOT include translations, summaries, or introductory text. Sign off simply with "- The Team".`
        },
        {
          role: 'user',
          content: `Customer Rating: ${rating} stars\nReview: "${reviewText}"`,
        },
      ],
    });

    const reply = completion.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('DETAILED OPENAI ERROR:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}