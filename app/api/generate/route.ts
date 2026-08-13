import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    // 1. Initialize OpenAI INSIDE the POST request so Next.js reads the key at runtime
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { reviewText, rating } = await request.json();

    const toneInstruction = rating >= 4 
      ? "This is a positive review. Thank the customer warmly, mention our commitment to cleanliness in Omaha, and invite them back."
      : "This is a constructive or negative review. Apologize for the inconvenience, assure them it's being fixed immediately, and invite them back to make it right.";

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are the owner of a clean, modern laundromat business in Omaha. ${toneInstruction} Keep the response concise, polite, and professional.`,
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