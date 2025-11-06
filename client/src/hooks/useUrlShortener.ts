import { useState } from 'react';
import { apiClient } from '@services/api';
import { ShortUrlResponse, ApiError } from '../types';

interface UseUrlShortenerReturn {
    shortenUrl: (url: string) => Promise<void>;
    loading: boolean;
    error: string | null;
    result: ShortUrlResponse | null;
    clearResult: () => void;
}

export const useUrlShortener = (): UseUrlShortenerReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ShortUrlResponse | null>(null);

    const shortenUrl = async (url: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.shortenUrl(url);
            setResult(response);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message);
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const clearResult = () => {
        setResult(null);
        setError(null);
    };

    return { shortenUrl, loading, error, result, clearResult };
};
