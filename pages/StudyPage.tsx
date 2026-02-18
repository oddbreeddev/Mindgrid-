
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { STUDY_CATEGORIES, StudyCategory } from '../constants';
import { generateLessonContent } from '../services/geminiService';
import { getCachedLesson, saveLessonToCache } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { LessonContent, SyllabusSubject, SyllabusTopic } from '../types';

const StudyPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, profile } = useAuth();
  
  // Navigation & Hierarchy State
  const [activeCategory, setActiveCategory] = useState<StudyCategory | null>(null);
  const [mySubjects, setMySubjects] = useState<SyllabusSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SyllabusSubject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<SyllabusTopic | null>(null);
  const [activeTrackFilter, setActiveTrackFilter] = useState<'All' | 'Python' | 'Web' | 'Data'>('All');
  const [techTrackLocked, setTechTrackLocked] = useState<boolean>(false);
  
  // Mobile UI States
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');

  // Content & Interaction State
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [quizScore, setQuizScore] = useState<{ [key: number]: number | null }>({});
  const [search, setSearch] = useState('');
  
  // Progress State
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  // Load User Progress
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        const localProgress = localStorage.getItem('mindgrid_local_progress');
        if (localProgress) setCompletedTopics(new Set(JSON.parse(localProgress)));
        return;
      }
      const { data } = await supabase.from('user_progress').select('topic_id').eq('user_id', user.id);
      if (data) setCompletedTopics(new Set(data.map(p => p.topic_id)));
    };
    fetchProgress();
  }, [user]);

  // Sync My Subjects Persistence
  useEffect(() => {
    if (activeCategory) {
      const saved = localStorage.getItem(`mindgrid_subjects_${activeCategory.id}`);
      if (saved) setMySubjects(JSON.parse(saved));
      else {
        const defaultSet = activeCategory.availableSubjects.filter(s => 
          activeCategory.id !== 'tech' || s.name.toLowerCase().includes(activeTrackFilter.toLowerCase())
        ).slice(0, 3);
        setMySubjects(defaultSet);
      }
    }
  }, [activeCategory]);

  useEffect(() => {
    if (activeCategory && mySubjects.length > 0) {
      localStorage.setItem(`mindgrid_subjects_${activeCategory.id}`, JSON.stringify(mySubjects));
    }
  }, [mySubjects, activeCategory]);

  const fetchLesson = async (categoryName: string, subjectName: string, topicTitle: string) => {
    setLoading(true);
    setQuizScore({});
    setIsCached(false);
    setIsMobileSidebarOpen(false);

    const subjectKey = `${categoryName} - ${subjectName}`;

    try {
      const cached = await getCachedLesson(subjectKey, topicTitle);
      if (cached) {
        setLesson(cached);
        setIsCached(true);
        setLoading(false);
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const data = await generateLessonContent(subjectKey, topicTitle);
      if (data) {
        setLesson(data);
        await saveLessonToCache(subjectKey, topicTitle, data);
      } else {
        showToast('Failed to load lesson content.', 'error');
      }
    } catch (err) {
      showToast('Error syncing with MindGrid Cloud.', 'error');
    } finally {
      setLoading(false);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (activeCategory && selectedSubject && selectedTopic) {
      fetchLesson(activeCategory.name, selectedSubject.name, selectedTopic.title);
    }
  }, [selectedTopic]);

  const toggleCompletion = async (topicId: string) => {
    if (isSavingProgress) return;
    setIsSavingProgress(true);
    const isCurrentlyCompleted = completedTopics.has(topicId);
    const newCompletedTopics = new Set(completedTopics);
    if (isCurrentlyCompleted) newCompletedTopics.delete(topicId);
    else newCompletedTopics.add(topicId);

    try {
      if (user) {
        if (!isCurrentlyCompleted) {
          await supabase.from('user_progress').insert({ user_id: user.id, topic_id: topicId, category_id: activeCategory?.id || 'general' });
        } else {
          await supabase.from('user_progress').delete().eq('user_id', user.id).eq('topic_id', topicId);
        }
      } else {
        localStorage.setItem('mindgrid_local_progress', JSON.stringify(Array.from(newCompletedTopics)));
      }
      setCompletedTopics(newCompletedTopics);
      showToast(isCurrentlyCompleted ? 'Marked as uncompleted' : 'Lesson completed!', 'success');
    } catch (err) {
      showToast('Progress sync failed.', 'error');
    } finally {
      setIsSavingProgress(false);
    }
  };

  const selectTechTrack = async (track: 'Python' | 'Web' | 'Data') => {
    setActiveTrackFilter(track);
    setTechTrackLocked(true);
    localStorage.setItem('mindgrid_selected_tech_track', track);
    if (user) await supabase.from('profiles').update({ selected_tech_track: track }).eq('id', user.id);
    const trackSubjects = activeCategory?.availableSubjects.filter(s => s.name.toLowerCase().includes(track.toLowerCase())) || [];
    setMySubjects(trackSubjects);
    showToast(`${track} Roadmap Activated!`, 'success');
  };

  const displayedSubjects = useMemo(() => {
    if (activeCategory?.id !== 'tech' || activeTrackFilter === 'All') return mySubjects;
    return mySubjects.filter(s => s.name.toLowerCase().includes(activeTrackFilter.toLowerCase()));
  }, [mySubjects, activeTrackFilter, activeCategory]);

  const flattenedRoadmap = useMemo(() => {
    return displayedSubjects.flatMap(sub => sub.topics.map(topic => ({ topic, subject: sub })));
  }, [displayedSubjects]);

  const currentIndex = flattenedRoadmap.findIndex(item => item.topic.id === selectedTopic?.id);
  const prevItem = currentIndex > 0 ? flattenedRoadmap[currentIndex - 1] : null;
  const nextItem = currentIndex < flattenedRoadmap.length - 1 ? flattenedRoadmap[currentIndex + 1] : null;

  const navigateToTopic = (item: { topic: SyllabusTopic, subject: SyllabusSubject } | null) => {
    if (item) {
      setSelectedSubject(item.subject);
      setSelectedTopic(item.topic);
    }
  };

  const trackProgress = useMemo(() => {
    if (!activeCategory) return 0;
    const allTopics = activeCategory.availableSubjects
      .filter(s => activeCategory.id !== 'tech' || activeTrackFilter === 'All' || s.name.toLowerCase().includes(activeTrackFilter.toLowerCase()))
      .flatMap(s => s.topics);
    if (allTopics.length === 0) return 0;
    const completedInTrack = allTopics.filter(t => completedTopics.has(t.id)).length;
    return Math.round((completedInTrack / allTopics.length) * 100);
  }, [activeCategory, activeTrackFilter, completedTopics]);

  if (!activeCategory) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 animate-in">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Study <span className="text-blue-600">Hub</span></h1>
          <p className="text-slate-500 text-base md:text-lg font-medium max-w-xl mx-auto">Select a track to begin your personalized learning journey.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STUDY_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat)} className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col items-center text-center relative overflow-hidden active:scale-95">
              <div className={`absolute top-0 left-0 w-full h-2 ${cat.color}`}></div>
              <div className={`w-20 h-20 ${cat.color} text-white rounded-[1.8rem] flex items-center justify-center text-3xl mb-8 transform group-hover:rotate-6 transition-all`}>
                <i className={`fas ${cat.icon}`}></i>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">{cat.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">{cat.description}</p>
              <div className="mt-auto text-blue-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Explore <i className="fas fa-arrow-right ml-1"></i></div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeCategory.id === 'tech' && !techTrackLocked) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 animate-in">
        <div className="text-center mb-16">
          <button onClick={() => setActiveCategory(null)} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 mb-6 block mx-auto"><i className="fas fa-chevron-left mr-2"></i> All Tracks</button>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4">Choose Your <span className="text-blue-600">Path</span></h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {['Python', 'Web', 'Data'].map((track, i) => (
            <button key={track} onClick={() => selectTechTrack(track as any)} className="group bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col items-center text-center relative active:scale-95">
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl mb-8 transform group-hover:scale-110 transition-transform ${track === 'Python' ? 'bg-blue-600' : track === 'Web' ? 'bg-indigo-600' : 'bg-slate-900'} text-white shadow-xl`}>
                <i className={`fas ${track === 'Python' ? 'fa-brands fa-python' : track === 'Web' ? 'fa-globe' : 'fa-chart-pie'}`}></i>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4">{track} Mastery</h3>
              <p className="text-slate-500 text-sm mb-8">Specialized training roadmap for 2026.</p>
              <div className="mt-auto px-8 py-3 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">Select Roadmap</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white relative">
      {isMobileSidebarOpen && <div className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40]" onClick={() => setIsMobileSidebarOpen(false)} />}

      <aside className={`fixed md:relative z-[50] h-full bg-slate-50 border-r border-slate-200 transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0 w-[85%] max-w-[320px]' : '-translate-x-full w-[85%] max-w-[320px]'} md:translate-x-0 md:w-80 flex flex-col`}>
        <div className="p-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { if (activeCategory.id === 'tech') setTechTrackLocked(false); else setActiveCategory(null); }} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 flex items-center gap-1"><i className="fas fa-chevron-left"></i> Back</button>
            <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{trackProgress}%</div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Study Desk</h2>
            <button onClick={() => setIsAddingSubject(true)} className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><i className="fas fa-plus text-xs"></i></button>
          </div>
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input type="text" placeholder="Search topics..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto min-h-0 p-4 space-y-4 bg-slate-50/50 scroll-smooth">
          {displayedSubjects.map(sub => (
            <div key={sub.name} className={`rounded-3xl p-3 ${selectedSubject?.name === sub.name ? 'bg-white shadow-sm ring-1 ring-slate-200' : ''}`}>
              <div className="flex items-center gap-3 px-2 mb-2">
                <i className={`fas ${sub.icon} text-xs text-slate-400`}></i>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 truncate">{sub.name.split(':').pop()?.trim()}</span>
              </div>
              <div className="space-y-1">
                {sub.topics.filter(t => t.title.toLowerCase().includes(search.toLowerCase())).map(topic => {
                  const isActive = selectedTopic?.id === topic.id;
                  return (
                    <button 
                      key={topic.id} 
                      onClick={() => { setSelectedSubject(sub); setSelectedTopic(topic); }} 
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group/topic ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      <span className="truncate pr-2">{topic.title}</span>
                      {completedTopics.has(topic.id) ? <i className="fas fa-check-circle text-blue-500 shrink-0"></i> : <i className="fas fa-circle text-[6px] text-slate-200 shrink-0"></i>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main ref={contentRef} className="flex-grow overflow-y-auto bg-white relative">
        <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden fixed bottom-6 left-6 z-[45] w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center text-xl active:scale-95 transition-transform"><i className="fas fa-bars-staggered"></i></button>

        {!selectedTopic ? (
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 animate-in">
             <div className="text-center md:text-left space-y-8">
               <h2 className="text-3xl md:text-6xl font-black text-slate-900 leading-tight">Welcome to the <br/><span className="text-blue-600">{activeTrackFilter === 'All' ? activeCategory.name : activeTrackFilter}</span> Roadmap</h2>
               <p className="text-slate-500 text-lg font-medium">Select a module from the desk to begin your training.</p>
               <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Open Curriculum</button>
             </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing MindGrid Archive...</p>
          </div>
        ) : lesson ? (
          <div className="max-w-4xl mx-auto px-6 py-10 md:py-20 space-y-16 animate-in pb-40">
            <header className="border-b border-slate-100 pb-10">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className={`text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${activeCategory.color}`}>{activeTrackFilter !== 'All' ? activeTrackFilter : activeCategory.name}</span>
                  {isCached && <span className="bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1"><i className="fas fa-database"></i> Archived</span>}
                </div>
                <button onClick={() => toggleCompletion(selectedTopic.id)} disabled={isSavingProgress} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${completedTopics.has(selectedTopic.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {isSavingProgress ? <i className="fas fa-spinner fa-spin"></i> : <i className={`fas ${completedTopics.has(selectedTopic.id) ? 'fa-check-circle' : 'fa-circle'}`}></i>}
                  {completedTopics.has(selectedTopic.id) ? 'Completed' : 'Mark Done'}
                </button>
              </div>
              <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">{selectedTopic.title}</h1>
            </header>

            <section className="space-y-8">
              <div className="flex items-center gap-4"><div className="h-px flex-grow bg-slate-100"></div><h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">The Logic Layer</h2><div className="h-px flex-grow bg-slate-100"></div></div>
              <div className="prose prose-slate md:prose-lg max-w-none prose-pre:bg-slate-900 prose-pre:p-6 prose-pre:rounded-3xl prose-blockquote:border-blue-500">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.theory}</ReactMarkdown>
              </div>
            </section>

            <section className="bg-slate-900 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-10">
                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Live Implementations</h2>
                <div className="prose prose-invert prose-blue max-w-none prose-pre:bg-black/50 prose-pre:rounded-2xl">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.examples}</ReactMarkdown>
                </div>
              </div>
              <i className="fas fa-microchip absolute -right-12 -bottom-12 text-[15rem] text-white/5 rotate-12"></i>
            </section>

            <section className="bg-blue-50 p-8 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row gap-8 items-start border border-blue-100/50">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl shrink-0"><i className="fas fa-lightbulb"></i></div>
              <div className="space-y-4">
                <h2 className="text-lg font-black text-blue-900 uppercase tracking-widest">Industry Insight</h2>
                <div className="text-blue-800 text-base md:text-lg leading-relaxed font-medium prose prose-blue max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.naijaContext}</ReactMarkdown>
                </div>
              </div>
            </section>

            <div className="pt-20 space-y-12 border-t border-slate-100">
              <div className="flex justify-center">
                <button onClick={() => toggleCompletion(selectedTopic.id)} disabled={isSavingProgress} className={`flex items-center gap-6 px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${completedTopics.has(selectedTopic.id) ? 'bg-blue-600 text-white' : 'bg-slate-950 text-white hover:bg-blue-600'}`}>
                  {completedTopics.has(selectedTopic.id) ? <><i className="fas fa-check-double text-2xl"></i> Mastered</> : <><i className="fas fa-graduation-cap text-2xl"></i> Finish Lesson</>}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {isAddingSubject && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4 animate-in">
          <div className="bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl md:text-3xl font-black text-slate-800">Add Roadmap Modules</h3>
              <button onClick={() => setIsAddingSubject(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <div className="relative mb-6">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input type="text" placeholder="Find a module..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm" value={subjectSearch} onChange={(e) => setSubjectSearch(e.target.value)} />
            </div>
            <div className="flex-grow overflow-y-auto no-scrollbar pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeCategory?.availableSubjects.filter(s => !mySubjects.some(ms => ms.name === s.name)).map(subject => (
                  <button key={subject.name} onClick={() => { setMySubjects([...mySubjects, subject]); setIsAddingSubject(false); showToast(`${subject.name} added!`, 'success'); }} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all text-left group active:scale-95">
                    <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl flex items-center justify-center text-slate-400 text-lg transition-all"><i className={`fas ${subject.icon}`}></i></div>
                    <h4 className="font-black text-slate-800 text-sm truncate">{subject.name}</h4>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPage;
