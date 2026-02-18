
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: 'JAMB' | 'WAEC' | 'Scholarship' | 'University' | 'Career' | 'Tech';
  date: string;
  image: string;
}

export interface CareerOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
}

export interface GradeScale {
  grade: string;
  point: number;
}

export interface SyllabusTopic {
  id: string;
  title: string;
}

export interface SyllabusSubject {
  name: string;
  icon: string;
  topics: SyllabusTopic[];
}

export interface LessonContent {
  subject: string;
  topic: string;
  theory: string;
  examples: string;
  naijaContext: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
}

export interface UserProgress {
  topic_id: string;
  completed_at: string;
}
