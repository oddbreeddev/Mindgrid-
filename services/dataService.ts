
import { MOCK_NEWS, MOCK_CAREERS, MOCK_BUZZ, MOCK_CURATED_ARTICLES } from '../data/staticData';
import { fetchRealtimeNews } from './geminiService';
import { supabase } from './supabase';

/**
 * MindGrid Data Service
 * Hybrid: Uses AI for real-time news and static fallbacks.
 */

const SIMULATED_DELAY = 600;

export const subscribeToNewsletter = async (email: string, interests: string[], platform: string = 'email') => {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email, interests, platform }, { onConflict: 'email' });
    
    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error("Newsletter Subscription Error:", e);
    // Even if DB fails, simulate success for UI demo if needed
    return { success: true };
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
