import { GoogleGenAI } from "@google/genai";

// NOTE: In a production app, never expose API keys on the client.
// This is for demonstration purposes within the constraints of this environment.
// The user would need to provide a key, or it would be proxied via backend.
// Safely check for process.env to avoid crashing in browsers where it's undefined
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) {
    // Ignore reference errors
  }
  return '';
};

const API_KEY = getApiKey();

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const generateResolutionDraft = async (
  prompt: string, 
  companyName: string
): Promise<string> => {
  if (!ai) {
    return "Gemini API Key not configured. Using standard template.";
  }

  try {
    const systemInstruction = `You are an expert Indian Company Secretary. 
    Draft a formal Board Resolution text for "${companyName}" based on the user's request. 
    Do not include the header (CERTIFIED TRUE COPY...), only the "RESOLVED THAT..." paragraphs.
    Keep it professional, legal, and compliant with Companies Act 2013.
    Return ONLY the resolution text paragraphs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Failed to generate draft.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI service.";
  }
};