'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  // Auth State
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // Dashboard State
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  
  // NEW: State to hold our success/cancel banner messages
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2. Check for Login Session & Stripe Redirects on Load
  useEffect(() => {
    // Check URL parameters for Stripe success or cancel
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setToastMessage('Subscription successful! Welcome to EchoReply Pro.');
      window.history.replaceState(null, '', '/'); // Cleans up the URL to look professional
    }
    if (query.get('canceled')) {
      setToastMessage('Checkout was canceled. Your account has not been charged.');
      window.history.replaceState(null, '', '/');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) fetchReviews();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchReviews();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'pending') // FIXED: Now properly matches your database status!
      .order('created_at', { ascending: false });

    if (!error) setReviews(data || []);
    setIsLoading(false);
  };

  // 3. Login / Logout Functions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login failed: " + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 4. STRIPE CHECKOUT FUNCTION
  const handleSubscribe = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/checkout', { method: 'POST' });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert("Checkout Error: " + data.error);
      }
    } catch (error) {
      alert("Something went wrong connecting to Stripe.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // 5. Dashboard Functions
  const handleGenerateReply = async (reviewId: number, text: string, rating: number) => {
    setLoadingId(reviewId);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewText: text, rating }),
      });
      const data = await response.json();
      if (data.reply) setReplies(prev => ({ ...prev, [reviewId]: data.reply }));
    } catch (error) {
      alert("Something went wrong connecting to the backend.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleApprove = async (reviewId: number) => {
    const { error } = await supabase.from('reviews').update({ status: 'replied' }).eq('id', reviewId);
    if (!error) {
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    }
  };

  // --- UI RENDERING ---
  if (authLoading) return <div className="p-8 text-center mt-20 text-gray-500">Loading secure connection...</div>;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">EchoReply Portal</h1>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-black focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-black focus:outline-none" required />
            </div>
            <button type="submit" className="w-full bg-black text-white p-3 rounded-md hover:bg-gray-800 transition-colors font-medium mt-2">Secure Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      
      {/* NEW: NOTIFICATION BANNER */}
      {toastMessage && (
        <div className={`mb-6 p-4 rounded-md text-sm font-medium ${toastMessage.includes('successful') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
          {toastMessage}
          <button onClick={() => setToastMessage(null)} className="float-right font-bold ml-4">&times;</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Review Manager</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleSubscribe} 
            disabled={isCheckoutLoading}
            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:bg-indigo-400"
          >
            {isCheckoutLoading ? "Loading Secure Checkout..." : "Upgrade to Pro ($29/mo)"}
          </button>
          
          <button onClick={handleLogout} className="text-sm px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium">Sign Out</button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center p-12 text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center p-12 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-2xl font-bold text-green-700 mb-2">All Caught Up!</h2>
          <p className="text-green-600">You've replied to all customer reviews for the business.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border p-6 rounded-lg shadow-sm bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  {/* FIXED: Now pulling `author_name` */}
                  <h3 className="font-semibold text-lg text-gray-900">{review.author_name}</h3>
                  <div className="text-yellow-500">{"★".repeat(review.rating)}</div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">Needs Reply</span>
              </div>
              {/* FIXED: Now pulling `review_text` */}
              <p className="text-gray-700 mb-6">"{review.review_text}"</p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-500 mb-2 font-semibold">AI Suggested Reply:</p>
                {replies[review.id] ? (
                  <textarea value={replies[review.id]} onChange={(e) => setReplies(prev => ({ ...prev, [review.id]: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-md text-gray-800 mb-4 focus:outline-none focus:ring-2 focus:ring-black min-h-[120px] resize-y" />
                ) : (
                  <p className="text-gray-400 mb-4 italic">Click below to draft a response...</p>
                )}
                <div className="flex gap-3">
                  {/* FIXED: Passing `review_text` to the API */}
                  <button onClick={() => handleGenerateReply(review.id, review.review_text, review.rating)} disabled={loadingId === review.id} className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors">
                    {loadingId === review.id ? "Generating..." : "Draft AI Reply"}
                  </button>
                  {replies[review.id] && (
                    <button onClick={() => handleApprove(review.id)} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                      Approve & Post
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}