
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client with the API key from the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a draft Board Resolution text using the Gemini model.
 */
export const generateResolutionDraft = async (
  prompt: string, 
  companyName: string
): Promise<string> => {
  try {
    const systemInstruction = `You are an expert Indian Company Secretary. 
    Draft a formal Board Resolution text for "${companyName}" based on the user's request. 
    Do not include the header (CERTIFIED TRUE COPY...), only the "RESOLVED THAT..." paragraphs.
    Keep it professional, legal, and compliant with Companies Act 2013.
    Return ONLY the resolution text paragraphs.`;

    // Use ai.models.generateContent to query the model with instructions and the prompt.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    // Extract text directly from the response property.
    return response.text || "Failed to generate draft.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI service.";
  }
};
