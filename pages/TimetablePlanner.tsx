
import React, { useState, useEffect } from 'react';
import { generateAISchedule } from '../services/geminiService';

interface StudySession {
  subject: string;
  topic: string;
}

interface DayPlan {
  day: string;
  sessions: StudySession[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COMMON_SUBJECTS = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature', 'Commerce', 'Financial Accounting', 'CRS/IRS', 'Coding/Tech'];

const TimetablePlanner: React.FC = () => {
  const [timetable, setTimetable] = useState<DayPlan[]>([]);
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('Monday');

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('mindgrid_timetable');
    if (saved) {
      setTimetable(JSON.parse(saved));
    } else {
      // Initialize empty timetable
      setTimetable(DAYS.map(d => ({ day: d, sessions: [] })));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (timetable.length > 0) {
      localStorage.setItem('mindgrid_timetable', JSON.stringify(timetable));
    }
  }, [timetable]);

  const handleAISchedule = async () => {
    if (!goal.trim()) return;
    setIsGenerating(true);
    const result = await generateAISchedule(goal);
    if (result && Array.isArray(result)) {
      setTimetable(result);
    }
    setIsGenerating(false);
  };

  const addSession = (day: string) => {
    const newSession = { subject: 'Mathematics', topic: 'New Topic' };
    setTimetable(prev => prev.map(d => d.day === day ? { ...d, sessions: [...d.sessions, newSession] } : d));
  };

  const removeSession = (day: string, idx: number) => {
    setTimetable(prev => prev.map(d => d.day === day ? { ...d, sessions: d.sessions.filter((_, i) => i !== idx) } : d));
  };

  const updateSession = (day: string, idx: number, field: keyof StudySession, val: string) => {
    setTimetable(prev => prev.map(d => d.day === day ? {
      ...d,
      sessions: d.sessions.map((s, i) => i === idx ? { ...s, [field]: val } : s)
    } : d));
  };

  const currentDayPlan = timetable.find(d => d.day === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Study <span className="text-green-600">Planner</span></h1>
          <p className="text-slate-500">Master your time. Win your exams.</p>
        </div>
        
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex-grow max-w-lg">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3 px-2">AI Smart Scheduler</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. JAMB Science Student, WAEC Revision..."
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex-grow outline-none focus:ring-2 focus:ring-green-500 text-sm"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <button 
              onClick={handleAISchedule}
              disabled={isGenerating}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
              {isGenerating ? 'Planning...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Days Selection */}
        <div className="lg:col-span-3 space-y-2">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveTab(day)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-between ${activeTab === day ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
            >
              {day}
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === day ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                {timetable.find(d => d.day === day)?.sessions.length || 0}
              </span>
            </button>
          ))}
          <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100">
            <h4 className="font-bold text-blue-700 text-sm mb-2">Pro Tip:</h4>
            <p className="text-xs text-blue-600 leading-relaxed">Study in 50-minute blocks with 10-minute breaks for maximum focus.</p>
          </div>
        </div>

        {/* Sessions View */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">{activeTab}'s Schedule</h2>
              <button 
                onClick={() => addSession(activeTab)}
                className="bg-green-50 text-green-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-100 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Add Session
              </button>
            </div>

            <div className="space-y-4">
              {currentDayPlan?.sessions.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200 text-3xl">
                    <i className="fas fa-calendar-day"></i>
                  </div>
                  <p className="text-slate-400 font-medium">No sessions planned for {activeTab}.</p>
                  <button 
                    onClick={() => addSession(activeTab)}
                    className="mt-4 text-green-600 font-bold hover:underline"
                  >
                    Add your first session
                  </button>
                </div>
              ) : (
                currentDayPlan?.sessions.map((session, idx) => (
                  <div key={idx} className="group flex flex-col md:flex-row gap-4 bg-slate-50 p-6 rounded-3xl border border-transparent hover:border-green-200 transition-all items-center">
                    <div className="flex-shrink-0 bg-white p-3 rounded-2xl shadow-sm">
                      <i className={`fas ${session.subject === 'Coding/Tech' ? 'fa-terminal' : 'fa-book'} text-green-500`}></i>
                    </div>
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Subject</label>
                        <select 
                          value={session.subject}
                          onChange={(e) => updateSession(activeTab, idx, 'subject', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-500 text-sm font-semibold"
                        >
                          {COMMON_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Topic/Focus</label>
                        <input 
                          type="text"
                          value={session.topic}
                          onChange={(e) => updateSession(activeTab, idx, 'topic', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          placeholder="e.g. Calculus, Photosynthesis..."
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => removeSession(activeTab, idx)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-2"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {currentDayPlan && currentDayPlan.sessions.length > 0 && (
               <div className="mt-12 p-6 border-t border-slate-100 flex justify-center">
                 <button 
                   onClick={() => window.print()}
                   className="text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors flex items-center gap-2"
                 >
                   <i className="fas fa-print"></i> Print My Schedule
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetablePlanner;
