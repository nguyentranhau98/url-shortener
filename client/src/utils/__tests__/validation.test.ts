import { describe, it, expect } from 'vitest';
import { isValidUrl, normalizeUrl, validateUrl } from '../validation';

describe('validation utils', () => {
    describe('isValidUrl', () => {
        it('should return true for valid URLs', () => {
            expect(isValidUrl('https://example.com')).toBe(true);
            expect(isValidUrl('http://example.com')).toBe(true);
            expect(isValidUrl('https://example.com/path')).toBe(true);
        });

        it('should return false for invalid URLs', () => {
            expect(isValidUrl('not a url')).toBe(false);
            expect(isValidUrl('example')).toBe(false);
            expect(isValidUrl('')).toBe(false);
        });
    });

    describe('normalizeUrl', () => {
        it('should add https:// to URLs without protocol', () => {
            expect(normalizeUrl('example.com')).toBe('https://example.com');
            expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
        });

        it('should not modify URLs with protocol', () => {
            expect(normalizeUrl('https://example.com')).toBe('https://example.com');
            expect(normalizeUrl('http://example.com')).toBe('http://example.com');
        });
    });

    describe('validateUrl', () => {
        it('should return null for valid URLs', () => {
            expect(validateUrl('https://example.com')).toBeNull();
            expect(validateUrl('example.com')).toBeNull();
        });

        it('should return error for empty URL', () => {
            expect(validateUrl('')).toBe('URL is required');
            expect(validateUrl('   ')).toBe('URL is required');
        });

        it('should return error for too short URL', () => {
            expect(validateUrl('abc')).toBe('URL is too short');
        });

        it('should return error for too long URL', () => {
            const longUrl = 'https://example.com/' + 'a'.repeat(2050);
            expect(validateUrl(longUrl)).toBe('URL is too long (max 2048 characters)');
        });

        it('should return error for invalid URL', () => {
            expect(validateUrl('not a valid url at all')).toBe('Please enter a valid URL');
        });
    });
});
