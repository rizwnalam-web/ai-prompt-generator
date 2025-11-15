
const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const getApiKey = (): string | null => {
    try {
        return localStorage.getItem(API_KEY_STORAGE_KEY);
    } catch (error) {
        console.error("Failed to get API key from localStorage", error);
        return null;
    }
};

export const saveApiKey = (apiKey: string): void => {
    try {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    } catch (error) {
        console.error("Failed to save API key to localStorage", error);
    }
};

export const removeApiKey = (): void => {
    try {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch (error) {
        console.error("Failed to remove API key from localStorage", error);
    }
}
