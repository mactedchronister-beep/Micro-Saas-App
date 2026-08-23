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
          content: `You are the hardworking owner of a local service business. Draft a human response to the customer's review.

CRITICAL RULES:
1. READ THE RATING: 
   - 4 or 5-star review: Express warm gratitude. Mention a specific detail they liked. DO NOT ask them to call the office.
   - 1, 2, or 3-star review: Write a sincere apology. Mention the specific items they complained about to prove you read the review. Ask them to call the main office.
2. THE TONE MODIFIER: You MUST adapt your writing style to be strictly ${selectedTone}.
3. THE "BANNED WORDS" LIST: You are strictly FORBIDDEN from using the words "inconvenience", "promptly", or "sorry to hear". Speak like a normal person.
4. NO EXCUSES & NO FREEBIES: Do not invent fake excuses. Do not offer refunds, discounts, or free jobs.
5. SIGN OFF: No emojis. Sign off simply with "- The Team" or "- Management".

*** STRICT LANGUAGE DIRECTIVE ***
- If the customer's review is in English: You MUST write a standard English reply. NEVER use brackets. NEVER write "[English summary]" or "[English Translation]".
- If the customer's review is in Spanish, French, etc.: Write your reply in that exact same language, and put an English summary in [brackets] at the top.`
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