
import React, { useState, useEffect } from 'react';
import { GRADE_SCALE_5 } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabase';

interface Course {
  id: string;
  name: string;
  unit: number;
  grade: string;
}

const CGPACalculator: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: '', unit: 3, grade: 'A' },
  ]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      if (user) {
        const { data } = await supabase
          .from('cgpa_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data) {
          setCourses(data.courses);
          setLastSaved(new Date(data.created_at).toLocaleTimeString());
          return;
        }
      }
      const saved = localStorage.getItem('mindgrid_local_cgpa');
      if (saved) setCourses(JSON.parse(saved));
    };
    loadInitialData();
  }, [user]);

  useEffect(() => {
    let units = 0;
    let points = 0;
    courses.forEach(c => {
      const gradePoint = GRADE_SCALE_5.find(g => g.grade === c.grade)?.point || 0;
      units += Number(c.unit);
      points += (Number(c.unit) * gradePoint);
    });
    setTotalUnits(units);
    setTotalPoints(points);
    setCgpa(units > 0 ? points / units : 0);
    localStorage.setItem('mindgrid_local_cgpa', JSON.stringify(courses));
  }, [courses]);

  const addCourse = () => setCourses([...courses, { id: Math.random().toString(), name: '', unit: 3, grade: 'A' }]);
  const removeCourse = (id: string) => courses.length > 1 && setCourses(courses.filter(c => c.id !== id));
  const updateCourse = (id: string, field: keyof Course, value: any) => setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));

  const saveToCloud = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await supabase.from('cgpa_records').insert({
        user_id: user.id,
        semester_label: `Semester ${new Date().toLocaleDateString()}`,
        gpa: cgpa,
        units: totalUnits,
        courses: courses
      });
      setLastSaved(new Date().toLocaleTimeString());
      showToast('Record synced to cloud!', 'success');
    } catch (err) {
      showToast('Cloud sync failed.', 'error');
    } finally { setIsSyncing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-white rounded-[2rem] md:rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-green-600 p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-1">CGPA Calculator</h1>
              <p className="text-xs opacity-90">NUC 5.0 Academic Scale</p>
            </div>
            {user && (
              <button onClick={saveToCloud} disabled={isSyncing} className="bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-sm transition-all flex items-center gap-2">
                {isSyncing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-cloud-upload-alt"></i>}
                {isSyncing ? 'Saving' : 'Sync'}
              </button>
            )}
          </div>
        </div>
        
        <div className="p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Units</p>
              <p className="text-2xl font-black text-slate-800">{totalUnits}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Points</p>
              <p className="text-2xl font-black text-slate-800">{totalPoints}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
              <p className="text-[10px] font-black text-green-600 uppercase mb-1">CGPA</p>
              <p className="text-4xl font-black text-green-700">{cgpa.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-slate-50/50 p-4 md:p-4 rounded-2xl border border-slate-100 group animate-in">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-6">
                    <input
                      type="text"
                      placeholder="Course Code"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:col-span-5">
                    <select
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none"
                      value={course.unit}
                      onChange={(e) => updateCourse(course.id, 'unit', e.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6].map(u => <option key={u} value={u}>{u} Unit{u > 1 ? 's' : ''}</option>)}
                    </select>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-green-700 focus:ring-2 focus:ring-green-500 outline-none"
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                    >
                      {GRADE_SCALE_5.map(g => <option key={g.grade} value={g.grade}>{g.grade} ({g.point})</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1 flex justify-center">
                    <button onClick={() => removeCourse(course.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addCourse} className="w-full mt-6 bg-slate-100 text-slate-800 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
            <i className="fas fa-plus"></i> Add Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CGPACalculator;
