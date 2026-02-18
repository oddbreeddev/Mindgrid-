
import React, { useState, useEffect } from 'react';
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
  GraduationCap,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboardStats } from '../services/dataService';
import SocialBuzzCarousel from '../components/SocialBuzzCarousel';

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ completed: 12, cgpa: '4.21', points: 142 });
  const userGreeting = user?.email?.split('@')[0] || 'Scholar';

  const dashboardActions = [
    { 
      title: 'AI Study Tutor', 
      desc: 'Ask complex questions and get researched answers.', 
      icon: Cpu, 
      path: '/ai-hub', 
      color: 'bg-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    { 
      title: 'Study Hub', 
      desc: 'Resume your JAMB, WAEC or Tech roadmap.', 
      icon: BookOpen, 
      path: '/study', 
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-500/20'
    },
    { 
      title: 'Scholars Feed', 
      desc: 'Join the discussion with other Nigerian students.', 
      icon: MessageCircle, 
      path: '/feed', 
      color: 'bg-pink-600',
      shadow: 'shadow-pink-500/20'
    },
    { 
      title: 'CGPA Tracker', 
      desc: 'Calculate and store your academic records.', 
      icon: Calculator, 
      path: '/tools/cgpa', 
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      {/* Top Banner */}
      <section className="pt-12 pb-16 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} />
              <span>Session Active</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
              Welcome back, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 capitalize">
                {userGreeting}.
              </span>
            </h1>
            <p className="text-gray-400 font-medium max-w-md">
              Your academic power-suite is ready. What are we mastering today?
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-center min-w-[140px]">
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">GPA</span>
              <span className="text-3xl font-black text-blue-500">4.21</span>
            </div>
            <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-center min-w-[140px]">
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Lessons</span>
              <span className="text-3xl font-black text-emerald-500">12</span>
            </div>
            <div className="hidden md:flex bg-blue-600 p-6 rounded-[2rem] flex-col justify-center min-w-[140px] shadow-xl shadow-blue-500/20">
              <span className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Rank</span>
              <span className="text-3xl font-black text-white">Elite</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Actions Grid */}
      <section className="px-8 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardActions.map((action, idx) => (
            <Link 
              key={idx} 
              to={action.path}
              className="group bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.08] hover:border-blue-500/30 transition-all duration-500 animate-in"
              style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
            >
              <div className={`${action.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl ${action.shadow} group-hover:scale-110 transition-transform`}>
                <action.icon size={28} />
              </div>
              <h3 className="text-xl font-black mb-2 group-hover:text-blue-400 transition-colors">{action.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">{action.desc}</p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                Launch Node <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Intelligence Section */}
      <section className="px-8 max-w-7xl mx-auto mb-20">
        <div className="bg-white/5 rounded-[3.5rem] p-10 md:p-16 border border-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
                  <TrendingUp className="text-blue-500" />
                  Real-time Intelligence
                </h2>
                <p className="text-gray-500 text-sm font-medium">What's buzzing across the Nigerian student ecosystem right now.</p>
              </div>
              <Link to="/blog" className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 hover:text-white transition-colors bg-blue-500/10 px-6 py-3 rounded-xl border border-blue-500/20">
                View All Intelligence
              </Link>
            </div>
            
            <div className="invert brightness-200 contrast-100 grayscale-[0.5]">
              <SocialBuzzCarousel />
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-[40%] h-full bg-blue-600/5 blur-[120px] pointer-events-none"></div>
        </div>
      </section>

      {/* Suggested for You */}
      <section className="px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-600">Suggested Operations</h2>
          <div className="h-px flex-grow bg-white/5"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/library" className="flex items-center gap-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.08] transition-all group">
            <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-slate-700 group-hover:text-white transition-all">
              <Library size={28} />
            </div>
            <div>
              <h4 className="font-black text-lg">Library Archive</h4>
              <p className="text-gray-500 text-sm">Browse 500+ curated academic guides.</p>
            </div>
          </Link>

          <Link to="/tools/course-finder" className="flex items-center gap-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.08] transition-all group">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Search size={28} />
            </div>
            <div>
              <h4 className="font-black text-lg">Admission Navigator</h4>
              <p className="text-gray-500 text-sm">Check departmental cutoff marks and combinations.</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
