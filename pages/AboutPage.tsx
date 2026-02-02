
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black text-slate-800 mb-8 text-center">About <span className="text-green-600">MindGrid</span></h1>
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 text-lg leading-relaxed">
        <p>
          Founded in 2024, <strong>MindGrid</strong> was born out of a simple observation: Nigerian students have the potential to change the world, but often lack the centralized resources and tools to navigate our unique educational landscape effectively.
        </p>
        <p>
          Our mission is to democratize high-quality academic tools and career guidance. From the secondary school student preparing for JAMB to the final-year university student calculating their honors, MindGrid provides a bridge to excellence.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3 text-xl">Our Vision</h3>
            <p className="text-sm">To become Nigeria's primary digital educational ecosystem, fostering a new generation of informed and empowered professionals.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3 text-xl">Our Values</h3>
            <p className="text-sm">Accuracy, accessibility, and students-first. Every tool we build is rigorously tested to ensure it meets the needs of our community.</p>
          </div>
        </div>
        <p>
          We are more than just a website; we are a community. Our AI-driven tools are constantly evolving to better understand and solve the problems Nigerian students face daily.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
