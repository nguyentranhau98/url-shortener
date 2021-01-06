import { URLModel } from '../../database/schema/url';

/**
 * Create new the shorten url record if not existed, otherwise return the existed one.
 * @param {string} originalUrl - The original input url retrived from user input.
 * @param {string} baseUrl - The base url used for creating the shortened url.
 * @param {string} uniqueCode - The unique code used to create the shortened url.
 * @return {string} - The object contain the shortened urls.
 */
export async function shortenUrl(
    originalUrl: string,
    baseUrl: string,
    uniqueCode: string,
) {
    try {
        let url = await URLModel.findOne({ originalUrl: originalUrl });
        if (url) {
            return url;
        } else {
            const shortUrl = `${baseUrl}/${uniqueCode}`;
            url = new URLModel({
                urlSlug: uniqueCode,
                originalUrl,
                shortUrl,
                clickCount: 0,
            });
            await url.save();
            return url;
        }
    } catch (err) {
        throw new Error(err);
    }
}

/**
 * Get the appropriate url from the database if existed in the database using the uniqueCode.
 * @param {string} uniqueCode - The uniqueCode used for identifying the shortened url.
 * @return {any} - a document containing information of the records that satisfy the criteria, or an error if failed.
 */
export async function getUrl(uniqueCode: string) {
    try {
        return await URLModel.findOne({ urlSlug: uniqueCode });
    } catch (error) {
        throw new Error(error);
    }
}

/**
 * Update the user count limit in the database.
 * @param {any} url - The url object containing the limit count.
 * @param {number} clickCount - The number of limit count to update.
 * @return {any} - a document containing information of the updated record, or an error if failed.
 */
export async function updateCount(url: any, clickCount: number) {
    try {
        return await url.updateOne({ clickCount });
    } catch (error) {
        throw new Error(error);
    }
}
