import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter">EchoReply</div>
        <div className="space-x-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-black font-medium transition-colors">
            Sign In
          </Link>
          <Link href="/dashboard" className="px-5 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold tracking-wide">
          Introducing EchoReply Pro
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6">
          Automate your customer reviews with AI.
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mb-10">
          Save 5 hours a week managing your reputation. Our AI drafts perfect, personalized responses to every customer review so you can focus on running your business.
        </p>
        
        <div className="flex gap-4">
          <Link href="/dashboard" className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Start Free Trial
          </Link>
          <a href="#features" className="px-8 py-4 bg-white border border-gray-200 text-gray-800 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors">
            See How It Works
          </a>
        </div>
      </main>
      
      {/* Social Proof */}
      <div className="border-t border-gray-100 py-10 mt-10">
        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Trusted by local businesses</p>
        <div className="flex justify-center gap-8 text-3xl opacity-30 grayscale">
          {/* Placeholder for future logos */}
          <span>🏢</span>
          <span>☕</span>
          <span>🔧</span>
          <span>🍕</span>
        </div>
      </div>
    </div>
  );
}