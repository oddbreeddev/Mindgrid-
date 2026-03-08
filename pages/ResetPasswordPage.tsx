import React, { useState } from 'react';
import { auth } from '../src/firebase';
import { updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showToast('You must be logged in to change your password.', 'error');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(user, password);
      showToast('Password updated successfully!', 'success');
      navigate('/login');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-blue-200">
            <i className="fas fa-key"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800">New Password</h1>
          <p className="text-slate-500 mt-2 font-medium">Create a strong password for your account.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 active:scale-95 mt-4 flex items-center justify-center gap-3"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : null}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
