'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

  const handleClearQueue = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const { error } = await supabase.from('reviews').delete().eq('user_id', session.user.id);
    if (!error) {
      setReviews([]);
      setReplies({});
    } else {
      alert("Error clearing reviews.");
    }
    setIsLoading(false);
  };

  const handleDemoMode = async () => {
    if (!session?.user?.id) return;
    
    const demoReviews = [
      { author_name: "Mark T.", rating: 1, review_text: "They were supposed to haul away the old couches from my garage but showed up 2 hours late. Left a mess in the driveway." },
      { author_name: "Sarah W.", rating: 5, review_text: "Fastest junk removal I've ever used. Cleared out my entire basement in under an hour. Highly recommend!" },
      { author_name: "James L.", rating: 2, review_text: "Half the washing machines were out of order. Place was clean enough, but waiting for a machine on a Tuesday afternoon is ridiculous." },
      { author_name: "Elena R.", rating: 5, review_text: "Super clean laundromat. The heavy-duty washers handled my king-size comforter perfectly. Will definitely be back." }
    ];

    const existingNames = reviews.map(r => r.author_name);
    const availableReviews = demoReviews.filter(r => !existingNames.includes(r.author_name));
    
    const reviewToInsert = availableReviews.length > 0 
      ? availableReviews[0] 
      : demoReviews[Math.floor(Math.random() * demoReviews.length)];

    const { error } = await supabase.from('reviews').insert([{
      user_id: session.user.id,
      author_name: reviewToInsert.author_name,
      rating: reviewToInsert.rating,
      review_text: reviewToInsert.review_text,
      status: 'pending'
    }]);

    if (!error) {
      fetchReviews();
    } else {
      alert("Database error: Make sure you ran the SQL insert policy!");
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa] text-gray-500 font-medium">Authenticating secure connection...</div>;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa] p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 p-10 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 w-full max-w-md border border-gray-100">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg mb-8 mx-auto">
             <span className="text-white text-3xl leading-none pt-1">✦</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-8 text-center text-gray-900 tracking-tight">Sign in to EchoReply</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all focus:outline-none bg-gray-50 hover:bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all focus:outline-none bg-gray-50 hover:bg-white" required />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white p-4 rounded-xl font-bold transition-all duration-200 ease-out hover:bg-black hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-gray-300 mt-2">
              Secure Sign In
            </button>
          </form>
          <div className="mt-6 flex justify-center items-center gap-2 text-xs font-bold text-gray-400">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
            256-Bit Encrypted Connection
          </div>
        </div>
      </div>
    );
  }

  return ( 
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold text-gray-900 tracking-tighter flex items-center gap-2 transition-transform active:scale-95">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-lg leading-none pt-1">✦</span>
            </div>
            EchoReply
          </Link>
          
          <div className="flex items-center gap-3">
            {isPro && (
              <>
                <button onClick={handleDemoMode} className="text-sm px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold transition-all duration-200 ease-out hover:bg-indigo-100 active:scale-95">
                  Test Demo Mode
                </button>
                <button onClick={handleClearQueue} className="text-sm px-4 py-2 bg-white text-red-600 border border-red-100 rounded-lg font-bold transition-all duration-200 ease-out hover:bg-red-50 active:scale-95">
                  Reset Queue
                </button>
              </>
            )}
            <button onClick={handlePortal} disabled={isPortalLoading} className="text-sm px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold transition-all duration-200 ease-out hover:bg-gray-50 active:scale-95 disabled:opacity-50">
              {isPortalLoading ? "Loading..." : "Manage Billing"}
            </button>
            <button onClick={handleLogout} className="text-sm px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold transition-all duration-200 ease-out hover:bg-gray-50 active:scale-95">
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {!isPro ? (
        <div className="flex flex-col items-center justify-center pt-24 px-4 relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold tracking-wide">
            UPGRADE REQUIRED
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-center tracking-tight text-gray-900">Unlock EchoReply Pro</h2>
          <p className="mb-10 text-gray-500 text-lg text-center max-w-md leading-relaxed">Get full access to automated AI review responses and protect your local business reputation.</p>
          
          <div className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-gray-200/60 border border-gray-100 w-full max-w-md text-center relative overflow-hidden transition-transform duration-500 hover:-translate-y-1">
             <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-[0.08] rounded-bl-full pointer-events-none"></div>
             
             <div className="text-6xl font-extrabold text-gray-900 mb-2 tracking-tighter">$29<span className="text-xl text-gray-400 font-medium tracking-normal">/mo</span></div>
             <p className="text-green-600 font-bold mb-10 text-sm bg-green-50 inline-block px-3 py-1 rounded-full border border-green-100">14-Day Money-Back Guarantee</p>
             
             <ul className="text-left space-y-5 mb-10">
               <li className="flex items-center text-gray-700 font-bold">
                 <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-4">
                   <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                 </div>
                 Unlimited AI Responses
               </li>
               <li className="flex items-center text-gray-700 font-bold">
                 <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-4">
                   <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                 </div>
                 Real-time dashboard access
               </li>
               <li className="flex items-center text-gray-700 font-bold">
                 <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-4">
                   <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                 </div>
                 Cancel anytime. No hidden fees.
               </li>
             </ul>

            <button 
              onClick={handleSubscribe} 
              disabled={isCheckoutLoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-lg transition-all duration-200 ease-out hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.98] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-70 disabled:transform-none disabled:shadow-none"
            >
              {isCheckoutLoading ? 'Connecting securely...' : 'Upgrade Now'}
            </button>
            <div className="mt-5 flex justify-center items-center gap-2 text-xs font-bold text-gray-400">
               <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
               Guaranteed safe & secure checkout by <span className="text-[#635BFF] font-extrabold ml-1 tracking-wide">stripe</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto pt-12 px-6 relative z-10">
          
          {toastMessage && (
            <div className={`mb-8 p-4 rounded-xl text-sm font-bold shadow-sm flex justify-between items-center ${toastMessage.includes('successful') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
              {toastMessage}
              <button onClick={() => setToastMessage(null)} className="hover:opacity-70 text-lg leading-none">&times;</button>
            </div>
          )}

          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Review Manager</h1>
            <p className="text-gray-500 font-medium mt-1">Approve and automate your customer replies.</p>
          </div>
          
          {isLoading ? (
            <div className="text-center p-20 text-gray-400 font-bold animate-pulse">Syncing latest reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">🎉</div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Inbox Zero</h2>
              <p className="text-gray-500 font-medium">You are all caught up! No pending reviews.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-100 p-8 rounded-[2rem] shadow-sm bg-white transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 font-extrabold text-2xl rounded-2xl flex items-center justify-center uppercase shadow-sm">
                        {review.author_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl text-gray-900 leading-none mb-1.5">{review.author_name}</h3>
                        <div className="text-yellow-400 text-sm tracking-widest">{"★".repeat(review.rating)}<span className="text-gray-200">{"★".repeat(5 - review.rating)}</span></div>
                      </div>
                    </div>
                    <span className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-2 rounded-full font-bold uppercase tracking-wider shadow-sm">Action Required</span>
                  </div>
                  
                  <p className="text-gray-700 mb-8 text-lg leading-relaxed font-medium">"{review.review_text}"</p>
                  
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative">
                    <p className="text-xs text-indigo-500 mb-4 font-bold uppercase tracking-widest flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span> AI Assistant
                    </p>
                    {replies[review.id] ? (
                      <textarea value={replies[review.id]} onChange={(e) => setReplies(prev => ({ ...prev, [review.id]: e.target.value }))} className="w-full p-5 border border-gray-200 rounded-xl text-gray-800 mb-5 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white min-h-[140px] resize-y font-medium shadow-sm transition-all" />
                    ) : (
                      <div className="h-[140px] w-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-white/50 mb-5">
                        <p className="text-gray-400 font-bold">Click below to draft a smart response...</p>
                      </div>
                    )}
                    
                    {/* UPDATED BUTTON LOGIC: Redrafting */}
                    <div className="flex gap-4">
                      {replies[review.id] ? (
                        <>
                          <button onClick={() => handleApprove(review.id)} className="bg-green-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ease-out hover:bg-green-600 hover:shadow-[0_8px_30px_rgba(34,197,94,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-green-500/30">
                            Approve & Publish
                          </button>
                          <button onClick={() => handleGenerateReply(review.id, review.review_text, review.rating)} disabled={loadingId === review.id} className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ease-out hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:transform-none">
                            {loadingId === review.id ? "Drafting..." : "Redraft Response"}
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleGenerateReply(review.id, review.review_text, review.rating)} disabled={loadingId === review.id} className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ease-out hover:bg-black hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:bg-gray-300 disabled:transform-none disabled:shadow-none">
                          {loadingId === review.id ? "Drafting Response..." : "Draft Reply with AI"}
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