
import React, { useState, useEffect } from 'react';
import { fetchCareerOpportunities } from '../services/geminiService';

const CareerSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex gap-4 w-full">
        <div className="w-14 h-14 bg-slate-100 rounded-xl flex-shrink-0"></div>
        <div className="flex-grow space-y-3">
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
          <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          <div className="flex gap-4">
            <div className="h-2 bg-slate-100 rounded w-1/4"></div>
            <div className="h-2 bg-slate-100 rounded w-1/4"></div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-32 h-10 bg-slate-100 rounded-xl"></div>
    </div>
  </div>
);

const CareersPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadJobs = async (query?: string, forceRefresh: boolean = false) => {
    if (forceRefresh) setIsRefreshing(true);
    setIsLoading(true);
    try {
      const data = await fetchCareerOpportunities(query, forceRefresh);
      setJobs(data);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleSearch = () => {
    loadJobs(searchTerm, false);
  };

  const handleRefresh = () => {
    loadJobs(searchTerm, true);
  };

  const jobTypes = ['Full-time', 'Internship', 'Graduate Trainee', 'Part-time'];

  const toggleType = (type: string) => {
    setActiveTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const filteredJobs = activeTypes.length > 0 
    ? jobs.filter(job => activeTypes.some(type => job.type?.toLowerCase().includes(type.toLowerCase())))
    : jobs;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white mb-16 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Your Career in Nigeria Starts <span className="text-green-400">Here.</span></h1>
          <p className="text-slate-300 text-lg mb-8">Discover internships, graduate trainee programs, and professional opportunities from Nigeria's top employers, verified in real-time.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="e.g. Frontend Intern, Bank Trainee..." 
              className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 flex-grow focus:bg-white/20 outline-none text-white placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-400 transition-colors shadow-lg active:scale-95"
            >
              Search Jobs
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-20 hidden lg:block">
           <i className="fas fa-briefcase text-[15rem] absolute -right-10 top-10 transform -rotate-12"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-filter text-green-600 text-sm"></i> Filter by Type
            </h3>
            <div className="space-y-2">
              {jobTypes.map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-slate-300 text-green-600 focus:ring-green-500" 
                    checked={activeTypes.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                  <span className={`text-sm ${activeTypes.includes(type) ? 'text-green-600 font-bold' : 'text-slate-600'} group-hover:text-green-600 transition-colors`}>
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
             <h4 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-2">
               <i className="fas fa-lightbulb"></i> Career Tip
             </h4>
             <p className="text-xs text-green-700 leading-relaxed">
               Most Nigerian Graduate Trainee programs open in the first quarter of the year. Keep your CV ready and LinkedIn profile optimized!
             </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-800">
              {isLoading ? 'Finding Opportunities...' : `Available Openings (${filteredJobs.length})`}
            </h2>
            {!isLoading && (
              <button onClick={handleRefresh} disabled={isRefreshing} className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1">
                <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`}></i>
                Refresh List
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => <CareerSkeleton key={i} />)}
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job, i) => (
              <div 
                key={i} 
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group animate-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-50 transition-colors">
                      <i className="fas fa-building text-slate-300 group-hover:text-green-500 text-xl transition-colors"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-green-600 transition-colors">{job.title}</h3>
                      <p className="text-green-600 font-semibold text-sm">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        <span><i className="fas fa-map-marker-alt mr-1"></i> {job.location}</span>
                        <span><i className="fas fa-tag mr-1"></i> {job.type}</span>
                        {job.postedDate && <span><i className="fas fa-clock mr-1"></i> {job.postedDate}</span>}
                      </div>
                    </div>
                  </div>
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto bg-slate-50 text-slate-700 hover:bg-green-600 hover:text-white px-8 py-3 rounded-xl font-bold text-sm transition-all border border-slate-100 text-center shadow-sm active:scale-95"
                  >
                    View Details
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100">
               <i className="fas fa-search text-slate-100 text-6xl mb-4"></i>
               <p className="text-slate-400 font-medium">No careers found matching your criteria. Try searching for something else!</p>
               <button onClick={() => loadJobs()} className="mt-4 text-green-600 font-bold hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
