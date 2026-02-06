
import { MOCK_NEWS, MOCK_CAREERS, MOCK_BUZZ } from '../data/staticData';
import { fetchRealtimeNews } from './geminiService';

/**
 * MindGrid Data Service
 * Hybrid: Uses AI for real-time news and static fallbacks.
 */

const SIMULATED_DELAY = 600;

export const getNews = async (category: string = 'All') => {
  // Try to fetch real-time news first
  try {
    const realtimeNews = await fetchRealtimeNews(category);
    if (realtimeNews && realtimeNews.length > 0) {
      return realtimeNews;
    }
  } catch (e) {
    console.warn("Falling back to static news due to error:", e);
  }

  // Fallback to static mock data
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
  if (category === 'All') return MOCK_NEWS;
  return MOCK_NEWS.filter(news => news.category.toLowerCase() === category.toLowerCase());
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
