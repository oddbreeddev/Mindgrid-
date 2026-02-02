import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black text-slate-800 mb-8">Terms of <span className="text-green-600">Service</span></h1>
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <p className="text-sm text-slate-400 italic">Last Updated: March 2024</p>
        <section>
          <h3 className="font-bold text-slate-800 text-xl">1. Acceptance of Terms</h3>
          <p>By accessing and using MindGrid, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>
        <section>
          <h3 className="font-bold text-slate-800 text-xl">2. AI Content Disclaimer</h3>
          <p>MindGrid provides AI-generated educational content for informational purposes. While we strive for accuracy, students should always verify critical information (such as exam dates or cutoff marks) with official bodies like JAMB, WAEC, or their respective Universities.</p>
        </section>
        <section>
          <h3 className="font-bold text-slate-800 text-xl">3. User Conduct</h3>
          <p>Users are prohibited from using the site for any illegal purposes or to distribute malware. Any attempt to scrape our AI Hub results without permission is strictly prohibited.</p>
        </section>
        <section>
          <h3 className="font-bold text-slate-800 text-xl">4. External Links</h3>
          <p>MindGrid contains links to external websites. We are not responsible for the content or privacy practices of these third-party sites.</p>
        </section>
        <section>
          <h3 className="font-bold text-slate-800 text-xl">5. Limitation of Liability</h3>
          <p>MindGrid shall not be liable for any indirect, incidental, or consequential damages resulting from the use or the inability to use the service.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;