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
  
  const [autoPilot, setAutoPilot] = useState(false);
  // NEW: Damage Control SMS State
  const [alertPhone, setAlertPhone] = useState('');
  const [smsAlerts, setSmsAlerts] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, owner_name, auto_pilot, alert_phone, sms_alerts')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setBusinessName(profile.business_name || '');
          setOwnerName(profile.owner_name || '');
          setAutoPilot(profile.auto_pilot || false);
          setAlertPhone(profile.alert_phone || '');
          setSmsAlerts(profile.sms_alerts || false);
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
      .update({ 
        business_name: businessName, 
        owner_name: ownerName,
        auto_pilot: autoPilot,
        alert_phone: alertPhone,
        sms_alerts: smsAlerts
      })
      .eq('id', session?.user?.id);

    if (error) {
      setSaveStatus("Error saving details.");
    } else {
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fafafa] font-bold text-gray-500">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-extrabold text-gray-900 flex items-center gap-3 hover:-translate-x-1 transition-transform">
            <span className="text-2xl">←</span> Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto pt-12 px-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Business Settings</h1>
        <p className="text-gray-500 font-medium mb-10 text-lg">Customize how your AI responds and automates your reputation.</p>

        <form onSubmit={handleSave} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Business Name</label>
            <input 
              type="text" 
              value={businessName} 
              onChange={(e) => setBusinessName(e.target.value)} 
              placeholder="e.g. Lynch Residential Cleaning"
              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none font-medium text-gray-900 bg-gray-50 hover:bg-white transition-colors"
            />
          </div>

          <div className="mb-10">
            <label className="block text-sm font-bold text-gray-700 mb-2">Owner / Sign-off Name</label>
            <input 
              type="text" 
              value={ownerName} 
              onChange={(e) => setOwnerName(e.target.value)} 
              placeholder="e.g. Mac"
              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none font-medium text-gray-900 bg-gray-50 hover:bg-white transition-colors"
            />
          </div>

          {/* Auto-Pilot Premium Feature Toggle */}
          <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">⚡</div>
                 <h3 className="font-extrabold text-indigo-900 text-lg">Auto-Pilot 5-Star Replies</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoPilot} onChange={(e) => setAutoPilot(e.target.checked)} />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
              </label>
            </div>
            <p className="text-sm font-medium text-indigo-700 mt-3">
              When enabled, EchoReply will automatically draft and publish a warm "Thank you" for any 5-star review that does not contain text. Zero manual approval required.
            </p>
          </div>

          {/* NEW: Damage Control SMS Card */}
          <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 mb-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center font-bold text-xl">🚨</div>
                 <h3 className="font-extrabold text-rose-900 text-lg">Damage Control SMS</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
              </label>
            </div>
            <p className="text-sm font-medium text-rose-700 mb-4">
              Get an instant text message to your phone the exact second a 1-star or 2-star review hits your profile, allowing you to de-escalate immediately.
            </p>
            {smsAlerts && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-rose-800 mb-2 uppercase tracking-wide">Mobile Number</label>
                <input 
                  type="tel" 
                  value={alertPhone} 
                  onChange={(e) => setAlertPhone(e.target.value)} 
                  placeholder="(555) 123-4567"
                  className="w-full p-3 border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 outline-none font-medium text-rose-900 bg-white"
                />
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-black active:scale-[0.98] transition-all flex justify-center items-center shadow-lg text-lg">
            {saveStatus === "Saving..." ? "Saving..." : saveStatus === "Saved successfully!" ? "Settings Saved ✓" : "Save Configuration"}
          </button>
        </form>
      </div>
    </div>
  );
}