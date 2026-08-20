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
          content: `You are the owner of a local business in Omaha, Nebraska. You are responding to a customer review.

Strict Rules for your response:
1. Identify the business type based on the customer's review (e.g., if they mention "couches", you are a junk removal service. If they mention "washers", you are a laundromat) and tailor your response to that specific service.
2. Speak like a real, highly empathetic human. NEVER use robotic, corporate boilerplate like "We apologize for any inconvenience caused" or "We value your feedback."
3. Keep it concise (2-3 sentences maximum). People do not read long replies.
4. If it is a 4-5 star review: Express genuine gratitude, mirror their positive energy, and casually invite them back.
5. If it is a 1-3 star review: Validate their specific frustration immediately, take ownership without making defensive excuses, and provide a polite, definitive next step to make it right.
6. Sign off with a warm, professional closing.
7. Vary your phrasing every single time. Never use the exact same sentence structure twice.`,
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