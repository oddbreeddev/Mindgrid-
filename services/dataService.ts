
import { MOCK_NEWS, MOCK_CAREERS, MOCK_BUZZ, MOCK_CURATED_ARTICLES } from '../data/staticData';
import { fetchRealtimeNews } from './geminiService';
import { supabase } from './supabase';

/**
 * MindGrid Data Service
 */

const SIMULATED_DELAY = 600;

export const subscribeToNewsletter = async (email: string, interests: string[], platform: string = 'email') => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ 
        email: email.trim().toLowerCase(), 
        interests: interests.length > 0 ? interests : ['General'], 
        platform 
      }, { onConflict: 'email' })
      .select();
    
    if (error) {
      console.error("Supabase Submission Error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (e: any) {
    console.error("Newsletter Subscription Exception:", e);
    return { success: false, error: e.message || 'Unknown network error' };
  }
};

// Admin Service: Log a new broadcast campaign
export const logBroadcast = async (title: string, content: string, reach: number) => {
  try {
    const { data, error } = await supabase
      .from('broadcast_logs')
      .insert({
        title,
        content,
        reach,
        sent_at: new Date().toISOString()
      })
      .select();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Failed to log broadcast", e);
    return null;
  }
};

// Admin Service: Fetch broadcast history
export const getBroadcastHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('broadcast_logs')
      .select('*')
      .order('sent_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("Failed to fetch broadcast history", e);
    return [];
  }
};

// Admin Service: Fetch all subscribers
export const getAllSubscribers = async () => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("Failed to fetch subscribers", e);
    return [];
  }
};

// Export to CSV helper
export const downloadSubscribersCSV = (subscribers: any[]) => {
  const headers = ['Email', 'Platform', 'Interests', 'Joined At'];
  const csvContent = [
    headers.join(','),
    ...subscribers.map(s => [
      s.email,
      s.platform,
      `"${s.interests?.join('; ')}"`,
      s.created_at
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `mindgrid_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Admin Service: Comprehensive Platform Stats
export const getAdminDashboardStats = async () => {
  try {
    const [subscribers, profiles, records, articles] = await Promise.all([
      supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('cgpa_records').select('id', { count: 'exact', head: true }),
      supabase.from('curated_articles').select('id', { count: 'exact', head: true })
    ]);

    return {
      subscribers: subscribers.count || 0,
      students: profiles.count || 0,
      academicOperations: records.count || 0,
      knowledgeEntries: (articles.count || 0) + MOCK_CURATED_ARTICLES.length
    };
  } catch (e) {
    console.error("Stats Fetch Error:", e);
    return { subscribers: 0, students: 0, academicOperations: 0, knowledgeEntries: 0 };
  }
};

export const getNews = async (category: string = 'All') => {
  try {
    const realtimeNews = await fetchRealtimeNews(category);
    if (realtimeNews && realtimeNews.length > 0) {
      return realtimeNews;
    }
  } catch (e) {
    console.warn("Falling back to static news due to error:", e);
  }

  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
  if (category === 'All') return MOCK_NEWS;
  return MOCK_NEWS.filter(news => news.category.toLowerCase() === category.toLowerCase());
};

export const getCuratedArticles = async () => {
  try {
    const { data, error } = await supabase
      .from('curated_articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    const dbArticles = data || [];
    return [...dbArticles, ...MOCK_CURATED_ARTICLES];
  } catch (e) {
    console.error("Failed to fetch curated articles, returning mocks only", e);
    return MOCK_CURATED_ARTICLES;
  }
};

export const saveCuratedArticle = async (article: any, userEmail?: string) => {
  try {
    const { data, error } = await supabase
      .from('curated_articles')
      .insert({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        suggested_by: userEmail || 'Anonymous Student',
        image_id: Math.floor(Math.random() * 1000).toString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Failed to save curated article to Supabase", e);
    return { ...article, id: Date.now().toString(), suggested_by: userEmail || 'Anonymous Student', created_at: new Date().toISOString() };
  }
};

export const getCareers = async (query: string = '') => {
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
  if (!query) return MOCK_CAREERS;
  
  const lowerQuery = query.toLowerCase();
  return MOCK_CAREERS.filter(job => 
    job.title.toLowerCase().includes(lowerQuery) || 
    job.company.toLowerCase().includes(lowerQuery) ||
    job.description.toLowerCase().includes(lowerQuery)
  );
};

export const getSocialBuzz = async () => {
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY / 2));
  return MOCK_BUZZ;
};
