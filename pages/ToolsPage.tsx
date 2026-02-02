
import React from 'react';
import { Link } from 'react-router-dom';

const ToolsPage: React.FC = () => {
  const tools = [
    {
      title: 'CGPA Calculator',
      description: 'The ultimate 5.0 and 4.0 scale calculator for university students.',
      icon: 'fa-calculator',
      path: '/tools/cgpa',
      color: 'bg-blue-600'
    },
    {
      title: 'Study Timetable',
      description: 'Plan your week and let AI suggest a balanced study routine for your exams.',
      icon: 'fa-calendar-alt',
      path: '/tools/timetable',
      color: 'bg-green-600',
      tag: 'New'
    },
    {
      title: 'Tech Resource Hub',
      description: 'Developer roadmaps, free coding books, and local tech community links.',
      icon: 'fa-terminal',
      path: '/blog',
      color: 'bg-slate-900',
    },
    {
      title: 'JAMB Score Predictor',
      description: 'Predict your likely JAMB score based on mock performance.',
      icon: 'fa-chart-line',
      path: '/tools',
      color: 'bg-orange-500',
      tag: 'Coming Soon'
    },
    {
      title: 'Scholarship Checker',
      description: 'Automated tool to find scholarships you are eligible for.',
      icon: 'fa-graduation-cap',
      path: '/tools',
      color: 'bg-purple-600',
      tag: 'Updated'
    },
    {
      title: 'Subject Combinator',
      description: 'Find the right JAMB subject combination for your course.',
      icon: 'fa-book-open',
      path: '/tools',
      color: 'bg-green-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-slate-800 mb-4">Student <span className="text-green-600">Power Tools</span></h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Everything you need to survive and thrive in school and the tech world.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
            {tool.tag && (
              <span className={`absolute top-6 right-6 ${tool.tag === 'New' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter`}>
                {tool.tag}
              </span>
            )}
            <div className={`w-14 h-14 ${tool.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg transform group-hover:rotate-6 group-hover:scale-110 transition-transform`}>
              <i className={`fas ${tool.icon}`}></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">{tool.title}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-grow leading-relaxed">{tool.description}</p>
            <Link 
              to={tool.path}
              className="bg-slate-50 text-slate-800 px-6 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-green-600 group-hover:text-white transition-all"
            >
              Access Now <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolsPage;
