
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let lastRequestTimestamp = 0;
const MIN_REQUEST_GAP = 1500;

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
  return !!process.env.API_KEY && process.env.API_KEY.length > 10;
};

const parseAIResponse = (text: string) => {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse AI JSON response", e);
    return null;
  }
};

/**
 * Generates a full, structured academic article.
 * If no topic is provided, it acts as the "Discovery Engine".
 */
export const generateFullArticle = async (topic?: string) => {
  if (!isAIConfigured()) throw new Error("API_KEY_MISSING");
  await throttle();

  const prompt = topic 
    ? `Write a detailed 600-word academic guide for Nigerian students on: "${topic}". 
       Structure: 
       1. Introduction 
       2. Detailed Strategy/Steps 
       3. Local Context (How it applies in Nigeria) 
       4. Final Advice. 
       Use Markdown formatting.`
    : `Choose a random, highly specific trending academic or career topic for Nigerian students (e.g. 'How to score 300+ in JAMB Use of English', 'A guide to Computer Science at UNN', 'Landing a Remote Tech Job as a Nigerian Student'). 
       Write a 600-word high-quality guide. Return as JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are the Lead Editor of the MindGrid Library. You write authoritative, verified, and deeply helpful guides for Nigerian scholars. Use local terms like 'Merit List', 'Post-UTME', 'Catchment Area', etc. Return ONLY valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            excerpt: { type: Type.STRING, description: "One-sentence hook." },
            content: { type: Type.STRING, description: "Full Markdown guide." },
            category: { type: Type.STRING, description: "JAMB, WAEC, University, Tech, Career, or Scholarships" }
          },
          required: ["title", "excerpt", "content", "category"]
        }
      }
    });

    return parseAIResponse(response.text || "{}");
  } catch (error) {
    console.error("Discovery Generation Error:", error);
    return null;
  }
};

export const generateStudyHelp = async (query: string, useSearch: boolean = false) => {
  if (!isAIConfigured()) throw new Error("API_KEY_MISSING");
  await throttle();
  try {
    const config: any = {
      systemInstruction: `You are MindGrid AI, an academic mentor for Nigerians. Grounding: JAMB, WAEC, NUC.`,
      temperature: 0.8,
    };
    if (useSearch) config.tools = [{ googleSearch: {} }];
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: query }] }],
      config: config,
    });
    const text = response.text || "Failed to generate response.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];
    return { text, sources };
  } catch (error: any) { throw error; }
};

export const fetchRealtimeNews = async (category: string) => {
  if (!isAIConfigured()) return null;
  await throttle();
  const searchCategory = category === 'All' ? 'Nigerian Education News' : `Nigerian ${category} news`;
  const prompt = `Recent student updates for: "${searchCategory}".`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
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
              date: { type: Type.STRING },
              url: { type: Type.STRING }
            }
          }
        }
      },
    });
    return parseAIResponse(response.text || "[]");
  } catch (error) { return null; }
};

export const generateAISchedule = async (goal: string) => {
  if (!isAIConfigured()) return null;
  await throttle();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: `Study plan for: "${goal}".` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              sessions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, topic: { type: Type.STRING } } } }
            }
          }
        }
      },
    });
    return parseAIResponse(response.text || "[]");
  } catch (error) { return null; }
};

export const textToSpeech = async (text: string) => {
  if (!isAIConfigured()) return null;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.substring(0, 1000) }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) { return null; }
};
