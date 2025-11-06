import axios, { AxiosInstance, AxiosError } from 'axios';
import { ShortUrlResponse, ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: `${API_URL}${API_BASE_PATH}`,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                const apiError: ApiError = {
                    message: (error.response?.data as any)?.message || error.message || 'An error occurred',
                    statusCode: error.response?.status || 500,
                };
                return Promise.reject(apiError);
            }
        );
    }

    async shortenUrl(originalUrl: string): Promise<ShortUrlResponse> {
        const response = await this.client.post<{message: ShortUrlResponse}>('/shorten-url', { url: originalUrl });
        return response.data.message;
    }
}

export const apiClient = new ApiClient();
export default apiClient;
