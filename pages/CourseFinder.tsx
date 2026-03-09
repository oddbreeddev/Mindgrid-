
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchCourseRequirements } from '../services/geminiService';
import { useToast } from '../context/ToastContext';
import ShareButton from '../components/ShareButton';

const CourseFinder: React.FC = () => {
  const { showToast } = useToast();
  const [course, setCourse] = useState('');
  const [university, setUniversity] = useState('');
  const [result, setResult] = useState<{ text: string, sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !university) {
      showToast('Please enter both course and university', 'info');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await fetchCourseRequirements(course, university);
      setResult(data);
    } catch (err) {
      showToast('Failed to fetch requirements. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 mb-4">Admissions <span className="text-blue-600">Navigator</span></h1>
        <p className="text-slate-500 font-medium">Find subject combinations and cutoff marks for any Nigerian University.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 mb-12">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Course of Study</label>
            <input 
              type="text" 
              placeholder="e.g. Civil Engineering"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">University Name</label>
            <input 
              type="text" 
              placeholder="e.g. University of Ibadan"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-xs tracking-widest mt-2"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
            {loading ? 'Searching Admission Portals...' : 'Find Requirements'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden animate-in">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black">{course}</h2>
              <p className="text-blue-400 text-sm font-bold">{university}</p>
            </div>
            <ShareButton 
              title={`Admission Requirements for ${course} at ${university}`}
              text="Found the latest subject combination and cutoff marks on MindGrid!"
              variant="outline"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div className="p-8 md:p-12 prose prose-slate max-w-none 
            prose-h2:text-slate-800 prose-h2:font-black prose-h2:mt-8
            prose-h3:text-blue-600 prose-h3:font-black
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-strong:text-slate-900 prose-strong:font-black
            prose-ul:list-disc prose-ul:pl-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.text}
            </ReactMarkdown>

            {result.sources.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-100 not-prose">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Verification Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
                      <i className="fas fa-external-link-alt text-[8px]"></i> {s.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-blue-50 p-6 text-center">
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">AI Disclaimer</p>
            <p className="text-[10px] text-blue-600 font-medium">Always verify with the official University brochure or JAMB CAPS portal.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Scanning University Bulletins...</p>
        </div>
      )}
    </div>
  );
};

export default CourseFinder;
