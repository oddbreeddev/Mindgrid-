
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, Menu, X, MessageCircle, User, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from '../constants';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

interface NavbarProps {
  onOpenNewsletter: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenNewsletter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const isAuthenticated = !!(user || isAdmin);

  return (
    <nav className="bg-[#050505] border-b border-white/5 sticky top-0 z-[60] h-20 flex items-center" role="navigation" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-8 w-full flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 group" aria-label="MindGrid Home">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <i className="fas fa-brain"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Mind<span className="text-blue-500">Grid</span>
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {isAuthenticated && (
            <>
              <Link
                to="/feed"
                className={`${
                  location.pathname === '/feed'
                    ? 'text-blue-500'
                    : 'text-gray-400 hover:text-blue-400'
                } text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-colors`}
              >
                <MessageCircle size={16} />
                Feed
              </Link>
              <Link
                to="/study-groups"
                className={`${
                  location.pathname === '/study-groups'
                    ? 'text-blue-500'
                    : 'text-gray-400 hover:text-blue-400'
                } text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-colors`}
              >
                <BookOpen size={16} />
                Rooms
              </Link>
            </>
          )}

          {NAV_LINKS.map((link) => (
            link.path === '/newsletter' ? (
              <button
                key={link.path}
                onClick={onOpenNewsletter}
                className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors"
                aria-label={`Open ${link.label}`}
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'text-blue-500'
                    : 'text-gray-400 hover:text-blue-400'
                } text-sm font-medium transition-colors`}
                aria-current={location.pathname === link.path ? 'page' : undefined}
              >
                {link.label}
              </Link>
            )
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              className="text-gray-400 hover:text-blue-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2"
              aria-label="Admin Dashboard"
            >
              Admin
            </Link>
          )}
          
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <NotificationBell />
              <Link 
                to="/profile"
                className="text-gray-500 hover:text-blue-500 transition-colors"
                aria-label="Profile"
              >
                <User size={20} />
              </Link>
              <button 
                onClick={signOut}
                className="text-gray-500 hover:text-red-500 text-xs font-bold uppercase transition-colors"
                aria-label="Sign out"
              >
                Log Out
              </button>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-xl transition-all ${isAdmin ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`} aria-hidden="true">
                 <span className="font-black text-xs uppercase">{user?.email?.substring(0, 2)}</span>
              </div>
            </div>
          ) : (
            <Link to="/login" className="px-5 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium text-white" aria-label="Login to account">
              Login
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white p-2 z-[80] relative"
            aria-expanded={isOpen}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[65]" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-[80%] max-w-[300px] bg-[#0a0a0a] z-[70] p-8 pt-24 border-l border-white/5 shadow-2xl overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                {isAuthenticated && (
                  <>
                    <Link
                      to="/feed"
                      onClick={() => setIsOpen(false)}
                      className="text-xl font-bold text-blue-500 flex items-center gap-3 p-2 rounded-xl bg-blue-500/5"
                    >
                      <MessageCircle size={24} />
                      Scholars Feed
                    </Link>
                    <Link
                      to="/study-groups"
                      onClick={() => setIsOpen(false)}
                      className="text-xl font-bold text-blue-500 flex items-center gap-3 p-2 rounded-xl bg-blue-500/5"
                    >
                      <BookOpen size={24} />
                      Study Rooms
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="text-xl font-bold text-blue-500 flex items-center gap-3 p-2 rounded-xl bg-blue-500/5"
                    >
                      <User size={24} />
                      My Profile
                    </Link>
                  </>
                )}
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-xl font-bold p-2 rounded-xl transition-colors ${
                      location.pathname === link.path ? 'text-blue-500 bg-white/5' : 'text-gray-400 hover:text-blue-500'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                  {isAuthenticated ? (
                     <button onClick={() => { signOut(); setIsOpen(false); }} className="text-left text-xl font-bold text-red-500 p-2">Sign Out</button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="bg-blue-600 text-white py-4 rounded-2xl text-center font-bold shadow-lg shadow-blue-600/20"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
