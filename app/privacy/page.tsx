import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Simple Navigation */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold tracking-tighter flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs leading-none pt-0.5">✦</span>
            </div>
            EchoReply
          </Link>
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Document Content */}
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-gray-500 font-medium">Last updated: August 20, 2026</p>
        </div>

        <div className="prose prose-lg prose-indigo text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              At EchoReply LLC ("we", "our", or "us"), we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. The Data We Collect</h2>
            <p className="leading-relaxed mb-4">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes billing address, email address and telephone numbers.</li>
              <li><strong>Financial Data:</strong> Payments are processed securely via Stripe. We do not store your full credit card details on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
            <p className="leading-relaxed">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this privacy policy or our privacy practices, please contact us at support@echoreply.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}