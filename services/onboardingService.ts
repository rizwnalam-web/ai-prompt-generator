const STORAGE_KEY = 'hasCompletedOnboarding';

export const hasCompletedTour = (): boolean => {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (error) {
        console.error("Failed to check tour completion status from localStorage", error);
        return false;
    }
};

export const markTourAsCompleted = (): void => {
    try {
        localStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
        console.error("Failed to save tour completion status to localStorage", error);
    }
};

export const resetTour = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Failed to reset tour status in localStorage", error);
    }
};
