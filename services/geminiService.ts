import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI. Note: process.env.API_KEY is injected by Vite at build time.
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("MindGrid Error: API_KEY is missing. Ensure it is set in your deployment environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getAIInstance();

/**
 * Generates study help or mentorship advice.
 */
export const generateStudyHelp = async (query: string) => {
  if (!ai) throw new Error("AI service not initialized. Check API Key.");
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `You are MindGrid AI, a multi-talented tutor for Nigerian students. 
        Your expertise covers academic help and tech mentorship. 
        Tone: Professional, encouraging, and witty.`,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Generates an AI-powered study schedule based on user goals.
 */
export const generateAISchedule = async (goal: string) => {
  if (!ai) return null;
  try {
    const prompt = `Create a balanced weekly study timetable for a Nigerian student preparing for: "${goal}". 
    The schedule should cover Monday to Sunday. 
    For each day, provide 2-3 specific study sessions with a subject name and a focus topic.
    Format the output as a JSON array of objects. Each object should have 'day' (string), and 'sessions' (array of {subject, topic}).`;

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
  } catch (error) {
    console.error("Schedule Gen Error:", error);
    return null;
  }
};

/**
 * Fetches real-time verified news using Google Search Grounding.
 */
export const fetchLatestNews = async (category: string) => {
  if (!ai) return [];
  try {
    const prompt = `Find the 5 most recent and verified news articles or updates for Nigerian students related to "${category}". 
    Format as JSON array: {title, excerpt, category, date}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              excerpt: { type: Type.STRING },
              category: { type: Type.STRING },
              date: { type: Type.STRING }
            },
            required: ["title", "excerpt", "category"]
          }
        }
      },
    });

    const articles = JSON.parse(response.text.trim());
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return articles.map((article: any, index: number) => ({
      ...article,
      url: chunks[index]?.web?.uri || chunks[0]?.web?.uri || "https://google.com/search?q=" + encodeURIComponent(article.title)
    }));
  } catch (error) {
    console.error("News Fetch Error:", error);
    return [];
  }
};

/**
 * Fetches trending social media topics for Nigerian students.
 */
export const fetchSocialBuzz = async () => {
  if (!ai) return [];
  try {
    const prompt = `Identify 6 trending topics, memes, or discussions currently buzzing among Nigerian university students on Twitter, TikTok, and Instagram in the last 48 hours.
    Format as JSON array of objects: {platform, topic, explanation, trendLevel}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING },
              topic: { type: Type.STRING },
              explanation: { type: Type.STRING },
              trendLevel: { type: Type.NUMBER }
            },
            required: ["platform", "topic", "explanation", "trendLevel"]
          }
        }
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Social Buzz Error:", error);
    return [];
  }
};