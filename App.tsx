
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import ToolsPage from './pages/ToolsPage';
import CGPACalculator from './pages/CGPACalculator';
import TimetablePlanner from './pages/TimetablePlanner';
import AIHub from './pages/AIHub';
import CareersPage from './pages/CareersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';

const TitleManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const titles: { [key: string]: string } = {
      '/': 'MindGrid | Nigerian Student Hub & AI Tutor',
      '/blog': 'Latest News & Social Buzz | MindGrid Nigeria',
      '/tools': 'Student Power Tools | MindGrid Nigeria',
      '/tools/cgpa': 'Nigerian CGPA Calculator (5.0 & 4.0) | MindGrid',
      '/tools/timetable': 'AI Study Timetable Planner | MindGrid',
      '/ai-hub': 'AI Study Assistant & Tutor | MindGrid',
      '/careers': 'Student Jobs & Tech Internships Nigeria | MindGrid',
      '/about': 'About MindGrid | Empowering Nigerian Students',
      '/contact': 'Contact Us | MindGrid Support',
      '/privacy': 'Privacy Policy | MindGrid Nigeria',
    };

    document.title = titles[location.pathname] || 'MindGrid | Nigerian Student Resource Hub';
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <TitleManager />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/cgpa" element={<CGPACalculator />} />
            <Route path="/tools/timetable" element={<TimetablePlanner />} />
            <Route path="/ai-hub" element={<AIHub />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
