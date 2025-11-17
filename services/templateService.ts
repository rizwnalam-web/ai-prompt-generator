import { PromptTemplate } from '../types';

const GUEST_KEY = 'customPromptTemplates_guest';

const getKeyForUser = (userId: string) => `customPromptTemplates_${userId}`;

const getTemplatesFromStorage = (key: string): PromptTemplate[] => {
     try {
        const templatesJson = localStorage.getItem(key);
        const templates: PromptTemplate[] = templatesJson ? JSON.parse(templatesJson) : [];
        // Backfill createdAt for older templates for sorting
        return templates.map(t => ({
            ...t,
            createdAt: t.createdAt || 0,
        }));
    } catch (error) {
        console.error(`Failed to parse custom templates from localStorage with key ${key}`, error);
        return [];
    }
}

const saveTemplatesToStorage = (key: string, templates: PromptTemplate[]): void => {
    try {
        localStorage.setItem(key, JSON.stringify(templates));
    } catch (error) {
        console.error(`Failed to save custom templates to localStorage with key ${key}`, error);
    }
}

// User-specific functions
export const getCustomTemplates = (userId: string): PromptTemplate[] => {
    return getTemplatesFromStorage(getKeyForUser(userId));
};

export const saveCustomTemplates = (templates: PromptTemplate[], userId: string): void => {
    saveTemplatesToStorage(getKeyForUser(userId), templates);
};


// Guest functions
export const getGuestTemplates = (): PromptTemplate[] => {
    return getTemplatesFromStorage(GUEST_KEY);
}

export const saveGuestTemplates = (templates: PromptTemplate[]): void => {
    saveTemplatesToStorage(GUEST_KEY, templates);
}

export const clearGuestTemplates = (): void => {
    try {
        localStorage.removeItem(GUEST_KEY);
    } catch (error) {
        console.error("Failed to remove guest templates from localStorage", error);
    }
}
