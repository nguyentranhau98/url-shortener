import validUrl from 'valid-url';
import shortId from 'shortid';
import * as urlRepositories from './urls.repositories';

/**
 * Handle the shorten url progress.
 * @param {string} originalUrl - The original input url retrived from user input.
 * @param {string} baseUrl - The base url used for creating the shortened url.
 * @return {string} - The object contain the shortened urls.
 */
export async function shortenUrl(originalUrl: string, baseUrl: string) {
    if (!validUrl.isUri(baseUrl)) {
        throw new Error('Internal error. Please come back later.');
    }
    const uniqueCode = shortId.generate();
    if (validUrl.isUri(originalUrl)) {
        const newUrl = await urlRepositories.shortenUrl(originalUrl, baseUrl, uniqueCode);
        return newUrl;
    } else {
        throw new Error('Invalid URL. Please enter a valid url for shortening.');
    }
}

/**
 * Get the appropriate url if existed in the database using the uniqueCode.
 * @param {string} uniqueCode - The uniqueCode used for identifying the shortened url.
 * @return {string} - The object contain the shortened urls.
 */
export async function getUrl(uniqueCode: string) {
    return await urlRepositories.getUrl(uniqueCode);
}

/**
 * Update the user count limit.
 * @param {any} url - The url object containing the limit count.
 * @param {number} clickCount - The number of limit count to update.
 * @return {string} - The promise, indicating whether it succeeded or not.
 */
export async function updateCount(url: any, clickCount: number) {
    return await urlRepositories.updateCount(url, clickCount);
}
