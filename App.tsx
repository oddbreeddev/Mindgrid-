import React, { useEffect, Suspense, lazy, useState, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import NewsletterModal from './components/NewsletterModal';
import { useAuth } from './context/AuthContext';

// Lazy Loaded Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const SocialFeed = lazy(() => import('./pages/SocialFeed'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const StudyPage = lazy(() => import('./pages/StudyPage'));
const CGPACalculator = lazy(() => import('./pages/CGPACalculator'));
const TimetablePlanner = lazy(() => import('./pages/TimetablePlanner'));
const CourseFinder = lazy(() => import('./pages/CourseFinder'));
const AIHub = lazy(() => import('./pages/AIHub'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const NewsletterPage = lazy(() => import('./pages/NewsletterPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const StudyGroupsPage = lazy(() => import('./pages/StudyGroupsPage'));

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 animate-pulse">
      <i className="fas fa-brain text-2xl text-white"></i>
    </div>
    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Opening MindGrid...</p>
  </div>
);

const TitleManager: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    const titles: { [key: string]: string } = {
      '/': 'MindGrid | Your Study Helper',
      '/feed': 'Student Chat | MindGrid',
      '/study': 'Study Roadmaps | MindGrid',
      '/blog': 'Latest News | MindGrid',
      '/library': 'Study Vault | MindGrid',
      '/tools': 'Student Tools | MindGrid',
      '/tools/cgpa': 'Grade Tracker | MindGrid',
      '/tools/timetable': 'Study Planner | MindGrid',
      '/tools/course-finder': 'Course Finder | MindGrid',
      '/ai-hub': 'AI Study Friend | MindGrid',
      '/careers': 'Student Jobs | MindGrid',
    };
    document.title = titles[location.pathname] || 'MindGrid | Nigerian Student Hub';
    window.scrollTo(0, 0);
  }, [location]);
  return null;
};

const App: React.FC = () => {
  console.log("MindGrid: App rendering...");
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const isAuthenticated = !!(user || isAdmin);
  
  useEffect(() => {
    console.log("MindGrid: App mounted.");
    const debugDiv = document.getElementById('mobile-debug');
    if (debugDiv) {
      debugDiv.style.background = 'rgba(0, 255, 0, 0.5)';
      debugDiv.innerHTML += '<br>App Mounted Successfully!';
    }
  }, []);

  // Function to show the modal again after a delay
  const scheduleNextPopup = useCallback(() => {
    setTimeout(() => {
      // Only show if user is still not logged in and didn't subscribe yet
      const hasSubscribed = localStorage.getItem('mindgrid_subscribed');
      if (!isAuthenticated && !hasSubscribed) {
        setIsNewsletterOpen(true);
      }
    }, 60000); // 1 minute delay
  }, [isAuthenticated]);

  useEffect(() => {
    const hasSubscribed = localStorage.getItem('mindgrid_subscribed');
    const hasBeenPrompted = sessionStorage.getItem('mindgrid_prompted');
    
    // Initial popup
    if (!isAuthenticated && !hasSubscribed && !hasBeenPrompted) {
      const timer = setTimeout(() => {
        setIsNewsletterOpen(true);
        sessionStorage.setItem('mindgrid_prompted', 'true');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Exit intent logic
  useEffect(() => {
    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isAuthenticated && !localStorage.getItem('mindgrid_subscribed') && !isNewsletterOpen) {
        setIsNewsletterOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleExitIntent);
    return () => document.removeEventListener('mouseleave', handleExitIntent);
  }, [isAuthenticated, isNewsletterOpen]);

  const closeNewsletter = () => {
    setIsNewsletterOpen(false);
    if (!localStorage.getItem('mindgrid_subscribed')) {
      scheduleNextPopup();
    }
  };

  return (
    <Router>
      <TitleManager />
      <div className="flex flex-col min-h-screen bg-[#050505]">
        <Navbar onOpenNewsletter={() => setIsNewsletterOpen(true)} />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={isAuthenticated ? <StudentDashboard /> : <HomePage />} />
              <Route path="/feed" element={<SocialFeed />} />
              <Route path="/study" element={<StudyPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools/cgpa" element={<CGPACalculator />} />
              <Route path="/tools/timetable" element={<TimetablePlanner />} />
              <Route path="/tools/course-finder" element={<CourseFinder />} />
              <Route path="/ai-hub" element={<AIHub />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/newsletter" element={<NewsletterPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/study-groups" element={<StudyGroupsPage />} />
            </Routes>
          </Suspense>
        </main>
        {!isAuthenticated && <Footer onOpenNewsletter={() => setIsNewsletterOpen(true)} />}
        <CookieConsent />
        <NewsletterModal isOpen={isNewsletterOpen} onClose={closeNewsletter} />
      </div>
    </Router>
  );
};

export default App;