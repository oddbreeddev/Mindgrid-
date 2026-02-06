
import { GoogleGenAI, Type, Modality } from "@google/genai";

/**
 * MindGrid AI Configuration
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Global throttler for AI Hub
let lastRequestTimestamp = 0;
const MIN_REQUEST_GAP = 2000;

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
 * AI Tutor - Enhanced with Google Search Grounding
 */
export const generateStudyHelp = async (query: string, useSearch: boolean = false) => {
  if (!isAIConfigured()) throw new Error("API_KEY_MISSING");
  await throttle();
  
  try {
    const config: any = {
      systemInstruction: `You are MindGrid AI, a specialized academic tutor for Nigerian students. 
      Help with JAMB, WAEC, NECO, and University courses. 
      Be concise. Use bullet points. If using search, cite sources.`,
      temperature: 0.7,
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: config,
    });
    
    const text = response.text || "I'm sorry, I couldn't generate a response.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    return { text, sources };
  } catch (error: any) {
    console.error("MindGrid AI Error:", error);
    throw error;
  }
};

/**
 * Fetch Real-time Educational News using Google Search
 */
export const fetchRealtimeNews = async (category: string) => {
  if (!isAIConfigured()) return null;
  await throttle();

  const searchCategory = category === 'All' ? 'Education and Scholarships' : category;
  const prompt = `Find the 5 most recent and relevant news updates about "${searchCategory}" for students in Nigeria. 
  For each news item, provide exactly these three fields separated by "||":
  1. A clear, catchy title
  2. A 2-sentence excerpt/summary
  3. The relative date (e.g., '2 hours ago', 'Yesterday', 'Mar 15')
  
  Separate each news item with "###ITEM_SPLIT###".
  Example format:
  JAMB 2025 Registration Starts || Registration for the 2025 UTME has officially commenced across all CBT centers. Candidates are advised to... || 2 hours ago
  ###ITEM_SPLIT###
  ...next item...`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const rawText = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'External Source',
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    const items = rawText.split('###ITEM_SPLIT###').map((block, index) => {
      const parts = block.split('||').map(p => p.trim());
      if (parts.length >= 2) {
        return {
          title: parts[0],
          excerpt: parts[1],
          date: parts[2] || "Recently",
          category: category === 'All' ? 'News' : category,
          url: sources[index]?.uri || (sources.length > 0 ? sources[0].uri : "https://google.com/search?q=" + encodeURIComponent(parts[0])),
          isRealtime: true
        };
      }
      return null;
    }).filter(Boolean);

    return items.length > 0 ? items : null;
  } catch (error) {
    console.error("Realtime News Error:", error);
    return null;
  }
};

/**
 * Text-to-Speech for educational content
 */
export const textToSpeech = async (text: string) => {
  if (!isAIConfigured()) return null;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this academic explanation clearly: ${text.substring(0, 500)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Professional, clear voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
};

/**
 * AI Timetable Generation
 */
export const generateAISchedule = async (goal: string) => {
  if (!isAIConfigured()) return null;
  await throttle();
  
  const prompt = `Create a weekly study timetable for a Nigerian student for: "${goal}". Monday-Sunday. Focus on major subjects. Return as JSON array.`;
  
  try {
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
  } catch (e) {
    console.error("Schedule Gen Error", e);
    return null;
  }
};
