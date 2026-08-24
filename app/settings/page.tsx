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
  
  // NEW: Granular AutoPilot States
  const [ap5Star, setAp5Star] = useState(false);
  const [ap4Star, setAp4Star] = useState(false);
  const [ap3Star, setAp3Star] = useState(false);
  const [ap2Star, setAp2Star] = useState(false);
  const [ap1Star, setAp1Star] = useState(false);
  
  // NEW: Human Delay Timer (in minutes)
  const [delayMinutes, setDelayMinutes] = useState(60);

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
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setBusinessName(profile.business_name || '');
          setOwnerName(profile.owner_name || '');
          setAlertPhone(profile.alert_phone || '');
          setSmsAlerts(profile.sms_alerts || false);
          // For demo purposes, we will default 4 and 5 stars to true if the old auto_pilot was true
          setAp5Star(profile.auto_pilot || false);
          setAp4Star(profile.auto_pilot || false);
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
        alert_phone: alertPhone,
        sms_alerts: smsAlerts,
        // We will map ap5Star to the old database column for now so it doesn't break
        auto_pilot: ap5Star 
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

      <div className="max-w-3xl mx-auto pt-12 px-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Business Settings</h1>
        <p className="text-gray-500 font-medium mb-10 text-lg">Customize your AI automation, damage control, and business profile.</p>

        <form onSubmit={handleSave} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Business Name</label>
              <input 
                type="text" 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)} 
                placeholder="e.g. Lynch Residential Cleaning"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none font-medium text-gray-900 bg-gray-50 hover:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Owner / Sign-off Name</label>
              <input 
                type="text" 
                value={ownerName} 
                onChange={(e) => setOwnerName(e.target.value)} 
                placeholder="e.g. Mac"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none font-medium text-gray-900 bg-gray-50 hover:bg-white transition-colors"
              />
            </div>
          </div>

          {/* NEW: Granular AutoPilot Matrix */}
          <div className="p-6 md:p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm">⚡</div>
                <div>
                  <h3 className="font-extrabold text-indigo-900 text-xl">AutoPilot Matrix</h3>
                  <p className="text-sm font-medium text-indigo-700 mt-1">Select which star ratings the AI should instantly publish without your manual approval.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-indigo-100 divide-y divide-indigo-50 mb-6">
              {[
                { label: "5-Star Reviews", desc: "Instantly thank glowing reviews.", state: ap5Star, set: setAp5Star, color: "text-emerald-500" },
                { label: "4-Star Reviews", desc: "Acknowledge good feedback.", state: ap4Star, set: setAp4Star, color: "text-emerald-400" },
                { label: "3-Star Reviews", desc: "Address mixed experiences.", state: ap3Star, set: setAp3Star, color: "text-amber-500" },
                { label: "2-Star Reviews", desc: "Handle negative feedback.", state: ap2Star, set: setAp2Star, color: "text-rose-400" },
                { label: "1-Star Reviews", desc: "Immediate apology & de-escalation.", state: ap1Star, set: setAp1Star, color: "text-rose-500" }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                  <div>
                    <span className={`font-extrabold ${item.color} block mb-0.5`}>{item.label}</span>
                    <span className="text-xs font-medium text-gray-500">{item.desc}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={item.state} onChange={(e) => item.set(e.target.checked)} />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                  </label>
                </div>
              ))}
            </div>

            {/* NEW: Human Delay Slider */}
            <div className="bg-white p-5 rounded-2xl border border-indigo-100">
              <div className="flex justify-between items-center mb-4">
                <span className="font-extrabold text-indigo-900 text-sm">Humanize Publish Delay</span>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">{delayMinutes} Minutes</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="240" 
                step="15"
                value={delayMinutes} 
                onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
                className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
                <span>Instant</span>
                <span>4 Hours</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-rose-50/50 rounded-[2rem] border border-rose-100 mb-10">
            <div className="flex justify-between items-start md:items-center mb-4 flex-col md:flex-row gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm">🚨</div>
                 <div>
                   <h3 className="font-extrabold text-rose-900 text-xl">Damage Control SMS</h3>
                   <p className="text-sm font-medium text-rose-700 mt-1 max-w-md">Get an instant text alert the exact second a 1-star or 2-star review hits your profile.</p>
                 </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
              </label>
            </div>
            
            {smsAlerts && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-white p-5 rounded-2xl border border-rose-100 mt-4">
                <label className="block text-xs font-bold text-rose-800 mb-2 uppercase tracking-wide">Mobile Number</label>
                <input 
                  type="tel" 
                  value={alertPhone} 
                  onChange={(e) => setAlertPhone(e.target.value)} 
                  placeholder="(555) 123-4567"
                  className="w-full p-4 border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 outline-none font-medium text-rose-900 bg-gray-50 focus:bg-white transition-colors"
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