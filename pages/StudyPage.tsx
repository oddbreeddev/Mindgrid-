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

  // Sync My Subjects
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
      }
    } catch (err) {
      showToast('Error loading content.', 'error');
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
    const trackSubjects = activeCategory?.availableSubjects.filter(s => s.name.toLowerCase().includes(track.toLowerCase())) || [];
    setMySubjects(trackSubjects);
    showToast(`${track} Track Active!`, 'success');
  };

  const displayedSubjects = useMemo(() => {
    if (activeCategory?.id !== 'tech' || activeTrackFilter === 'All') return mySubjects;
    return mySubjects.filter(s => s.name.toLowerCase().includes(activeTrackFilter.toLowerCase()));
  }, [mySubjects, activeTrackFilter, activeCategory]);

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
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 animate-in">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Study <span className="text-blue-600">Hub</span></h1>
          <p className="text-slate-500 text-sm md:text-lg font-medium max-w-lg mx-auto">Choose what you want to study today.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STUDY_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat)} className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center relative active:scale-95">
              <div className={`absolute top-0 left-0 w-full h-1.5 ${cat.color}`}></div>
              <div className={`w-16 h-16 ${cat.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg`}>
                <i className={`fas ${cat.icon}`}></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{cat.name}</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeCategory.id === 'tech' && !techTrackLocked) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 animate-in">
        <div className="text-center mb-12">
          <button onClick={() => setActiveCategory(null)} className="text-[10px] font-bold uppercase text-slate-400 hover:text-blue-600 mb-4 block mx-auto"><i className="fas fa-chevron-left mr-2"></i> Back</button>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">Choose a <span className="text-blue-600">Track</span></h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Python', 'Web', 'Data'].map((track) => (
            <button key={track} onClick={() => selectTechTrack(track as any)} className="group bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center active:scale-95">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-xl ${track === 'Python' ? 'bg-blue-600' : track === 'Web' ? 'bg-indigo-600' : 'bg-slate-900'} text-white`}>
                <i className={`fas ${track === 'Python' ? 'fa-brands fa-python' : track === 'Web' ? 'fa-globe' : 'fa-chart-pie'}`}></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{track}</h3>
              <p className="text-slate-500 text-xs mb-6">Learn step-by-step.</p>
              <div className="mt-auto px-6 py-2 bg-slate-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">Select</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white relative">
      {isMobileSidebarOpen && <div className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40]" onClick={() => setIsMobileSidebarOpen(false)} />}

      <aside className={`fixed md:relative z-[50] h-full bg-slate-50 border-r border-slate-200 transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0 w-[85%] max-w-[280px]' : '-translate-x-full w-[85%] max-w-[280px]'} md:translate-x-0 md:w-72 flex flex-col`}>
        <div className="p-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { if (activeCategory.id === 'tech') setTechTrackLocked(false); else setActiveCategory(null); }} className="text-[10px] font-bold uppercase text-slate-400 hover:text-blue-600 flex items-center gap-1"><i className="fas fa-chevron-left"></i> Back</button>
            <div className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{trackProgress}%</div>
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Study Desk</h2>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input type="text" placeholder="Find topics..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-3 space-y-3 bg-slate-50/50">
          {displayedSubjects.map(sub => (
            <div key={sub.name} className={`rounded-2xl p-2 ${selectedSubject?.name === sub.name ? 'bg-white shadow-sm' : ''}`}>
              <div className="flex items-center gap-2 px-2 mb-2">
                <i className={`fas ${sub.icon} text-[10px] text-slate-400`}></i>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 truncate">{sub.name.split(':').pop()?.trim()}</span>
              </div>
              <div className="space-y-1">
                {sub.topics.filter(t => t.title.toLowerCase().includes(search.toLowerCase())).map(topic => {
                  const isActive = selectedTopic?.id === topic.id;
                  return (
                    <button 
                      key={topic.id} 
                      onClick={() => { setSelectedSubject(sub); setSelectedTopic(topic); }} 
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      <span className="truncate pr-2">{topic.title}</span>
                      {completedTopics.has(topic.id) && <i className="fas fa-check-circle text-blue-500 text-[10px] shrink-0"></i>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main ref={contentRef} className="flex-grow overflow-y-auto bg-white relative scroll-smooth">
        <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden fixed bottom-6 right-6 z-[45] w-12 h-12 bg-blue-600 text-white rounded-xl shadow-2xl flex items-center justify-center text-xl active:scale-90 transition-transform"><i className="fas fa-bars"></i></button>

        {!selectedTopic ? (
          <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 text-center md:text-left">
             <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">Start your <br/><span className="text-blue-600">Lesson</span></h2>
             <p className="text-gray-500 text-sm md:text-lg">Pick a topic from the curriculum to begin reading.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Lesson...</p>
          </div>
        ) : lesson ? (
          <div className="max-w-3xl mx-auto px-6 py-8 md:py-16 space-y-12 animate-in pb-32">
            <header className="border-b border-slate-100 pb-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className={`text-white text-[8px] font-bold uppercase px-2 py-1 rounded-full ${activeCategory.color}`}>{activeTrackFilter !== 'All' ? activeTrackFilter : activeCategory.name}</span>
                <button onClick={() => toggleCompletion(selectedTopic.id)} disabled={isSavingProgress} className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${completedTopics.has(selectedTopic.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {completedTopics.has(selectedTopic.id) ? 'Completed' : 'Mark Done'}
                </button>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">{selectedTopic.title}</h1>
            </header>

            <div className="prose prose-slate prose-sm md:prose-base max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.theory}</ReactMarkdown>
            </div>

            <div className="bg-slate-900 p-6 md:p-10 rounded-[1.5rem] text-white shadow-xl">
              <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Examples</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.examples}</ReactMarkdown>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-[1.5rem] border border-blue-100/50">
              <h2 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2">School Gist</h2>
              <div className="text-blue-800 text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.naijaContext}</ReactMarkdown>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button onClick={() => toggleCompletion(selectedTopic.id)} className="bg-slate-950 text-white px-10 py-4 rounded-xl font-bold uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
                {completedTopics.has(selectedTopic.id) ? 'All Done!' : 'Finish Lesson'}
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default StudyPage;