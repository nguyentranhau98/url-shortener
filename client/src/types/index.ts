export interface ShortUrlResponse {
  urlSlug: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
}

export interface ShortenUrlRequest {
  originalUrl: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
