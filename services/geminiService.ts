
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates study help or mentorship advice.
 */
export const generateStudyHelp = async (query: string) => {
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
  try {
    const prompt = `Create a balanced weekly study timetable for a Nigerian student preparing for: "${goal}". 
    The schedule should cover Monday to Sunday. 
    For each day, provide 2-3 specific study sessions with a subject name and a focus topic.
    Format the output as a JSON array of objects. Each object should have 'day' (string), and 'sessions' (array of {subject, topic}).
    Do not add markdown formatting. Just raw JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text || "[]";
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Schedule Gen Error:", error);
    return null;
  }
};

/**
 * Fetches real-time verified news using Google Search Grounding.
 */
export const fetchLatestNews = async (category: string) => {
  try {
    const prompt = `Find the 5 most recent and verified news articles or updates for Nigerian students related to "${category}". 
    Format as JSON array: {title, excerpt, category, date}. No markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "[]";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    
    try {
      const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const articles = JSON.parse(cleanJson);
      const chunks = groundingMetadata?.groundingChunks || [];
      return articles.map((article: any, index: number) => ({
        ...article,
        url: chunks[index]?.web?.uri || chunks[0]?.web?.uri || "https://google.com/search?q=" + encodeURIComponent(article.title)
      }));
    } catch (e) {
      return [];
    }
  } catch (error) {
    return [];
  }
};

/**
 * Fetches trending social media topics for Nigerian students.
 */
export const fetchSocialBuzz = async () => {
  try {
    const prompt = `Identify 6 trending topics, memes, or discussions currently buzzing among Nigerian university students on Twitter, TikTok, and Instagram in the last 48 hours.
    Format as JSON array of objects: {platform, topic, explanation, trendLevel (1-10)}.
    Platforms should be one of: 'Twitter', 'TikTok', 'Instagram', 'Facebook'.
    No markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        temperature: 0.9 
      },
    });

    const text = response.text || "[]";
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Social Buzz Error:", error);
    return [];
  }
};
