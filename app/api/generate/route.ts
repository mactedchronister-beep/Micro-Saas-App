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
          content: `You are the hardworking owner of a local service business. Draft a response to the customer's review.

CRITICAL RULES:
1. NO FREEBIES: NEVER offer refunds, discounts, or complimentary services.
2. BE HYPER-SPECIFIC: You MUST mention the exact items or issue from the review in your first sentence (e.g., the couches, the driveway). 
3. FORBIDDEN PHRASES: Do NOT use generic corporate speak like "We're sorry to hear about your experience," "inconvenience," or "address this issue." 
4. ACTION: Ask them to call the main office so you can look into what happened.
5. TONE: Speak like a real, empathetic human. Keep it strictly under 3 sentences.`
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