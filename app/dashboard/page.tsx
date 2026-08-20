'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  
  const [isPro, setIsPro] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setToastMessage('Subscription successful! Welcome to EchoReply Pro.');
      window.history.replaceState(null, '', '/dashboard'); 
    }
    if (query.get('canceled')) {
      setToastMessage('Checkout was canceled. Your account has not been charged.');
      window.history.replaceState(null, '', '/dashboard');
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('email', session.user.email)
          .single();
          
        if (profile?.is_pro) setIsPro(true);
        fetchReviews();
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      .eq('status', 'pending') 
      .order('created_at', { ascending: false });

    if (!error) setReviews(data || []);
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login failed: " + error.message);
  };

  const handleLogout = async () => await supabase.auth.signOut();

  const handleSubscribe = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/checkout', { method: 'POST' });
      const data = await response.json();
      if (data.url) window.location.href = data.url; 
      else alert("Checkout Error: " + data.error);
    } catch (error) {
      alert("Something went wrong connecting to Stripe.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!session?.user?.email) return;
    setIsPortalLoading(true);
    try {
      const response = await fetch('/api/portal', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email })
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url; 
      else alert("Portal Error: " + data.error);
    } catch (error) {
      alert("Something went wrong connecting to the billing portal.");
    } finally {
      setIsPortalLoading(false);
    }
  };

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
    if (!error) setReviews(prev => prev.filter(review => review.id !== reviewId));
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa] text-gray-500 font-medium">Authenticating secure connection...</div>;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa] p-4 font-sans">
        <div className="p-10 bg-white rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-md border border-gray-100">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-md mb-6 mx-auto">
             <span className="text-white text-2xl leading-none pt-1">✦</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-8 text-center text-gray-900 tracking-tight">Sign in to EchoReply</h1>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all focus:outline-none bg-gray-50 hover:bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all focus:outline-none bg-gray-50 hover:bg-white" required />
            </div>
            <button type="submit" className="w-full bg-black text-white p-4 rounded-xl hover:bg-gray-800 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 font-bold shadow-lg shadow-gray-300/50 mt-4">Secure Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return ( 
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      {!isPro ? (
        <div className="flex flex-col items-center justify-center pt-32 px-4">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold tracking-wide">
            UPGRADE REQUIRED
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-center tracking-tight text-gray-900">Unlock EchoReply Pro</h2>
          <p className="mb-10 text-gray-500 text-lg text-center max-w-md">Get full access to automated AI review responses and protect your local business reputation.</p>
          
          <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-gray-200 border border-gray-100 w-full max-w-md text-center relative overflow-hidden">
             {/* Decorative background element */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-10 rounded-bl-full pointer-events-none"></div>
             
             <div className="text-5xl font-extrabold text-gray-900 mb-2">$29<span className="text-xl text-gray-400 font-medium tracking-normal">/mo</span></div>
             <p className="text-gray-500 font-medium mb-8">Cancel anytime. No hidden fees.</p>
             
             <ul className="text-left space-y-4 mb-8">
               <li className="flex items-center text-gray-700 font-medium">
                 <svg className="w-5 h-5 text-indigo-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                 Unlimited AI Review Responses
               </li>
               <li className="flex items-center text-gray-700 font-medium">
                 <svg className="w-5 h-5 text-indigo-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                 Real-time dashboard access
               </li>
               <li className="flex items-center text-gray-700 font-medium">
                 <svg className="w-5 h-5 text-indigo-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                 Secure Stripe billing
               </li>
             </ul>

            <button 
              onClick={handleSubscribe} 
              disabled={isCheckoutLoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-70"
            >
              {isCheckoutLoading ? 'Connecting securely...' : 'Upgrade Now'}
            </button>
          </div>

          <button onClick={handleLogout} className="mt-8 text-sm font-semibold text-gray-400 hover:text-gray-800 transition-colors">
            Sign out of account
          </button>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto pt-12 px-6">
          
          {toastMessage && (
            <div className={`mb-8 p-4 rounded-xl text-sm font-bold shadow-sm ${toastMessage.includes('successful') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
              {toastMessage}
              <button onClick={() => setToastMessage(null)} className="float-right ml-4 hover:opacity-70">&times;</button>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Review Manager</h1>
              <p className="text-gray-500 font-medium mt-1">Approve and automate your customer replies.</p>
            </div>
            <div className="flex gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
              <button 
                onClick={handlePortal} 
                disabled={isPortalLoading}
                className="text-sm px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-bold disabled:opacity-50 transition-colors"
              >
                {isPortalLoading ? "Loading..." : "Manage Billing"}
              </button>
              <button onClick={handleLogout} className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-colors">Log Out</button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center p-20 text-gray-400 font-bold animate-pulse">Syncing latest reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🎉</div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Inbox Zero</h2>
              <p className="text-gray-500 font-medium">You are all caught up! No pending reviews.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-100 p-8 rounded-3xl shadow-sm bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-700 font-bold text-xl rounded-full flex items-center justify-center uppercase">
                        {review.author_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 leading-none mb-1">{review.author_name}</h3>
                        <div className="text-yellow-400 text-sm tracking-widest">{"★".repeat(review.rating)}<span className="text-gray-200">{"★".repeat(5 - review.rating)}</span></div>
                      </div>
                    </div>
                    <span className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wide">Action Required</span>
                  </div>
                  
                  <p className="text-gray-700 mb-8 text-lg leading-relaxed">"{review.review_text}"</p>
                  
                  <div className="bg-[#fafafa] p-6 rounded-2xl border border-gray-100 relative">
                    <p className="text-xs text-indigo-500 mb-3 font-bold uppercase tracking-widest flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> AI Assistant
                    </p>
                    {replies[review.id] ? (
                      <textarea value={replies[review.id]} onChange={(e) => setReplies(prev => ({ ...prev, [review.id]: e.target.value }))} className="w-full p-4 border border-gray-200 rounded-xl text-gray-800 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-h-[120px] resize-y font-medium shadow-sm" />
                    ) : (
                      <div className="h-[120px] w-full border border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-white/50 mb-4">
                        <p className="text-gray-400 font-medium">Click below to draft a smart response...</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => handleGenerateReply(review.id, review.review_text, review.rating)} disabled={loadingId === review.id} className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 hover:-translate-y-0.5 active:scale-95 disabled:bg-gray-300 disabled:transform-none transition-all duration-200 shadow-md">
                        {loadingId === review.id ? "Drafting..." : "Draft Reply with AI"}
                      </button>
                      {replies[review.id] && (
                        <button onClick={() => handleApprove(review.id)} className="bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-md shadow-green-500/20">
                          Approve & Publish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}