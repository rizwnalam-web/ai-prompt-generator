import { ApiProviderConfig } from '../types';

const CONFIG_STORAGE_KEY = 'llmApiProviderConfigs';

export const getConfigs = (): ApiProviderConfig[] => {
    try {
        const configsJson = localStorage.getItem(CONFIG_STORAGE_KEY);
        return configsJson ? JSON.parse(configsJson) : [];
    } catch (error) {
        console.error("Failed to get API configs from localStorage", error);
        return [];
    }
};

export const saveConfigs = (configs: ApiProviderConfig[]): void => {
    try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
    } catch (error) {
        console.error("Failed to save API configs to localStorage", error);
    }
};
