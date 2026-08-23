'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const [session, setSession] = useState<any>(null);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, owner_name')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setBusinessName(profile.business_name || '');
          setOwnerName(profile.owner_name || '');
        }
      }
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Saving...");
    
    const { error } = await supabase
      .from('profiles')
      .update({ business_name: businessName, owner_name: ownerName })
      .eq('id', session?.user?.id);

    if (error) {
      setSaveStatus("Error saving details.");
    } else {
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="text-2xl">←</span> Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto pt-12 px-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Business Settings</h1>
        <p className="text-gray-500 font-medium mb-10">Customize how your AI responds to customers.</p>

        <form onSubmit={handleSave} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Business Name</label>
            <input 
              type="text" 
              value={businessName} 
              onChange={(e) => setBusinessName(e.target.value)} 
              placeholder="e.g. Lynch Residential Cleaning"
              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none font-medium text-gray-900"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Owner / Sign-off Name</label>
            <input 
              type="text" 
              value={ownerName} 
              onChange={(e) => setOwnerName(e.target.value)} 
              placeholder="e.g. Mac"
              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none font-medium text-gray-900"
            />
          </div>

          <button type="submit" className="w-full bg-black text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex justify-center items-center gap-2">
            {saveStatus === "Saving..." ? "Saving..." : saveStatus === "Saved successfully!" ? "Saved ✓" : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}