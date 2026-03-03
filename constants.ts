
import { NavItem, GradeScale, SyllabusSubject } from './types';

export const NAV_LINKS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'CramZone', path: '/study', icon: 'fa-book-open' },
  { label: 'Blog', path: '/blog' },
  { label: 'Library', path: '/library' },
  { label: 'Tools', path: '/tools' },
  { label: 'AI Hub', path: '/ai-hub' },
  { label: 'Careers', path: '/careers' },
];

export const GRADE_SCALE_5: GradeScale[] = [
  { grade: 'A', point: 5 },
  { grade: 'B', point: 4 },
  { grade: 'C', point: 3 },
  { grade: 'D', point: 2 },
  { grade: 'E', point: 1 },
  { grade: 'F', point: 0 },
];

export const NIGERIAN_UNIS = [
  "University of Ibadan",
  "University of Lagos",
  "Ahmadu Bello University",
  "University of Nigeria, Nsukka",
  "Obafemi Awolowo University",
  "Covenant University",
  "Federal University of Technology, Akure",
  "University of Benin",
];

export interface StudyCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'academic' | 'tech';
  availableSubjects: SyllabusSubject[];
}

export const STUDY_CATEGORIES: StudyCategory[] = [
  {
    id: 'jamb',
    name: 'JAMB / UTME',
    description: 'Master the UTME syllabus with focused lessons and practice questions.',
    icon: 'fa-graduation-cap',
    color: 'bg-blue-600',
    type: 'academic',
    availableSubjects: [
      {
        name: "Use of English",
        icon: "fa-font",
        topics: [
          { id: "j-e1", title: "Comprehension and Summary" },
          { id: "j-e2", title: "Lexis and Structure" },
          { id: "j-e3", title: "Oral English" },
          { id: "j-e4", title: "Sentence Interpretation" }
        ]
      },
      {
        name: "Mathematics",
        icon: "fa-calculator",
        topics: [
          { id: "j-m1", title: "Number Bases" },
          { id: "j-m2", title: "Indices and Logarithms" },
          { id: "j-m3", title: "Sets" },
          { id: "j-m4", title: "Sequences and Series" }
        ]
      },
      {
        name: "Physics",
        icon: "fa-atom",
        topics: [
          { id: "j-p1", title: "Scalars and Vectors" },
          { id: "j-p2", title: "Linear Motion" },
          { id: "j-p3", title: "Heat and Energy" }
        ]
      }
    ]
  },
  {
    id: 'waec',
    name: 'WAEC / WASSCE',
    description: 'Complete syllabus coverage for senior secondary school certification.',
    icon: 'fa-certificate',
    color: 'bg-indigo-600',
    type: 'academic',
    availableSubjects: [
      {
        name: "General Mathematics",
        icon: "fa-plus-minus",
        topics: [
          { id: "w-m1", title: "Number and Numeration" },
          { id: "w-m2", title: "Algebraic Processes" },
          { id: "w-m3", title: "Geometry" }
        ]
      }
    ]
  },
  {
    id: 'tech',
    name: 'Programming & Tech',
    description: 'Tri-Track Roadmaps: Web Development, Python Mastery, and Data Analysis.',
    icon: 'fa-code',
    color: 'bg-slate-900',
    type: 'tech',
    availableSubjects: [
      // PYTHON ROADMAP
      {
        name: "Python: Setup & Basics",
        icon: "fa-brands fa-python",
        topics: [
          { id: "t-py-1", title: "Setup: Python 3.13 & IDEs (VS Code/PyCharm)" },
          { id: "t-py-2", title: "Environments & Packages: uv, venv, pip" },
          { id: "t-py-3", title: "Syntax, Variables & Type Conversion" }
        ]
      },
      {
        name: "Python: Advanced & AI",
        icon: "fa-bolt",
        topics: [
          { id: "t-py-14", title: "Concurrency: GIL, Asyncio, Multiprocessing" },
          { id: "t-py-15", title: "Specialization: AI & Machine Learning" },
          { id: "t-py-16", title: "Specialization: Web (FastAPI) & Data Science" }
        ]
      },
      // WEB DEV ROADMAP
      {
        name: "Web: HTML & Internet",
        icon: "fa-globe",
        topics: [
          { id: "t-web-1", title: "How the Web Works & Dev Tools" },
          { id: "t-web-2", title: "Semantic HTML5 & Accessibility" },
          { id: "t-web-3", title: "Forms, Validation & SEO Basics" }
        ]
      },
      {
        name: "Web: CSS Styling",
        icon: "fa-palette",
        topics: [
          { id: "t-web-4", title: "CSS Core: Selectors, Cascade, Box Model" },
          { id: "t-web-5", title: "Layouts: Flexbox & CSS Grid Mastery" },
          { id: "t-web-6", title: "Responsive Design & Media Queries" }
        ]
      },
      {
        name: "Web: JS Fundamentals",
        icon: "fa-brands fa-js",
        topics: [
          { id: "t-web-8", title: "JavaScript Core: Types, Functions, Scope" },
          { id: "t-web-9", title: "DOM Manipulation & Event Handling" },
          { id: "t-web-10", title: "Asynchronous JS: Fetch, Promises, APIs" }
        ]
      },
      {
        name: "Web: Full-Stack React",
        icon: "fa-brands fa-react",
        topics: [
          { id: "t-web-11", title: "React Basics: JSX, Components, Props" },
          { id: "t-web-12", title: "State & Hooks: useState, useEffect" },
          { id: "t-web-14", title: "Backend: Node.js, Express & MongoDB" }
        ]
      },
      // DATA ANALYSIS ROADMAP 2026
      {
        name: "Data: Foundations",
        icon: "fa-calculator",
        topics: [
          { id: "t-da-1", title: "Math for Data: Algebra & Calculus Basics" },
          { id: "t-da-2", title: "Statistics: Descriptive & Inferential" },
          { id: "t-da-3", title: "Python for Data: Core Programming" }
        ]
      },
      {
        name: "Data: Manipulation",
        icon: "fa-table",
        topics: [
          { id: "t-da-4", title: "NumPy: Numerical Operations & Arrays" },
          { id: "t-da-5", title: "Pandas: DataFrames & Slicing" },
          { id: "t-da-6", title: "Data Cleaning: Outliers & Missing Values" }
        ]
      },
      {
        name: "Data: Visualization",
        icon: "fa-chart-line",
        topics: [
          { id: "t-da-7", title: "Matplotlib: Plotting Fundamentals" },
          { id: "t-da-8", title: "Seaborn: Statistical Visuals" },
          { id: "t-da-9", title: "Storytelling with Data: Best Practices" }
        ]
      },
      {
        name: "Data: SQL Mastery",
        icon: "fa-database",
        topics: [
          { id: "t-da-10", title: "SQL Basics: Queries & Aggregations" },
          { id: "t-da-11", title: "Advanced SQL: Joins, CTEs & Subqueries" },
          { id: "t-da-12", title: "SQL in Python: sqlite3 & SQLAlchemy" }
        ]
      },
      {
        name: "Data: Advanced Techniques",
        icon: "fa-microchip",
        topics: [
          { id: "t-da-13", title: "Time Series Analysis & Forecasting" },
          { id: "t-da-14", title: "Correlation & Regression Modeling" },
          { id: "t-da-15", title: "ML for Analysis: Scikit-learn Basics" }
        ]
      },
      {
        name: "Data: BI & Reporting",
        icon: "fa-display",
        topics: [
          { id: "t-da-16", title: "Excel for Data: Pivot Tables & Power Query" },
          { id: "t-da-17", title: "Tableau & Power BI Dashboards" },
          { id: "t-da-18", title: "Portfolio Building: Git & Case Studies" }
        ]
      }
    ]
  }
];
