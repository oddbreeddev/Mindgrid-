
import React from 'react';

const CareersPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white mb-16 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Your Career in Nigeria Starts <span className="text-green-400">Here.</span></h1>
          <p className="text-slate-300 text-lg mb-8">Discover internships, graduate trainee programs, and professional opportunities from Nigeria's top employers.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Job title or keywords" 
              className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 flex-grow focus:bg-white/20 outline-none"
            />
            <button className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-400 transition-colors">Search Jobs</button>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-20 hidden lg:block">
           <i className="fas fa-briefcase text-[15rem] absolute -right-10 top-10 transform -rotate-12"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Job Type</h3>
            <div className="space-y-2">
              {['Full-time', 'Internship', 'Graduate Trainee', 'Part-time'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded text-green-600 focus:ring-green-500" />
                  <span className="text-sm text-slate-600 group-hover:text-green-600">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Top Cities</h3>
            <div className="flex flex-wrap gap-2">
              {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Enugu'].map(city => (
                <button key={city} className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs text-slate-600 hover:border-green-500 hover:text-green-600">{city}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-building text-slate-400 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Graduate Trainee Program 2024</h3>
                    <p className="text-green-600 font-semibold text-sm">Access Bank Plc</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span><i className="fas fa-map-marker-alt mr-1"></i> Lagos, Nigeria</span>
                      <span><i className="fas fa-clock mr-1"></i> Posted 3 days ago</span>
                    </div>
                  </div>
                </div>
                <button className="bg-slate-50 text-slate-700 hover:bg-green-600 hover:text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors border border-slate-100">Apply Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
