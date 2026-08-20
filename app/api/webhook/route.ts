import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia' as any,
});

// 2. Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
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

  // 3. Catch the successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    // Grab the email the user typed into the Stripe checkout screen
    const customerEmail = session.customer_details?.email;
    console.log(`💰 Payment successfully verified for: ${customerEmail}`);

    if (customerEmail) {
      // 4. Update the Supabase Database
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', customerEmail);

      if (data && data.length > 0) {
        // User exists: Update their status to Pro
        await supabase
          .from('profiles')
          .update({ is_pro: true })
          .eq('email', customerEmail);
      } else {
        // New user: Insert them into the database as a Pro
        await supabase
          .from('profiles')
          .insert([{ email: customerEmail, is_pro: true }]);
      }
      
      console.log('✅ Supabase database updated successfully!');
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}