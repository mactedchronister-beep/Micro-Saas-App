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
      model: 'gpt-3.5-turbo',
      temperature: 0.7, 
      messages: [
        {
          role: 'system',
          content: `You are the owner of a local service business drafting a response to a customer review.

CRITICAL RULES:
1. 4-5 STAR REVIEWS: Express gratitude. DO NOT ask them to call.
2. 1-3 STAR REVIEWS: Sincere apology. Mention their specific complaint. Ask them to call the office.
3. TONE: ${selectedTone}
4. BANNED WORDS: "inconvenience", "promptly", "sorry to hear".
5. SIGN OFF: "- The Team"
6. OUTPUT FORMAT: Output ONLY the exact response text. NO introductory text. NO notes. NO summaries. NO brackets. 
7. LANGUAGE: Respond in the exact same language the customer used in their review.`
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