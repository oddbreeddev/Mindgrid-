
import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-6">Get in <span className="text-green-600">Touch</span></h1>
          <p className="text-slate-500 text-lg mb-10">Have questions about our tools, interested in partnership, or just want to say hello? Our team is ready to listen.</p>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Email Support</h4>
                <p className="text-slate-500">hello@mindgrid.com.ng</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Office</h4>
                <p className="text-slate-500">Yaba, Lagos State, Nigeria</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fab fa-whatsapp"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">WhatsApp Helpdesk</h4>
                <p className="text-slate-500">+234 (0) 800-MIND-GRID</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Subject</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all">
                <option>General Inquiry</option>
                <option>Technical Issue</option>
                <option>Partnership</option>
                <option>Advertising</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Message</label>
              <textarea rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all" placeholder="How can we help you?"></textarea>
            </div>
            <button className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
