import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  BookOpen, 
  Calculator, 
  Search, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Library,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SocialBuzzCarousel from '../components/SocialBuzzCarousel';
import ShareButton from '../components/ShareButton';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const name = user?.email?.split('@')[0] || 'Scholar';

  const tools = [
    { title: 'AI Study Friend', desc: 'Ask any school question.', icon: Cpu, path: '/ai-hub', color: 'bg-blue-600' },
    { title: 'Student Feed', desc: 'See what is trending.', icon: MessageSquare, path: '/feed', color: 'bg-rose-600' },
    { title: 'Grade Checker', desc: 'Calculate your GPA.', icon: Calculator, path: '/tools/cgpa', color: 'bg-emerald-600' },
    { title: 'Study Vault', desc: 'Handy reading guides.', icon: Library, path: '/library', color: 'bg-indigo-600' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <section className="pt-16 pb-12 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="space-y-4 animate-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>Helper Active</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Hello, <br/>
              <span className="text-blue-500 capitalize">{name}.</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-sm">
              Ready to learn something new today? Your tools are ready.
            </p>
            <div className="pt-2">
               <ShareButton 
                title="Join me on MindGrid!"
                text="The best place for Nigerian students to study and learn tech skills."
                variant="outline"
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col justify-center min-w-[140px]">
              <span className="text-gray-500 text-[10px] font-bold uppercase mb-1">Study Level</span>
              <span className="text-2xl font-bold text-blue-500">Tier 1</span>
            </div>
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col justify-center min-w-[140px]">
              <span className="text-gray-500 text-[10px] font-bold uppercase mb-1">Badges</span>
              <span className="text-2xl font-bold text-emerald-500">4 Unlocked</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((t, idx) => (
            <Link key={idx} to={t.path} className="group bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:bg-white/10 transition-all duration-300">
              <div className={`${t.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <t.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.title}</h3>
              <p className="text-gray-500 text-sm mb-6">{t.desc}</p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-blue-500 group-hover:text-white transition-colors">
                Open <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-8 max-w-7xl mx-auto mb-20">
        <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <TrendingUp className="text-blue-500" size={28} />
                Student Buzz
              </h2>
              <p className="text-gray-500">What is happening in schools right now.</p>
            </div>
            <Link to="/blog" className="text-[10px] font-bold uppercase bg-blue-500 text-white px-8 py-4 rounded-xl hover:bg-blue-600 transition-all text-center">
              View All News
            </Link>
          </div>
          <SocialBuzzCarousel />
        </div>
      </section>

      <section className="px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/tools/course-finder" className="flex items-center gap-6 p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Search size={28} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Course Finder</h4>
              <p className="text-gray-500 text-sm">Find entry marks for any uni.</p>
            </div>
          </Link>

          <Link to="/study" className="flex items-center gap-6 p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <BookOpen size={28} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Study Roadmap</h4>
              <p className="text-gray-500 text-sm">Pick up where you left off.</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;