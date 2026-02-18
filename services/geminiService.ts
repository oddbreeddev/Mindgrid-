
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

export const generateLessonContent = async (subject: string, topic: string) => {
  if (!isAIConfigured()) throw new Error("API_KEY_MISSING");
  await throttle();

  const isPython = subject.toLowerCase().includes('python');
  const isWeb = subject.toLowerCase().includes('web');
  const isData = subject.toLowerCase().includes('data');
  const isTech = isPython || isWeb || isData;
  
  let systemInstruction = "You are the Head Tutor at MindGrid CramZone. You specialize in the Nigerian JAMB/WAEC Syllabus. Your explanations are clear, concise, and focused on helping students score high in UTME/WASSCE.";
  let localContextPrompt = "A section explaining how this topic specifically appears in JAMB/WAEC, common traps for Nigerian students, or local mnemonics.";

  if (isPython) {
    systemInstruction = "You are the Senior Python Engineer at MindGrid. You specialize in teaching modern Python (3.12+). You use type hints, PEP 8 standards, and high-performance patterns. Your code is clean and production-ready.";
    localContextPrompt = "A section named 'Naija Tech Career' explaining how this specific Python skill is used in the local ecosystem (e.g., job market in Lagos, remote work for US companies, or backend for Nigerian fintechs).";
  } else if (isWeb) {
    systemInstruction = "You are the Lead Web Architect at MindGrid. You teach modern Full-Stack Development (React, Node, Tailwind). You focus on responsiveness, accessibility, and high-performance UI. Your code uses the latest ES6+ syntax.";
    localContextPrompt = "A section named 'Naija Web Ecosystem' explaining how this skill applies to the Nigerian market (e.g., building low-data usage sites for Nigerians, local payment gateway integrations like Paystack, or the startup scene in Yaba).";
  } else if (isData) {
    systemInstruction = "You are the Lead Data Scientist at MindGrid Analytics. You teach data analysis, statistics, and business intelligence. You focus on data integrity, clear visualization, and actionable insights. Your code examples use Pandas, NumPy, and SQL.";
    localContextPrompt = "A section named 'Naija Data Insights' explaining how this analysis skill is valued in Nigeria (e.g., data analyst roles in Nigerian banks, business intelligence for e-commerce like Jumia/Konga, or analyzing local census/economic data).";
  }

  const prompt = `Generate a structured educational lesson.
  Category/Subject: ${subject}
  Topic: ${topic}
  
  The response must be a JSON object with:
  1. theory: A detailed explanation of the concept (Markdown). Include high-quality, documented code snippets if tech.
  2. examples: 2-3 step-by-step solved problems or interactive code walkthroughs (Markdown).
  3. naijaContext: ${localContextPrompt}
  4. quiz: An array of 3 multiple-choice questions with options, correct answer index (0-3), and explanation.`;

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
                }
              }
            }
          },
          required: ["theory", "examples", "naijaContext", "quiz"]
        }
      }
    });

    return parseAIResponse(response.text || "{}");
  } catch (error) {
    console.error("Lesson Generation Error:", error);
    return null;
  }
};

export const fetchCourseRequirements = async (course: string, university: string) => {
  if (!isAIConfigured()) throw new Error("API_KEY_MISSING");
  await throttle();

  const prompt = `Find the 2024/2025 admission requirements for "${course}" at "${university}". 
  Include: 
  1. JAMB Subject Combination.
  2. O-Level (WAEC/NECO) requirements (minimum 5 subjects).
  3. Last known departmental cutoff mark.
  4. Direct Entry requirements if applicable.
  Return the data in a clear Markdown format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are an expert Admissions Consultant for Nigerian Universities. Provide accurate, grounded information for the current academic session. Always cite sources.",
      },
    });

    const text = response.text || "No data found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Admission Portal',
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

  const prompt = topic 
    ? `Write a detailed 600-word academic guide for Nigerian students on: "${topic}". 
       Structure: 1. Introduction, 2. Strategy, 3. Local Context, 4. Final Advice. Use Markdown.`
    : `Choose a random trending academic or tech topic for Nigerian students. Return as JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are the Lead Editor of the MindGrid Library. You write authoritative, verified, and deeply helpful guides for Nigerian scholars. Return ONLY valid JSON.",
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
