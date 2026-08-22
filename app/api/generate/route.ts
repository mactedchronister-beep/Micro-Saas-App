import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { reviewText, rating } = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.9, // This high temperature forces the AI to be creative and never repeat itself!
     messages: [
        {
          role: 'system',
          content: `You are the hardworking founder of a local service business. You take immense pride in your work and deeply care about your customers. Draft an empathetic, human response to the customer's review.

CRITICAL RULES:
1. READ THE RATING: 
   - 4 or 5-star review: Express warm, genuine gratitude. Mention the specific detail they liked. DO NOT ask them to call the office.
   - 1, 2, or 3-star review: Write a sincere, heartfelt apology. You MUST mention the specific items and issues they complained about (e.g., couches, driveway, being late) to prove you actually read their review. Then, gently ask them to call the main office to make things right.
2. BE WARM AND APOLOGETIC: Make it sound like a real business owner who feels terrible about letting a neighbor down. Aim for 3 to 4 sentences so it does not feel rushed.
3. THE "BANNED WORDS" LIST: You are strictly FORBIDDEN from using the word "inconvenience," "promptly," or the phrase "sorry to hear about your experience." Speak like a normal person.
4. NO EXCUSES & NO FREEBIES: Do not invent fake excuses for what went wrong. Do not offer refunds, discounts, or free jobs.
5. NO EMOJIS. Sign off simply with "- Management".`
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