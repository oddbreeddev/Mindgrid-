
import React from 'react';
import { Link } from 'react-router-dom';
import AdPlaceholder from '../components/AdPlaceholder';
import FeatureCarousel from '../components/FeatureCarousel';
import ShareButton from '../components/ShareButton';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-green-300 text-sm font-bold mb-8 border border-white/10">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            New: Tech Career Roadmaps for 2024
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Education meets <span className="text-green-400">Innovation</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto font-light">
            Nigeria's first hybrid platform for academic excellence and tech skills. Master your degree while building your tech stack.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/ai-hub" className="w-full sm:w-auto bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-400 transition-all shadow-lg transform hover:-translate-y-1">
              Start Learning with AI
            </Link>
            <Link to="/tools" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
              Explore Tech Tools
            </Link>
            <ShareButton 
              variant="outline"
              title="MindGrid Nigeria"
              text="Check out MindGrid! It's a game-changer for Nigerian students with AI tutors and study tools."
              className="w-full sm:w-auto py-4 px-8 text-white border-white/20 hover:bg-white/10"
            />
          </div>
        </div>
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-green-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>
      </section>

      {/* Feature Showcase Carousel */}
      <section className="py-8">
        <FeatureCarousel />
      </section>

      {/* Tech Skills Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">Master Tech Skills</h2>
          <p className="text-slate-500">Kickstart your career in the Nigerian tech ecosystem.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'UI/UX Design', icon: 'fa-bezier-curve', color: 'text-pink-500', bg: 'bg-pink-50' },
            { name: 'Web Dev', icon: 'fa-code', color: 'text-blue-500', bg: 'bg-blue-50' },
            { name: 'Data Science', icon: 'fa-chart-pie', color: 'text-purple-500', bg: 'bg-purple-50' },
            { name: 'Cybersecurity', icon: 'fa-shield-halved', color: 'text-red-500', bg: 'bg-red-50' },
          ].map((skill, idx) => (
            <div key={idx} className={`${skill.bg} p-6 rounded-2xl flex flex-col items-center text-center group cursor-pointer hover:shadow-md transition-all`}>
              <i className={`fas ${skill.icon} ${skill.color} text-3xl mb-4 group-hover:scale-110 transition-transform`}></i>
              <span className="font-bold text-slate-800 text-sm">{skill.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Ad Space */}
      <div className="max-w-7xl mx-auto px-4">
        <AdPlaceholder slot="top-banner" />
      </div>

      {/* Featured Content Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-green-600 font-bold text-sm tracking-widest uppercase mb-4 block">MindGrid Tech</span>
              <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">Build for the World from <span className="underline decoration-green-400">Yaba</span> to Silicon Valley.</h2>
              <p className="text-slate-600 text-lg mb-8">
                We provide curated coding resources, local dev community links, and tutorials on how to monetize your tech skills while still in school.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-700">
                  <i className="fas fa-check-circle text-green-500"></i>
                  Student Developer Roadmaps
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <i className="fas fa-check-circle text-green-500"></i>
                  Nigerian Tech Internship Alerts
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <i className="fas fa-check-circle text-green-500"></i>
                  Freelancing Guides for Students
                </li>
              </ul>
              <div className="flex items-center gap-4">
                <Link to="/blog" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold inline-block hover:bg-slate-800 transition-colors">
                  Read Tech Guides
                </Link>
                <ShareButton 
                  title="MindGrid Student Tech Guides"
                  text="Learning to code while in a Nigerian uni? These MindGrid guides are a life saver."
                  variant="outline"
                />
              </div>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800" alt="Tech Hub" className="rounded-3xl shadow-2xl" />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center text-green-600">
                    <i className="fas fa-terminal"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Coding Tip</p>
                    <p className="font-bold text-slate-800">Learn React in 30 Days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Trending Now</h2>
              <p className="text-slate-500">Top stories in Academics and Tech.</p>
            </div>
            <Link to="/blog" className="text-green-600 font-bold hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm group border border-slate-100 relative">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600" className="h-48 w-full object-cover" alt="Article" />
              <div className="absolute top-4 right-4">
                <ShareButton 
                  variant="icon" 
                  title="Best Affordable Laptops for Students" 
                  text="Found the best budget laptops for school on MindGrid."
                  iconOnly
                />
              </div>
              <div className="p-6">
                <span className="text-blue-600 text-xs font-bold uppercase">Tech & Gadgets</span>
                <h4 className="text-lg font-bold mt-2 mb-3 group-hover:text-green-600 transition-colors">Best Affordable Laptops for Students in 2024</h4>
                <p className="text-slate-500 text-sm line-clamp-2">Finding the right balance between price and performance for coding and school work...</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm group border border-slate-100 relative">
              <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600" className="h-48 w-full object-cover" alt="Article" />
              <div className="absolute top-4 right-4">
                <ShareButton 
                  variant="icon" 
                  title="Python vs JavaScript" 
                  text="Which coding language should a Nigerian student start with?"
                  iconOnly
                />
              </div>
              <div className="p-6">
                <span className="text-purple-600 text-xs font-bold uppercase">Coding</span>
                <h4 className="text-lg font-bold mt-2 mb-3 group-hover:text-green-600 transition-colors">Python vs JavaScript: Which should you learn first?</h4>
                <p className="text-slate-500 text-sm line-clamp-2">A comprehensive guide for Nigerian beginners looking to enter the world of programming...</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm group border border-slate-100 relative">
              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600" className="h-48 w-full object-cover" alt="Article" />
              <div className="absolute top-4 right-4">
                <ShareButton 
                  variant="icon" 
                  title="How CS Students get Hired" 
                  text="The secret to getting hired as a CS student in Nigeria."
                  iconOnly
                />
              </div>
              <div className="p-6">
                <span className="text-green-600 text-xs font-bold uppercase">University</span>
                <h4 className="text-lg font-bold mt-2 mb-3 group-hover:text-green-600 transition-colors">How Computer Science Students can get Hired Faster</h4>
                <p className="text-slate-500 text-sm line-clamp-2">Moving beyond the classroom syllabus and building a professional portfolio in Lagos...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4">Ready to upgrade your mind?</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">Join thousands of students building their academic and tech futures today.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/ai-hub" className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-400 transition-all">
                Ask AI a Question
              </Link>
              <ShareButton 
                variant="outline"
                title="Join MindGrid Nigeria"
                text="Join me on MindGrid for the best academic tools in Nigeria!"
                className="bg-white text-slate-900 border-none px-8 py-3"
              />
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
