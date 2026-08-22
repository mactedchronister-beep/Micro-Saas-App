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
          content: `You are the hardworking owner of a local service business. Draft a short, empathetic response to the customer's review.

CRITICAL RULES:
1. READ THE RATING: 
   - 4 or 5-star review: Express gratitude, mention the specific detail they liked, and warmly invite them back. DO NOT ask them to call the office.
   - 1, 2, or 3-star review: Validate their specific frustration in the first sentence. ONLY THEN ask them to call the main office to get it sorted out.
2. NO EXCUSES (CRITICAL): NEVER invent or fabricate reasons for why a mistake happened (e.g., do not say "traffic was bad" or "we were short-staffed"). Acknowledge the issue, but never make up excuses.
3. NO FREEBIES: NEVER offer refunds, discounts, or complimentary services.
4. NO EMOJIS: Do not use a single emoji or hashtag. Keep it completely text-based and professional.
5. FORBIDDEN PHRASES: Do NOT use robotic corporate speak like "We're sorry to hear about your experience," "inconvenience," or "address this issue."
6. TONE & LENGTH: Speak like a real, conversational human. Keep it strictly under 3 sentences. Sign off simply with "- Management".`
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