export const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) {
        return '';
    }
    const date = new Date(timestamp);
    // Use toLocaleDateString for a simple, localized date format
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
