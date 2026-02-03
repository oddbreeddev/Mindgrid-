
import { GoogleGenAI, Type } from "@google/genai";

/**
 * MindGrid AI Configuration
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Global throttler to keep within 15 RPM (Requests Per Minute)
let lastRequestTimestamp = 0;
const MIN_REQUEST_GAP = 4000; // 4 seconds between any two AI calls

/**
 * Ensures we don't spam the API. If called too quickly, it waits.
 */
const throttle = async () => {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTimestamp;
  if (timeSinceLast < MIN_REQUEST_GAP) {
    const waitTime = MIN_REQUEST_GAP - timeSinceLast;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTimestamp = Date.now();
};

export const isAIConfigured = () => {
  return !!process.env.API_KEY && process.env.API_KEY.length > 5;
};

/**
 * Intelligent Cache with per-category TTL
 */
const withSmartCache = async <T>(key: string, ttlHours: number, forceRefresh: boolean, fetcher: () => Promise<T>): Promise<T> => {
  const cacheKey = `mindgrid_v2_${key}`;
  const now = Date.now();
  
  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        const ageHours = (now - timestamp) / (1000 * 60 * 60);
        if (ageHours < ttlHours) {
          console.log(`[MindGrid AI] Serving fresh cache for ${key} (${Math.round(ageHours * 60)}m old)`);
          return data;
        }
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }
  }

  await throttle();
  const data = await fetcher();
  localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data }));
  return data;
};

export const generateStudyHelp = async (query: string) => {
  if (!isAIConfigured()) throw new Error("API_KEY_MISSING");
  await throttle();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction: `You are MindGrid AI, a specialized academic tutor for Nigerian students. 
        Be extremely concise. Use bullet points for steps. Focus on WAEC/JAMB standards.`,
        temperature: 0.6,
        maxOutputTokens: 800, // Keeps responses concise and token-efficient
      },
    });
    
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("MindGrid AI Error:", error);
    throw error;
  }
};

export const generateAISchedule = async (goal: string) => {
  if (!isAIConfigured()) return null;
  // Schedules are cached for 24 hours
  return withSmartCache(`schedule_${goal.replace(/\s+/g, '_')}`, 24, false, async () => {
    const prompt = `Create a weekly study timetable for a Nigerian student for: "${goal}". Monday-Sunday. JSON array of {day, sessions: [{subject, topic}]}.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              sessions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    topic: { type: Type.STRING }
                  },
                  required: ["subject", "topic"]
                }
              }
            },
            required: ["day", "sessions"]
          }
        }
      }
    });
    return JSON.parse(response.text.trim());
  });
};

export const fetchLatestNews = async (category: string, forceRefresh: boolean = false) => {
  if (!isAIConfigured()) return [];
  // News is cached for 4 hours
  return withSmartCache(`news_${category}`, 4, forceRefresh, async () => {
    const prompt = `5 most recent verified news articles for Nigerian students: "${category}". JSON: [{title, excerpt, category, date}].`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });
    const articles = JSON.parse(response.text.trim());
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return articles.map((a: any, i: number) => ({
      ...a,
      url: chunks[i]?.web?.uri || chunks[0]?.web?.uri || `https://google.com/search?q=${encodeURIComponent(a.title)}`
    }));
  });
};

export const fetchCareerOpportunities = async (query: string = "Graduate Trainee", forceRefresh: boolean = false) => {
  if (!isAIConfigured()) return [];
  // Careers are cached for 8 hours
  return withSmartCache(`careers_${query}`, 8, forceRefresh, async () => {
    const prompt = `6 verified career opportunities in Nigeria: ${query}. JSON: [{title, company, location, type, description, postedDate}].`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });
    const jobs = JSON.parse(response.text.trim());
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return jobs.map((j: any, i: number) => ({
      ...j,
      url: chunks[i]?.web?.uri || chunks[0]?.web?.uri || `https://google.com/search?q=${encodeURIComponent(j.company + ' ' + j.title)}`
    }));
  });
};

export const fetchSocialBuzz = async (forceRefresh: boolean = false) => {
  if (!isAIConfigured()) return [];
  // Buzz is cached for 2 hours
  return withSmartCache('social_buzz', 2, forceRefresh, async () => {
    const prompt = `6 trending topics for Nigerian university students in last 48h. JSON: [{platform, topic, explanation, trendLevel}].`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text.trim());
  });
};
