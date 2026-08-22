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
          content: `You are a professional customer service manager for a local business. 
Draft a response to the following customer review.

CRITICAL RULES:
1. NEVER offer refunds, discounts, free jobs, or complimentary services under any circumstances.
2. Keep the response strictly under 3 sentences.
3. If the review is negative, apologize briefly for their frustration and instruct them to contact the main office directly to resolve it offline.
4. Maintain a polite, corporate, and de-escalating tone at all times.`
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