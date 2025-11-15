
import { PromptTemplate } from '../types';

const STORAGE_KEY = 'customPromptTemplates';

export const getCustomTemplates = (): PromptTemplate[] => {
    try {
        const templatesJson = localStorage.getItem(STORAGE_KEY);
        const templates: PromptTemplate[] = templatesJson ? JSON.parse(templatesJson) : [];
        // Backfill createdAt for older templates for sorting
        return templates.map(t => ({
            ...t,
            createdAt: t.createdAt || 0,
        }));
    } catch (error) {
        console.error("Failed to parse custom templates from localStorage", error);
        return [];
    }
};

export const saveCustomTemplates = (templates: PromptTemplate[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
        console.error("Failed to save custom templates to localStorage", error);
    }
};