import { GoogleGenAI, Modality } from "@google/genai";
import { ApiProviderConfig } from '../types';

const generateWithGemini = async (prompt: string, config: ApiProviderConfig): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    try {
        const response = await ai.models.generateContent({
            model: config.model,
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
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the Gemini API.");
    }
};

const generateWithOpenAICompatible = async (prompt: string, config: ApiProviderConfig, endpoint: string): Promise<string> => {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
            throw new Error(errorData?.error?.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (typeof content === 'string') {
            return content;
        } else {
            throw new Error("Invalid response structure from the API.");
        }
    } catch (error) {
        console.error(`Error calling ${config.provider} API:`, error);
        if (error instanceof Error) {
            throw new Error(`${config.provider.toUpperCase()} API Error: ${error.message}`);
        }
        throw new Error(`An unknown error occurred while contacting the ${config.provider} API.`);
    }
};

export const generateResponse = async (prompt: string, config: ApiProviderConfig): Promise<string> => {
    if (config.provider !== 'gemini' && !config.apiKey) {
        throw new Error("API Key not set for the selected provider. Please configure it in the settings.");
    }

    switch (config.provider) {
        case 'gemini':
            return generateWithGemini(prompt, config);
        case 'openai':
            return generateWithOpenAICompatible(prompt, config, 'https://api.openai.com/v1/chat/completions');
        case 'grok':
            // NOTE: This is a placeholder endpoint. The actual Grok API endpoint may differ.
            return generateWithOpenAICompatible(prompt, config, 'https://api.x.ai/v1/chat/completions');
        case 'deepseek':
            return generateWithOpenAICompatible(prompt, config, 'https://api.deepseek.com/v1/chat/completions');
        default:
            throw new Error(`Unsupported provider: ${config.provider}`);
    }
};

export const generateSpeech = async (text: string, config: ApiProviderConfig, signal?: AbortSignal): Promise<string> => {
    if (config.provider !== 'gemini') {
        throw new Error('Speech generation is only supported for the Google Gemini provider.');
    }
    
    if (signal?.aborted) throw new DOMException('Aborted by user', 'AbortError');

    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a calm and engaging voice: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("Failed to generate audio. No data received.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error calling TTS API:", error);
        if (error instanceof Error) {
            throw new Error(`TTS API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the TTS API.");
    }
};

export const generateVideo = async (prompt: string, config: ApiProviderConfig, onStatusUpdate: (status: string) => void, signal?: AbortSignal): Promise<string> => {
    if (config.provider !== 'gemini') {
        throw new Error('Video generation is only supported for the Google Gemini provider.');
    }
    
    if (signal?.aborted) throw new DOMException('Aborted by user', 'AbortError');

    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    
    try {
        onStatusUpdate('Initializing video generation...');
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `An animated, whimsical short film based on this story: ${prompt}`,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        onStatusUpdate('Generation in progress... This may take a few minutes.');
        while (!operation.done) {
            if (signal?.aborted) throw new DOMException('Aborted by user', 'AbortError');
            await new Promise(resolve => setTimeout(resolve, 10000));
            onStatusUpdate('Checking progress...');
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation failed or returned no link.");
        }
        
        onStatusUpdate('Fetching video...');
        const videoUrlWithKey = `${downloadLink}&key=${config.apiKey}`;
        const response = await fetch(videoUrlWithKey, { signal });

        if (!response.ok) {
            throw new Error(`Failed to fetch video data. Status: ${response.statusText}`);
        }
        
        const videoBlob = await response.blob();
        const objectUrl = URL.createObjectURL(videoBlob);
        
        onStatusUpdate('Video ready!');
        return objectUrl;

    } catch (error) {
        console.error("Error calling Video API:", error);
        if ((error as Error).name !== 'AbortError') {
            onStatusUpdate('An error occurred during video generation.');
            if (error instanceof Error) {
                throw new Error(`Video API Error: ${error.message}`);
            }
            throw new Error("An unknown error occurred while contacting the Video API.");
        }
        throw error;
    }
};