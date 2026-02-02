
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
