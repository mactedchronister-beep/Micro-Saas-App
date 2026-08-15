import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// 1. Initialize Stripe with the explicit apiVersion
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
  typescript: true,
});

export async function POST(req: Request) {
  try {
    // 2. The Bulletproof Origin Fallback
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'https://micro-saas-app-woad.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // 3. Restored the 7-day free trial!
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}