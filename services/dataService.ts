
import { MOCK_NEWS, MOCK_CAREERS, MOCK_BUZZ, MOCK_CURATED_ARTICLES } from '../data/staticData';
import { fetchRealtimeNews } from './geminiService';
import { supabase } from './supabase';

/**
 * MindGrid Data Service
 */

// Social Feed Functions
export const getSocialPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("Failed to fetch social posts:", e);
    return [];
  }
};

export const createSocialPost = async (userId: string, email: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        user_id: userId,
        user_email: email,
        content: content
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Failed to create post:", e);
    throw e;
  }
};

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

// Lesson Caching Functions
export const getCachedLesson = async (subject: string, topic: string) => {
  try {
    const key = `${subject}:${topic}`.toLowerCase();
    const { data, error } = await supabase
      .from('lessons_cache')
      .select('content')
      .eq('subject_topic_key', key)
      .maybeSingle();
    
    if (error) throw error;
    return data?.content || null;
  } catch (e) {
    console.error("Cache Fetch Error:", e);
    return null;
  }
};

export const saveLessonToCache = async (subject: string, topic: string, content: any) => {
  try {
    const key = `${subject}:${topic}`.toLowerCase();
    await supabase.from('lessons_cache').upsert({
      subject_topic_key: key,
      content: content
    }, { onConflict: 'subject_topic_key' });
  } catch (e) {
    console.error("Cache Save Error:", e);
  }
};

// Admin Services
export const logBroadcast = async (title: string, content: string, reach: number) => {
  try {
    const { data, error } = await supabase
      .from('broadcast_logs')
      .insert({ title, content, reach, sent_at: new Date().toISOString() })
      .select();
    if (error) throw error;
    return data;
  } catch (e) { return null; }
};

export const getBroadcastHistory = async () => {
  try {
    const { data, error } = await supabase.from('broadcast_logs').select('*').order('sent_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) { return []; }
};

export const getAllSubscribers = async () => {
  try {
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) { return []; }
};

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
  } catch (e) { return { subscribers: 0, students: 0, academicOperations: 0, knowledgeEntries: 0 }; }
};

export const downloadSubscribersCSV = (subscribers: any[]) => {
  const headers = ['Email', 'Platform', 'Interests', 'Joined At'];
  const rows = subscribers.map(s => [
    s.email,
    s.platform,
    s.interests?.join('; '),
    new Date(s.created_at).toLocaleDateString()
  ]);
  
  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `mindgrid_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getNews = async (category: string = 'All') => {
  try {
    const realtimeNews = await fetchRealtimeNews(category);
    if (realtimeNews && realtimeNews.length > 0) return realtimeNews;
  } catch (e) {}
  if (category === 'All') return MOCK_NEWS;
  return MOCK_NEWS.filter(news => news.category.toLowerCase() === category.toLowerCase());
};

export const getCuratedArticles = async () => {
  try {
    const { data, error } = await supabase.from('curated_articles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return [...(data || []), ...MOCK_CURATED_ARTICLES];
  } catch (e) { return MOCK_CURATED_ARTICLES; }
};

export const saveCuratedArticle = async (article: any, userEmail?: string) => {
  try {
    const { data, error } = await supabase.from('curated_articles').insert({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      suggested_by: userEmail || 'Anonymous Student',
      image_id: Math.floor(Math.random() * 1000).toString()
    }).select().single();
    if (error) throw error;
    return data;
  } catch (e) { return { ...article, id: Date.now().toString(), suggested_by: userEmail || 'Anonymous Student', created_at: new Date().toISOString() }; }
};

export const getCareers = async (query: string = '') => {
  if (!query) return MOCK_CAREERS;
  const lowerQuery = query.toLowerCase();
  return MOCK_CAREERS.filter(job => 
    job.title.toLowerCase().includes(lowerQuery) || 
    job.company.toLowerCase().includes(lowerQuery) ||
    job.description.toLowerCase().includes(lowerQuery)
  );
};

export const getSocialBuzz = async () => MOCK_BUZZ;
