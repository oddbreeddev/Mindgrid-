
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
        <h3 className="font-bold text-slate-800 text-xl mt-8">Log Files</h3>
        <p>
          MindGrid follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
        </p>
        <h3 className="font-bold text-slate-800 text-xl mt-8">Cookies and Web Beacons</h3>
        <p>
          Like any other website, MindGrid uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited.
        </p>
        <h3 className="font-bold text-slate-800 text-xl mt-8">Google DoubleClick DART Cookie</h3>
        <p>
          Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet.
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
