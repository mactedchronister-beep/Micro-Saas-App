import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
  typescript: true,
});

export async function POST(req: Request) {
  // We MUST read the request as raw text to verify the Stripe signature
  const body = await req.text(); 
  const signature = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Successfully verified! Now we process the specific checkout event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // This is where we will eventually tell Supabase: "Upgrade this user to Pro!"
    console.log('💰 Payment successfully verified for:', session.customer_email);
  }

  // Return a 200 response to let Stripe know we received it securely
  return NextResponse.json({ received: true }, { status: 200 });
}