'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function Contact() {
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1500); // Fake a network request for the UI
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-lg leading-none pt-1">✦</span>
            </div>
            EchoReply
          </Link>
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-20 relative z-10 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wide uppercase">Get in Touch</div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">Let's talk about your business.</h1>
          <p className="text-xl text-gray-500 font-medium mb-8 leading-relaxed">Whether you have a question about pricing, need a custom integration, or just want to say hi, our team is ready to help.</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm text-xl">📍</div>
              <div>
                <p className="font-bold text-gray-900">Headquarters</p>
                <p className="text-gray-500 font-medium">Omaha, Nebraska</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm text-xl">✉️</div>
              <div>
                <p className="font-bold text-gray-900">Email Us</p>
                <p className="text-gray-500 font-medium">support@echoreply.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
          {status === 'sent' ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">✅</div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500 font-medium">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input type="text" required className="w-full p-4 border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white outline-none font-medium" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Work Email</label>
                <input type="email" required className="w-full p-4 border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white outline-none font-medium" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea required rows={4} className="w-full p-4 border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white outline-none resize-none font-medium" placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" disabled={status === 'sending'} className="w-full bg-gray-900 text-white p-4 rounded-xl font-bold transition-all duration-200 ease-out hover:bg-black hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-70 disabled:transform-none">
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}