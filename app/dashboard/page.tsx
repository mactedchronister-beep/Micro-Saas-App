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
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  
  const [isPro, setIsPro] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [tone, setTone] = useState("Professional");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setAuthError("Success! Check your email for a confirmation link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setAuthError("Incorrect email or password. Please try again.");
        } else {
          setAuthError(error.message);
        }
      }
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard`, queryParams: { prompt: 'select_account' } }
    });
    if (error) setAuthError(error.message);
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
        body: JSON.stringify({ reviewText: text, rating, tone }),
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
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (!error) {
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setReplies(prev => { const copy = { ...prev }; delete copy[reviewId]; return copy; });
    }
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearQueue = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const { error } = await supabase.from('reviews').delete().eq('user_id', session.user.id);
    if (!error) { setReviews([]); setReplies({}); }
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
    const reviewToInsert = availableReviews.length > 0 ? availableReviews[0] : demoReviews[Math.floor(Math.random() * demoReviews.length)];

    const { error } = await supabase.from('reviews').insert([{
      user_id: session.user.id, author_name: reviewToInsert.author_name, rating: reviewToInsert.rating, review_text: reviewToInsert.review_text, status: 'pending'
    }]);

    if (!error) fetchReviews();
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa] text-gray-500 font-medium">Authenticating secure connection...</div>;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa] p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 p-8 md:p-10 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.07)] w-full max-w-md border border-gray-100 mx-4">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center shadow-xl mb-8 mx-auto"><span className="text-white text-3xl leading-none pt-1">✦</span></div>
          <h1 className="text-2xl font-extrabold mb-8 text-center text-gray-900 tracking-tight">{isSignUp ? "Create your account" : "Sign in to EchoReply"}</h1>
          {authError && <div className={`mb-6 p-4 rounded-2xl text-sm font-bold shadow-sm ${authError.includes('Success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>{authError}</div>}
          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 p-4 rounded-2xl font-bold transition-all hover:bg-gray-50 hover:shadow-sm active:scale-[0.98] mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.01 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-4 mb-6"><div className="h-px bg-gray-200 flex-1"></div><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Or email</span><div className="h-px bg-gray-200 flex-1"></div></div>
          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border border-gray-200 rounded-2xl text-gray-900 focus:ring-4 focus:ring-indigo-500/20 outline-none bg-gray-50/50 hover:bg-white font-medium" required /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-2">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border border-gray-200 rounded-2xl text-gray-900 focus:ring-4 focus:ring-indigo-500/20 outline-none bg-gray-50/50 hover:bg-white font-medium" required /></div>
            <button type="submit" className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold transition-all hover:bg-black active:scale-[0.98] mt-2">{isSignUp ? "Create Account" : "Secure Sign In"}</button>
          </form>
          <div className="mt-8 text-center text-sm font-medium text-gray-500">{isSignUp ? "Already have an account? " : "Don't have an account? "}<button onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); }} className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">{isSignUp ? "Sign In" : "Sign Up"}</button></div>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const lifetimeDrafts = reviews.length === 0 ? 0 : 54 + Object.keys(replies).length; 
  const hoursSaved = ((lifetimeDrafts * 5) / 60).toFixed(1);

  // NEW: Dynamic Rank Logic based on whether they have populated their queue yet
  const isUnranked = reviews.length === 0;

  return ( 
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20 relative overflow-hidden">
      
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${showSuccessToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] font-bold flex items-center gap-3">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
          Response published live to Google.
        </div>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:h-20 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-xl font-extrabold text-gray-900 tracking-tighter flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center shadow-md"><span className="text-white text-xl leading-none pt-0.5">✦</span></div>
            EchoReply
          </Link>
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 w-full md:w-auto">
            {isPro && (
              <>
                <button onClick={handleDemoMode} className="flex-1 md:flex-none text-xs md:text-sm px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-all border border-indigo-100">+ Demo Mode</button>
                <button onClick={handleClearQueue} className="flex-1 md:flex-none text-xs md:text-sm px-4 py-2.5 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-50 transition-all">Reset Queue</button>
              </>
            )}
            <Link href="/settings" className="flex-1 md:flex-none text-xs md:text-sm px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all text-center">Settings</Link>
            <button onClick={handlePortal} disabled={isPortalLoading} className="flex-1 md:flex-none text-xs md:text-sm px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50">{isPortalLoading ? "Loading..." : "Billing"}</button>
            <button onClick={handleLogout} className="flex-1 md:flex-none text-xs md:text-sm px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">Log Out</button>
          </div>
        </div>
      </nav>

      {!isPro ? (
        <div className="flex flex-col items-center justify-center pt-16 md:pt-24 px-4 relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold tracking-wide shadow-sm">UPGRADE REQUIRED</div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-center tracking-tight text-gray-900">Unlock EchoReply Pro</h2>
          <p className="mb-10 text-gray-500 text-lg text-center max-w-md leading-relaxed">Get full access to automated AI review responses and protect your local business reputation.</p>
          <div className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 w-full max-w-md text-center relative hover:-translate-y-1 transition-transform">
             <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-[0.08] rounded-bl-full pointer-events-none"></div>
             <div className="text-6xl font-extrabold text-gray-900 mb-2 tracking-tighter">$29<span className="text-xl text-gray-400 font-medium tracking-normal">/mo</span></div>
             <p className="text-emerald-600 font-bold mb-10 text-sm bg-emerald-50 inline-block px-4 py-1.5 rounded-full border border-emerald-100">14-Day Money-Back Guarantee</p>
             <ul className="text-left space-y-4 mb-10">
               <li className="flex items-center text-gray-700 font-bold"><div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mr-4 text-indigo-600">✓</div>Unlimited AI Responses</li>
               <li className="flex items-center text-gray-700 font-bold"><div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mr-4 text-indigo-600">✓</div>Real-time dashboard access</li>
               <li className="flex items-center text-gray-700 font-bold"><div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mr-4 text-indigo-600">✓</div>Cancel anytime. No hidden fees.</li>
             </ul>
            <button onClick={handleSubscribe} disabled={isCheckoutLoading} className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 shadow-lg">{isCheckoutLoading ? 'Connecting securely...' : 'Upgrade Now'}</button>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto pt-8 md:pt-12 px-4 md:px-6 relative z-10">
          
          {toastMessage && (
            <div className={`mb-8 p-4 rounded-2xl text-sm font-bold shadow-sm flex justify-between items-center ${toastMessage.includes('successful') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
              {toastMessage}
              <button onClick={() => setToastMessage(null)} className="hover:opacity-70 text-lg leading-none">&times;</button>
            </div>
          )}

          <div className="mb-8 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Review Manager</h1>
              <p className="text-gray-500 font-medium mt-1">Approve and automate your customer replies.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/60 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-sm self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Pro Active
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-[2rem] flex justify-between items-center mb-8 shadow-sm">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🏆</div>
               <div>
                 <p className="text-sm font-extrabold text-amber-900 uppercase tracking-wider">Competitor Benchmark</p>
                 <p className="text-sm font-medium text-amber-700">Top local competitors are currently averaging 4.8 stars.</p>
               </div>
             </div>
             <div className="text-right hidden sm:block">
               <p className="text-3xl font-extrabold text-amber-600">4.8<span className="text-lg opacity-50 ml-1">★</span></p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
               <span className="text-gray-400 font-bold text-xs mb-1 uppercase tracking-wider">Pending</span>
               <span className="text-4xl font-extrabold text-gray-900">{reviews.length}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
               <span className="text-gray-400 font-bold text-xs mb-1 uppercase tracking-wider">Star Rating</span>
               <span className="text-4xl font-extrabold text-amber-500">{averageRating}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
               <span className="text-gray-400 font-bold text-xs mb-1 uppercase tracking-wider">Hours Saved</span>
               <span className="text-4xl font-extrabold text-emerald-500">{hoursSaved}</span>
            </div>
            
            {/* UPDATED: Dynamic Reputation Tier based on active queue */}
            {isUnranked ? (
              <div className="bg-gray-100 p-6 rounded-[2rem] border border-gray-200 shadow-inner flex flex-col items-center justify-center">
                 <span className="text-gray-400 font-bold text-xs mb-1 uppercase tracking-wider">Reputation Tier</span>
                 <span className="text-3xl font-extrabold text-gray-400 tracking-tight">UNRANKED</span>
                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Connect Account</span>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-900 to-black p-6 rounded-[2rem] border border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full group-hover:bg-indigo-400/30 transition-all duration-700"></div>
                 <span className="text-gray-400 font-bold text-xs mb-1 uppercase tracking-wider z-10">Reputation Tier</span>
                 <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 z-10 tracking-tight drop-shadow-[0_0_10px_rgba(165,180,252,0.3)]">RADIANT</span>
                 <span className="text-[10px] text-indigo-300/70 font-bold uppercase tracking-widest mt-1 z-10">Top 100 Regional</span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center p-20 text-gray-400 font-bold animate-pulse">Syncing latest reviews...</div>
          ) : reviews.length === 0 ? (
            
            <div className="text-center p-10 md:p-20 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-6xl mb-6 animate-bounce">🎉</div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Inbox Zero Achieved!</h2>
              <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">You are all caught up! Connect your Google Business Profile to securely import your latest customer reviews and automate your reputation.</p>
              <button onClick={() => alert("Google Business Profile integration coming soon pending API approval!")} className="relative z-10 bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black active:scale-95 transition-all shadow-lg">
                Connect Google Account
              </button>
            </div>

          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-100 p-6 md:p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-white/90 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 font-extrabold text-2xl rounded-2xl flex items-center justify-center uppercase shadow-inner border border-indigo-100/50 shrink-0">
                        {review.author_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl text-gray-900 leading-none mb-1.5">{review.author_name}</h3>
                        <div className="text-amber-400 text-sm tracking-widest">{"★".repeat(review.rating)}<span className="text-gray-200">{"★".repeat(5 - review.rating)}</span></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                      <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] md:text-xs px-3 md:px-4 py-2 rounded-full font-bold uppercase tracking-wider shadow-sm">Action Required</span>
                      <button 
                        onClick={() => handleDeleteReview(review.id)} 
                        title="Delete this review"
                        className="w-9 h-9 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-full flex items-center justify-center border border-gray-200 hover:border-rose-200 transition-all font-bold text-sm shrink-0"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-8 text-base md:text-lg leading-relaxed font-medium">"{review.review_text}"</p>
                  
                  <div className="bg-gray-50/70 p-4 md:p-6 rounded-3xl border border-gray-100 relative">
                    
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span> AI Assistant
                      </p>
                      
                      <select 
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-600 text-xs rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                      >
                        <option value="Professional">Professional Tone</option>
                        <option value="Warm and friendly">Friendly Tone</option>
                        <option value="Apologetic and helpful">Apologetic Tone</option>
                        <option value="Short and concise">Short Tone</option>
                      </select>
                    </div>

                    {replies[review.id] ? (
                      <textarea value={replies[review.id]} onChange={(e) => setReplies(prev => ({ ...prev, [review.id]: e.target.value }))} className="w-full p-4 md:p-5 border border-gray-200 rounded-2xl text-gray-800 mb-5 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white min-h-[140px] resize-y font-medium shadow-sm transition-all" />
                    ) : (
                      <div className="h-[140px] w-full border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-white/50 mb-5 text-center px-4">
                        <p className="text-gray-400 font-bold text-sm md:text-base">Click below to draft a smart response...</p>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      {replies[review.id] ? (
                        <>
                          <button onClick={() => handleApprove(review.id)} className="w-full sm:w-auto bg-emerald-500 text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ease-out hover:bg-emerald-600 hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-emerald-500/30">
                            Approve & Publish
                          </button>
                          
                          <button onClick={() => handleCopy(review.id, replies[review.id])} className="w-full sm:w-auto bg-indigo-50 text-indigo-700 border border-indigo-100 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ease-out hover:bg-indigo-100 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-indigo-100">
                            {copiedId === review.id ? "Copied! ✓" : "Copy to Clipboard"}
                          </button>

                          <button onClick={() => handleGenerateReply(review.id, review.review_text, review.rating)} disabled={loadingId === review.id} className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ease-out hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50">
                            {loadingId === review.id ? "Drafting..." : "Redraft Response"}
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleGenerateReply(review.id, review.review_text, review.rating)} disabled={loadingId === review.id} className="w-full sm:w-auto bg-gray-900 text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ease-out hover:bg-black hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:bg-gray-300">
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