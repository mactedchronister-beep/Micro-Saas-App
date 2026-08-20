'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10">
        <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter flex items-center gap-2 transition-transform active:scale-95">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-lg leading-none pt-1">✦</span>
            </div>
            EchoReply
          </Link>
          
          <div className="space-x-6 flex items-center">
            {session ? (
              <>
                <button 
                  onClick={async () => { await supabase.auth.signOut(); setSession(null); }} 
                  className="text-sm px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold transition-all duration-200 ease-out hover:bg-gray-50 hover:shadow-sm active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Sign Out
                </button>
                <Link href="/dashboard" className="group text-sm px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold transition-all duration-200 ease-out hover:bg-black hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] active:shadow-inner focus:outline-none focus:ring-4 focus:ring-gray-300">
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                  Sign In
                </Link>
                <Link href="/dashboard" className="group text-sm px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold transition-all duration-200 ease-out hover:bg-black hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] active:shadow-inner focus:outline-none focus:ring-4 focus:ring-gray-300">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        <main className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-20">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-600 cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            EchoReply Pro is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 leading-tight">
            Automate your customer <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">reviews with AI.</span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
            Save 5 hours a week managing your reputation. Our AI drafts perfect, personalized responses to every customer review so you can focus on running your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/dashboard" className="group relative inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg transition-all duration-200 ease-out hover:bg-indigo-500 hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.97] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-indigo-500/30 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                {session ? 'Go to Dashboard' : 'Start Free Trial'}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
            
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-lg transition-all duration-200 ease-out hover:bg-gray-50 hover:border-gray-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.97] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-4 focus:ring-gray-200 cursor-pointer">
              How It Works
            </a>
          </div>
          
          <div className="mt-20 w-full max-w-5xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white ring-1 ring-gray-200 rounded-2xl shadow-2xl h-64 md:h-[400px] flex flex-col overflow-hidden">
              <div className="w-full border-b border-gray-100 bg-gray-50/80 p-3 flex items-center gap-2 rounded-t-xl">
                 <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                 <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                 <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="flex-1 bg-gray-50 relative overflow-hidden">
                <img src="/dashboard-preview.png" alt="EchoReply Dashboard" className="w-full h-full object-cover object-top" />
              </div>
            </div>
          </div>
        </main>

        <section id="features" className="py-24 bg-white border-t border-gray-100 relative z-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">How EchoReply Works</h2>
              <p className="text-xl text-gray-500 mt-4">Three simple steps to putting your customer service on autopilot.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">1</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Sync Your Account</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Connect your business profiles securely. We automatically pull in every new customer review the second it is posted.</p>
              </div>
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">2</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Drafts the Reply</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Our advanced AI instantly analyzes the sentiment and drafts a personalized, professional response tailored to the customer.</p>
              </div>
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">3</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Approve & Publish</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Review the draft in your dashboard. With one click, approve the response and automatically publish it live to the web.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-white border-t border-gray-100 py-12 relative z-20">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 cursor-default">
              <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-xs leading-none pt-0.5">✦</span>
              </div>
              <span className="font-bold text-gray-900 tracking-tight">EchoReply</span>
            </div>
            
            <p className="text-sm font-medium text-gray-400">
              © {new Date().getFullYear()} EchoReply LLC. All rights reserved.
            </p>
            
            <div className="flex gap-6 text-sm font-bold text-gray-400">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}