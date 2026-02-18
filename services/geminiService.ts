
import { GoogleGenAI, Type, Modality } from "@google/genai";

export const isAIConfigured = () => {
  return !!process.env.API_KEY && process.env.API_KEY.length > 10;
};

const throttle = async () => {
  // Use a module-level variable for throttling
  if (!(window as any)._lastRequestTimestamp) (window as any)._lastRequestTimestamp = 0;
  const now = Date.now();
  const timeSinceLast = now - (window as any)._lastRequestTimestamp;
  if (timeSinceLast < 1500) {
    await new Promise(resolve => setTimeout(resolve, 1500 - timeSinceLast));
  }
  (window as any)._lastRequestTimestamp = Date.now();
};

const parseAIResponse = (text: any) => {
  if (!text || typeof text !== 'string') return null;
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse AI JSON response", e);
    return null;
  }
};

export const generateLessonContent = async (subject: string, topic: string) => {
  if (!isAIConfigured()) throw new Error("API_KEY_MISSING");
  await throttle();

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isPython = subject.toLowerCase().includes('python');
  const isWeb = subject.toLowerCase().includes('web');
  const isData = subject.toLowerCase().includes('data');
  
  let systemInstruction = "You are the Head Tutor at MindGrid CramZone. You specialize in the Nigerian JAMB/WAEC Syllabus. Your explanations are clear, concise, and focused on helping students score high in UTME/WASSCE.";
  let localContextPrompt = "A section explaining how this topic specifically appears in JAMB/WAEC, common traps for Nigerian students, or local mnemonics.";

  if (isPython) {
    systemInstruction = "You are the Senior Python Engineer at MindGrid. You specialize in teaching modern Python (3.12+). You use type hints, PEP 8 standards, and high-performance patterns.";
    localContextPrompt = "A section named 'Naija Tech Career' explaining how this specific Python skill is used in the local ecosystem.";
  } else if (isWeb) {
    systemInstruction = "You are the Lead Web Architect at MindGrid. You teach modern Full-Stack Development (React, Node, Tailwind).";
    localContextPrompt = "A section named 'Naija Web Ecosystem' explaining how this skill applies to the Nigerian market.";
  } else if (isData) {
    systemInstruction = "You are the Lead Data Scientist at MindGrid Analytics. You teach data analysis, statistics, and business intelligence.";
    localContextPrompt = "A section named 'Naija Data Insights' explaining how this analysis skill is valued in Nigeria.";
  }

  const prompt = `Generate a structured educational lesson for Category/Subject: ${subject} and Topic: ${topic}. 
  Return a JSON object with: theory (Markdown), examples (Markdown), naijaContext (Markdown), and quiz (3 MCQs).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theory: { type: Type.STRING },
            examples: { type: Type.STRING },
            naijaContext: { type: Type.STRING },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "answer", "explanation"]
              }
            }
          },
          required: ["theory", "examples", "naijaContext", "quiz"]
        }
      }
    });

    return parseAIResponse(response.text);
  } catch (error) {
    console.error("Lesson Generation Error:", error);
    return null;
  }
};

export const fetchCourseRequirements = async (course: string, university: string) => {
  if (!isAIConfigured()) throw new Error("API_KEY_MISSING");
  await throttle();

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Find the 2024/2025 admission requirements for "${course}" at "${university}" in Nigeria. Include JAMB combination, O-Level requirements, and cutoff mark.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are an expert Admissions Consultant for Nigerian Universities. Always cite sources from official portals.",
      },
    });

    const text = response.text || "No data found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    return { text, sources };
  } catch (error) {
    console.error("Course Finder Error:", error);
    throw error;
  }
};

export const generateFullArticle = async (topic?: string) => {
  if (!isAIConfigured()) throw new Error("API_KEY_MISSING");
  await throttle();

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = topic 
    ? `Write a 600-word academic guide for Nigerian students on: "${topic}". Return as JSON.`
    : `Choose a random trending academic/tech topic for Nigerian students. Return as JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are the Lead Editor of MindGrid Library. Return ONLY valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            excerpt: { type: Type.STRING },
            content: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["title", "excerpt", "content", "category"]
        }
      }
    });

    return parseAIResponse(response.text);
  } catch (error) {
    return null;
  }
};

export const generateStudyHelp = async (query: string, useSearch: boolean = false) => {
  if (!isAIConfigured()) throw new Error("API_KEY_MISSING");
  await throttle();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const searchCategory = category === 'All' ? 'Nigerian Education News' : `Nigerian ${category} news`;
  const prompt = `Find 3 recent student updates for: "${searchCategory}". Format as a JSON array of objects with title, excerpt, date, url.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        // Rule: Search grounding responses may not be JSON. We request JSON in the prompt but don't force mimeType.
      },
    });
    // Attempt parsing. If fails, returning mock/null is handled by caller.
    return parseAIResponse(response.text);
  } catch (error) { return null; }
};

export const generateAISchedule = async (goal: string) => {
  if (!isAIConfigured()) return null;
  await throttle();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: `Generate a 7-day study plan for: "${goal}". Return as JSON.` }] }],
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
    return parseAIResponse(response.text);
  } catch (error) { return null; }
};

export const textToSpeech = async (text: string) => {
  if (!isAIConfigured()) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
