import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe (Matching the version you used in your webhook)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia' as any,
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Find the customer in Stripe by their email
    const customers = await stripe.customers.search({
      query: `email:'${email}'`,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'No active billing account found.' }, { status: 404 });
    }

    const customerId = customers.data[0].id;

    // 2. Create the secure portal session
    // This automatically detects if they are on localhost or your live Vercel domain
    const origin = req.headers.get('origin') || 'http://localhost:3000'; 
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Portal Error:', err.message);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}