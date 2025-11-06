export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const normalizeUrl = (url: string): string => {
    if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
    }
    return url;
};

export const validateUrl = (url: string): string | null => {
    if (!url.trim()) {
        return 'URL is required';
    }

    if (url.length < 10) {
        return 'URL is too short';
    }

    if (url.length > 2048) {
        return 'URL is too long (max 2048 characters)';
    }

    const normalized = normalizeUrl(url);
    if (!isValidUrl(normalized)) {
        return 'Please enter a valid URL';
    }

    return null;
};
