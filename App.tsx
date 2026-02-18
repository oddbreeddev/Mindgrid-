
import React, { useEffect, Suspense, lazy, useState } from 'react';
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
const NewsletterPage = lazy(() => import('./pages/NewsletterPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading Fallback updated to Pitch Black
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-blue-400 font-black text-xs uppercase tracking-[0.3em]">Syncing MindGrid...</p>
  </div>
);

const TitleManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const titles: { [key: string]: string } = {
      '/': 'MindGrid | Nigerian Student Hub & AI Tutor',
      '/feed': 'Scholars Feed | The Pulse of Nigerian Students',
      '/study': 'Study Hub | JAMB, WAEC & Tech Mastery | MindGrid',
      '/blog': 'Latest News & Social Buzz | MindGrid Nigeria',
      '/library': 'AI Curated Academic Library | MindGrid Nigeria',
      '/tools': 'Student Power Tools | MindGrid Nigeria',
      '/tools/cgpa': 'Nigerian CGPA Calculator (5.0 & 4.0) | MindGrid',
      '/tools/timetable': 'AI Study Timetable Planner | MindGrid',
      '/tools/course-finder': 'Admissions Navigator | Subject Combination & Cutoffs',
      '/ai-hub': 'AI Study Assistant & Tutor | MindGrid',
      '/careers': 'Student Jobs & Tech Internships Nigeria | MindGrid',
      '/newsletter': 'MindGrid Intelligence | Academic Newsletter',
      '/admin': 'Admin Control | MindGrid Nigeria',
      '/about': 'About MindGrid | Empowering Nigerian Students',
      '/contact': 'Contact Us | MindGrid Support',
      '/privacy': 'Privacy Policy | MindGrid Nigeria',
      '/terms': 'Terms of Service | MindGrid Nigeria',
      '/login': 'Login | Join MindGrid Nigeria',
    };

    document.title = titles[location.pathname] || 'MindGrid | Nigerian Student Resource Hub';
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const App: React.FC = () => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const isAuthenticated = !!(user || isAdmin);

  useEffect(() => {
    const hasSubscribed = localStorage.getItem('mindgrid_subscribed');
    const hasBeenPrompted = sessionStorage.getItem('mindgrid_prompted');
    
    if (!isAuthenticated && !hasSubscribed && !hasBeenPrompted) {
      const timer = setTimeout(() => {
        setIsNewsletterOpen(true);
        sessionStorage.setItem('mindgrid_prompted', 'true');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

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
            </Routes>
          </Suspense>
        </main>
        {/* Footer hidden for authenticated users to provide an immersive workspace experience */}
        {!isAuthenticated && <Footer onOpenNewsletter={() => setIsNewsletterOpen(true)} />}
        <CookieConsent />
        <NewsletterModal isOpen={isNewsletterOpen} onClose={() => setIsNewsletterOpen(false)} />
      </div>
    </Router>
  );
};

export default App;
