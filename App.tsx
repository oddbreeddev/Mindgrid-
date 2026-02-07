
import React, { useEffect, Suspense, lazy, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import NewsletterModal from './components/NewsletterModal';

// Lazy Loaded Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const CGPACalculator = lazy(() => import('./pages/CGPACalculator'));
const TimetablePlanner = lazy(() => import('./pages/TimetablePlanner'));
const AIHub = lazy(() => import('./pages/AIHub'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NewsletterPage = lazy(() => import('./pages/NewsletterPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center">
    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Syncing MindGrid...</p>
  </div>
);

const TitleManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const titles: { [key: string]: string } = {
      '/': 'MindGrid | Nigerian Student Hub & AI Tutor',
      '/blog': 'Latest News & Social Buzz | MindGrid Nigeria',
      '/library': 'AI Curated Academic Library | MindGrid Nigeria',
      '/tools': 'Student Power Tools | MindGrid Nigeria',
      '/tools/cgpa': 'Nigerian CGPA Calculator (5.0 & 4.0) | MindGrid',
      '/tools/timetable': 'AI Study Timetable Planner | MindGrid',
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

  useEffect(() => {
    // Auto-prompt after 10 seconds if not already subscribed or prompted this session
    const hasSubscribed = localStorage.getItem('mindgrid_subscribed');
    const hasBeenPrompted = sessionStorage.getItem('mindgrid_prompted');
    
    if (!hasSubscribed && !hasBeenPrompted) {
      const timer = setTimeout(() => {
        setIsNewsletterOpen(true);
        sessionStorage.setItem('mindgrid_prompted', 'true');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Router>
      <TitleManager />
      <div className="flex flex-col min-h-screen">
        <Navbar onOpenNewsletter={() => setIsNewsletterOpen(true)} />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools/cgpa" element={<CGPACalculator />} />
              <Route path="/tools/timetable" element={<TimetablePlanner />} />
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
        <Footer onOpenNewsletter={() => setIsNewsletterOpen(true)} />
        <CookieConsent />
        <NewsletterModal isOpen={isNewsletterOpen} onClose={() => setIsNewsletterOpen(false)} />
      </div>
    </Router>
  );
};

export default App;
