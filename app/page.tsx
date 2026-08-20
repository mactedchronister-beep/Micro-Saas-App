import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10">
        <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
          <div className="text-2xl font-extrabold tracking-tighter flex items-center gap-2 cursor-default">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-lg leading-none pt-1">✦</span>
            </div>
            EchoReply
          </div>
          <div className="space-x-6 flex items-center">
            <Link href="/dashboard" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard" className="group text-sm px-5 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-400/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
              Get Started
            </Link>
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
            <Link href="/dashboard" className="group relative inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg transition-all duration-200 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-95 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
            
            {/* THIS LINK NOW WORKS SMOOTHLY */}
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer">
              See How It Works
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
              <div className="flex-1 bg-gray-50 flex items-center justify-center flex-col gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="w-48 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                <p className="text-gray-400 font-medium text-sm mt-4 uppercase tracking-widest">Dashboard Interface Preview</p>
              </div>
            </div>
          </div>
        </main>

        {/* NEW FEATURES SECTION */}
        <section id="features" className="py-24 bg-white border-t border-gray-100 relative z-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">How EchoReply Works</h2>
              <p className="text-xl text-gray-500 mt-4">Three simple steps to putting your customer service on autopilot.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">1</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Sync Your Account</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Connect your business profiles securely. We automatically pull in every new customer review the second it is posted.</p>
              </div>
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">2</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Drafts the Reply</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Our advanced AI instantly analyzes the sentiment and drafts a personalized, professional response tailored to the customer.</p>
              </div>
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">3</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Approve & Publish</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Review the draft in your dashboard. With one click, approve the response and automatically publish it live to the web.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}