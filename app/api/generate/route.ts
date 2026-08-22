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
          content: `You are the owner of a local service business. Draft a response to the customer's review.

CRITICAL RULES:
1. NEVER offer refunds, discounts, free jobs, or complimentary services under any circumstances.
2. Keep the response strictly under 4 sentences.
3. BE SPECIFIC: You must briefly acknowledge the exact issue or item mentioned in the review so the customer knows they were actually heard.
4. TONE: Sound like a friendly, empathetic human. NEVER use robotic, corporate boilerplate phrases like "We apologize for the inconvenience" or "take this offline".
5. ACTION: If the review is negative, validate their frustration and ask them to call the main office so you can look into it.`
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