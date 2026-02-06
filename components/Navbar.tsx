
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <i className="fas fa-brain"></i>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">Mind<span className="text-green-600">Grid</span></span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-slate-600 hover:text-green-600'
                } px-1 py-2 text-sm font-medium transition-colors`}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={signOut}
                  className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Log Out
                </button>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-2 border-green-500 overflow-hidden shadow-sm">
                   <span className="text-slate-800 font-black text-xs uppercase">{user.email?.substring(0, 2)}</span>
                </div>
              </div>
            ) : (
              <Link to="/login" className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
                Log In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-green-600 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
               <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500">Sign Out</button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white text-center"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
