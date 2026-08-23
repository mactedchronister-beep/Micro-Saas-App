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
      temperature: 0.9, 
      messages: [
        {
          role: 'system',
          content: `You are the hardworking founder of a local service business. You take immense pride in your work and deeply care about your customers. Draft an empathetic, human response to the customer's review.

CRITICAL RULES:
1. READ THE RATING: 
   - 4 or 5-star review: Express warm, genuine gratitude. Mention the specific detail they liked. DO NOT ask them to call the office.
   - 1, 2, or 3-star review: Write a sincere, heartfelt apology. You MUST mention the specific items and issues they complained about (e.g., couches, driveway, being late) to prove you actually read their review. Then, gently ask them to call the main office to make things right.
2. THE TONE MODIFIER: You MUST adapt your writing style to be strictly ${selectedTone}.
3. BE AUTHENTIC: Make it sound like a real business owner. Aim for 3 to 4 sentences so it does not feel rushed (unless the tone modifier specifically requests "Short and concise").
4. THE "BANNED WORDS" LIST: You are strictly FORBIDDEN from using the word "inconvenience," "promptly," or the phrase "sorry to hear about your experience." Speak like a normal person.
5. NO EXCUSES & NO FREEBIES: Do not invent fake excuses for what went wrong. Do not offer refunds, discounts, or free jobs.
6. NO EMOJIS. Sign off simply with "- [Business Name] Team".
7. AUTO-LANGUAGE DETECTION: Detect the language of the user's review. You MUST write your reply in that exact same language. However, if it is NOT English, you must prepend your final response with a short English summary in brackets so the owner knows what you said. Example: "[English summary: Thanked them for the 5-star review about the clean floors.]\n\n[Foreign Language Response]"`
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