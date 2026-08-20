import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900">
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-lg leading-none pt-1">✦</span>
            </div>
            EchoReply
          </Link>
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wide uppercase">Legal Document</div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-gray-500 font-medium">Effective Date: August 20, 2026</p>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">1</div>
              <h2 className="text-2xl font-bold text-gray-900">Account Responsibilities</h2>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
          </section>

          <section className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">2</div>
              <h2 className="text-2xl font-bold text-gray-900">Subscriptions & Refunds</h2>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">EchoReply Pro is billed on a subscription basis ($29/month). You will be billed in advance on a recurring and periodic basis. We offer a 14-day money-back guarantee for all new users.</p>
          </section>
        </div>
      </main>
    </div>
  );
}