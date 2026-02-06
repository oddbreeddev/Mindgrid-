
import React from 'react';
import { Link } from 'react-router-dom';

const ToolsPage: React.FC = () => {
  const tools = [
    {
      title: 'CGPA Calculator',
      description: 'The standard 5.0 and 4.0 scale calculator used by Nigerian Universities.',
      icon: 'fa-calculator',
      path: '/tools/cgpa',
      color: 'bg-indigo-600',
      tag: 'Academic'
    },
    {
      title: 'Study Timetable',
      description: 'Generate a personalized study schedule tailored to your course load.',
      icon: 'fa-calendar-alt',
      path: '/tools/timetable',
      color: 'bg-green-600',
      tag: 'New'
    },
    {
      title: 'Tech Roadmaps',
      description: 'Visual paths to becoming a Software Engineer or Designer in Nigeria.',
      icon: 'fa-map-signs',
      path: '/blog',
      color: 'bg-slate-900',
      tag: 'Career'
    },
    {
      title: 'JAMB Navigator',
      description: 'Check latest syllabus, subject combinations, and past news.',
      icon: 'fa-graduation-cap',
      path: '/ai-hub',
      color: 'bg-orange-500',
      tag: 'Exam Prep'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Student <span className="text-green-600">Utility Hub</span></h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">Tools designed to simplify your academic life and fast-track your tech career.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool, idx) => (
          <Link 
            key={idx}
            to={tool.path}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col items-start overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-2 h-full ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            
            <div className={`w-14 h-14 ${tool.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-xl transform group-hover:-translate-y-1 group-hover:rotate-3 transition-all`}>
              <i className={`fas ${tool.icon}`}></i>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tool.tag}</span>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight">{tool.title}</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">{tool.description}</p>
            
            <div className="mt-auto flex items-center gap-2 text-slate-900 font-bold text-sm group-hover:text-green-600 transition-colors">
              Launch Tool <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Community Callout */}
      <div className="mt-20 bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4">Suggest a Tool</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">Is there a calculator or resource you need for your specific department? Let us know!</p>
          <Link to="/contact" className="bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-xl font-bold transition-all inline-block">
            Submit Request
          </Link>
        </div>
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <i className="fas fa-tools text-[20rem] absolute -right-10 -bottom-10 rotate-12"></i>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
