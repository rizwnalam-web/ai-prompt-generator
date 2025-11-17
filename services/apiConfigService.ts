import { ApiProviderConfig } from '../types';

const GUEST_KEY = 'llmApiProviderConfigs_guest';

const getKeyForUser = (userId: string) => `llmApiProviderConfigs_${userId}`;

const getConfigsFromStorage = (key: string): ApiProviderConfig[] => {
    try {
        const configsJson = localStorage.getItem(key);
        return configsJson ? JSON.parse(configsJson) : [];
    } catch (error) {
        console.error(`Failed to get API configs from localStorage with key ${key}`, error);
        return [];
    }
};

const saveConfigsToStorage = (key: string, configs: ApiProviderConfig[]): void => {
    try {
        localStorage.setItem(key, JSON.stringify(configs));
    } catch (error) {
        console.error(`Failed to save API configs to localStorage with key ${key}`, error);
    }
};

// User-specific functions
export const getConfigs = (userId: string): ApiProviderConfig[] => {
    return getConfigsFromStorage(getKeyForUser(userId));
};

export const saveConfigs = (configs: ApiProviderConfig[], userId: string): void => {
    saveConfigsToStorage(getKeyForUser(userId), configs);
};

// Guest functions
export const getGuestConfigs = (): ApiProviderConfig[] => {
    return getConfigsFromStorage(GUEST_KEY);
};

export const saveGuestConfigs = (configs: ApiProviderConfig[]): void => {
    saveConfigsToStorage(GUEST_KEY, configs);
};

export const clearGuestConfigs = (): void => {
    try {
        localStorage.removeItem(GUEST_KEY);
    } catch (error) {
        console.error("Failed to clear guest configs from localStorage", error);
    }
}
