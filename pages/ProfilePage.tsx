import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserProfile, updateUserProfile } from '../services/dataService';
import { motion } from 'framer-motion';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    university: '',
    department: '',
    bio: '',
    photo_url: '',
    selected_tech_track: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const data = await getUserProfile(user.uid);
        if (data) {
          setProfile({
            full_name: data.full_name || '',
            university: data.university || '',
            department: data.department || '',
            bio: data.bio || '',
            photo_url: data.photo_url || '',
            selected_tech_track: data.selected_tech_track || ''
          });
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const success = await updateUserProfile(user.uid, profile);
    if (success) {
      showToast('Profile updated successfully!', 'success');
    } else {
      showToast('Failed to update profile.', 'error');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="bg-blue-600 h-32 relative">
            <div className="absolute -bottom-12 left-10">
              <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-lg">
                <img 
                  src={profile.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt="Profile" 
                  className="w-full h-full rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          <div className="pt-16 pb-10 px-10">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Student <span className="text-blue-600">Identity</span></h1>
              <p className="text-slate-500 text-sm font-medium">Manage your academic and professional presence.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700"
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    placeholder="e.g. Aminu Daniel"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">University</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700"
                    value={profile.university}
                    onChange={(e) => setProfile({...profile, university: e.target.value})}
                    placeholder="e.g. University of Lagos"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Department</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700"
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tech Track</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700"
                    value={profile.selected_tech_track}
                    onChange={(e) => setProfile({...profile, selected_tech_track: e.target.value})}
                  >
                    <option value="">Select Track</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Short Bio</label>
                <textarea 
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell us about your academic journey..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Profile Picture URL</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                  value={profile.photo_url}
                  onChange={(e) => setProfile({...profile, photo_url: e.target.value})}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Updating Identity...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
