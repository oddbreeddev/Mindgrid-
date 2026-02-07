
import React, { useState, useEffect } from 'react';
import { generateAISchedule } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

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
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<DayPlan[]>([]);
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('Monday');

  useEffect(() => {
    const loadTimetable = async () => {
      if (user) {
        const { data } = await supabase.from('timetables').select('*').eq('user_id', user.id).limit(1).single();
        if (data) { setTimetable(data.data); setGoal(data.goal); return; }
      }
      const saved = localStorage.getItem('mindgrid_timetable');
      if (saved) setTimetable(JSON.parse(saved));
      else setTimetable(DAYS.map(d => ({ day: d, sessions: [] })));
    };
    loadTimetable();
  }, [user]);

  const syncToCloud = async (newTimetable: DayPlan[], currentGoal: string) => {
    if (!user) { localStorage.setItem('mindgrid_timetable', JSON.stringify(newTimetable)); return; }
    try { await supabase.from('timetables').upsert({ user_id: user.id, goal: currentGoal, data: newTimetable, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }); }
    catch (e) { console.error(e); }
  };

  const handleAISchedule = async () => {
    if (!goal.trim()) return;
    setIsGenerating(true);
    const result = await generateAISchedule(goal);
    if (result && Array.isArray(result)) { setTimetable(result); syncToCloud(result, goal); }
    setIsGenerating(false);
  };

  const addSession = (day: string) => {
    const updated = timetable.map(d => d.day === day ? { ...d, sessions: [...d.sessions, { subject: 'Mathematics', topic: '' }] } : d);
    setTimetable(updated); syncToCloud(updated, goal);
  };

  const updateSession = (day: string, idx: number, field: keyof StudySession, val: string) => {
    const updated = timetable.map(d => d.day === day ? { ...d, sessions: d.sessions.map((s, i) => i === idx ? { ...s, [field]: val } : s) } : d);
    setTimetable(updated); syncToCloud(updated, goal);
  };

  const removeSession = (day: string, idx: number) => {
    const updated = timetable.map(d => d.day === day ? { ...d, sessions: d.sessions.filter((_, i) => i !== idx) } : d);
    setTimetable(updated); syncToCloud(updated, goal);
  };

  const currentDayPlan = timetable.find(d => d.day === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col gap-6 mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800">Study <span className="text-green-600">Planner</span></h1>
        
        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Goal-Based AI Planner</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" value={goal} onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Pass JAMB Science..."
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button onClick={handleAISchedule} disabled={isGenerating} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
              {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>} {isGenerating ? 'Planning' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <div className="flex lg:flex-col overflow-x-auto no-scrollbar gap-2 py-2">
            {DAYS.map(day => (
              <button
                key={day} onClick={() => setActiveTab(day)}
                className={`flex-shrink-0 px-5 py-3 md:py-4 md:px-6 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all text-center ${activeTab === day ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white text-slate-400 border border-slate-100'}`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl md:text-2xl font-black text-slate-800">{activeTab}</h2>
              <button onClick={() => addSession(activeTab)} className="text-green-600 text-[10px] font-black uppercase flex items-center gap-2"><i className="fas fa-plus"></i> Add</button>
            </div>
            <div className="space-y-4">
              {currentDayPlan?.sessions.length === 0 ? (
                <div className="text-center py-16 text-slate-300 font-bold">No sessions.</div>
              ) : (
                currentDayPlan?.sessions.map((session, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-green-100 flex flex-col md:flex-row gap-3">
                    <select value={session.subject} onChange={(e) => updateSession(activeTab, idx, 'subject', e.target.value)} className="bg-white border-slate-200 rounded-lg p-2 text-xs font-bold outline-none">
                      {COMMON_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="text" value={session.topic} onChange={(e) => updateSession(activeTab, idx, 'topic', e.target.value)} placeholder="Topic..." className="flex-grow bg-white border-slate-200 rounded-lg p-2 text-xs outline-none" />
                    <button onClick={() => removeSession(activeTab, idx)} className="text-slate-200 hover:text-red-500 transition-colors self-end md:self-center"><i className="fas fa-trash-alt"></i></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetablePlanner;
