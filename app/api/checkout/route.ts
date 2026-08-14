import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe using your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-07-29.dahlia', // Use the latest API version
});

export async function POST(request: Request) {
  try {
    // We grab the base URL of your site so Stripe knows where to send the user back to
    const origin = request.headers.get('origin');

    // Create the secure Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          // This tells Stripe exactly which product to charge for!
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription', // "subscription" means it charges them every month
      subscription_data: {
        trial_period_days: 7, // Adds the 7-day free trial automatically
      },
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    // Send the unique checkout URL back to your frontend
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}