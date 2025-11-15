
import { GoogleGenAI } from "@google/genai";
import { getApiKey } from './apiKeyService';

export const generatePromptResponse = async (prompt: string): Promise<string> => {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error("API Key not set. Please configure your API Key in the settings.");
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        if (response && response.text) {
            return response.text;
        } else {
            throw new Error("Invalid response from Gemini API. The response may be empty or blocked.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            // Re-throw a more user-friendly error message
            throw new Error(`Failed to get response from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the Gemini API.");
    }
};
