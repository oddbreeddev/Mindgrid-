
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenNewsletter: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenNewsletter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

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
              link.path === '/newsletter' ? (
                <button
                  key={link.path}
                  onClick={onOpenNewsletter}
                  className="text-slate-600 hover:text-green-600 text-sm font-medium transition-colors"
                >
                  {link.label}
                </button>
              ) : (
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
              )
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                className={`${
                  location.pathname === '/admin'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-slate-400 hover:text-green-600'
                } px-1 py-2 text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2`}
              >
                <i className="fas fa-shield-halved text-xs"></i> Admin
              </Link>
            )}
            
            {(user || isAdmin) ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={signOut}
                  className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Log Out
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden shadow-sm transition-all ${isAdmin ? 'border-slate-800 bg-slate-900 text-white' : 'border-green-500 bg-slate-100 text-slate-800'}`}>
                   {isAdmin ? (
                     <i className="fas fa-user-shield text-xs"></i>
                   ) : (
                     <span className="font-black text-xs uppercase">{user?.email?.substring(0, 2)}</span>
                   )}
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
              link.path === '/newsletter' ? (
                <button
                  key={link.path}
                  onClick={() => { onOpenNewsletter(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-green-600 hover:bg-slate-50"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-green-600 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              )
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-bold text-slate-900 border-l-4 border-slate-900 bg-slate-50"
              >
                Admin Dashboard
              </Link>
            )}
            {(user || isAdmin) ? (
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
