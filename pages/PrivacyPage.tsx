import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black text-slate-800 mb-8">Privacy <span className="text-green-600">Policy</span></h1>
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <p className="text-sm text-slate-400 italic">Last Updated: March 2024</p>
        <p>
          At MindGrid, accessible from mindgrid.com.ng, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by MindGrid and how we use it.
        </p>

        <h3 className="font-bold text-slate-800 text-xl mt-8">Google AdSense & DoubleClick Cookie</h3>
        <p>
          Google, as a third-party vendor, uses cookies to serve ads on MindGrid. Google's use of the DART cookie enables it to serve ads to our users based on their visit to MindGrid and other sites on the Internet. Users may choose to decline the use of the DART cookie by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" className="text-green-600 underline">https://policies.google.com/technologies/ads</a>
        </p>

        <h3 className="font-bold text-slate-800 text-xl mt-8">Our Advertising Partners</h3>
        <p>Some of advertisers on our site may use cookies and web beacons. Our advertising partners include:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Google AdSense:</strong> They have their own Privacy Policy for their policies on user data.</li>
        </ul>

        <h3 className="font-bold text-slate-800 text-xl mt-8">Information We Collect</h3>
        <p>
          We collect personal information that you provide to us directly, such as your name and email when you use our contact form or subscribe to our newsletter. We also collect usage data (IP address, browser type) via standard log files.
        </p>

        <h3 className="font-bold text-slate-800 text-xl mt-8">Data Protection Rights</h3>
        <p>
          We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the right to access, rectification, and erasure of their personal data.
        </p>

        <h3 className="font-bold text-slate-800 text-xl mt-8">Consent</h3>
        <p>
          By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;