
import React, { useState, useEffect } from 'react';
import { GRADE_SCALE_5 } from '../constants';

interface Course {
  id: string;
  name: string;
  unit: number;
  grade: string;
}

const CGPACalculator: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: '', unit: 3, grade: 'A' },
  ]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  const addCourse = () => {
    setCourses([...courses, { id: Math.random().toString(), name: '', unit: 3, grade: 'A' }]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

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
  }, [courses]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-green-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">CGPA Calculator</h1>
          <p className="opacity-90">Calculate your Semester Grade Point Average (SGPA) based on the Nigerian 5.0 scale.</p>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <p className="text-slate-500 text-sm font-semibold uppercase mb-1">Total Units</p>
              <p className="text-4xl font-black text-slate-800">{totalUnits}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <p className="text-slate-500 text-sm font-semibold uppercase mb-1">Total Points</p>
              <p className="text-4xl font-black text-slate-800">{totalPoints}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center ring-2 ring-green-200">
              <p className="text-green-600 text-sm font-semibold uppercase mb-1">Your CGPA</p>
              <p className="text-5xl font-black text-green-700">{cgpa.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-bold text-slate-400 uppercase">
              <div className="col-span-6">Course Name (Optional)</div>
              <div className="col-span-3">Unit</div>
              <div className="col-span-2">Grade</div>
              <div className="col-span-1"></div>
            </div>

            {courses.map((course) => (
              <div key={course.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl items-center">
                <div className="col-span-12 md:col-span-6">
                  <input
                    type="text"
                    placeholder="e.g. GST 111"
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <select
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    value={course.unit}
                    onChange={(e) => updateCourse(course.id, 'unit', e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6].map(u => <option key={u} value={u}>{u} Unit{u > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <select
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    value={course.grade}
                    onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                  >
                    {GRADE_SCALE_5.map(g => <option key={g.grade} value={g.grade}>{g.grade} ({g.point})</option>)}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1 text-center">
                  <button 
                    onClick={() => removeCourse(course.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={addCourse}
              className="bg-slate-800 text-white px-6 py-2 rounded-full font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i> Add Another Course
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 p-8 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 mb-2">How it works:</h3>
          <p className="text-sm text-slate-600">This calculator uses the standard NUC (National Universities Commission) grading system for Nigerian universities. Grade A is 5 points, B is 4 points, and so on. Your CGPA is calculated by dividing total Quality Points (Units x Grade Points) by the total number of Credit Units.</p>
        </div>
      </div>
    </div>
  );
};

export default CGPACalculator;
