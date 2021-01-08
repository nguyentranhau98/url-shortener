import * as dbHandler from './db-handler';
import * as urlService from '../urls.services';

jest.setTimeout(30000);

/**
 * Complete url example.
 */
const urlComplete = {
    url: 'https://www.facebook.com/',
    baseUrl: 'localhost:3000',
};

/**
 * Complete url example.
 */
const urlError = {
    url: 'www.facebook.com/',
    baseUrl: 'localhost:3000',
};

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async (done) => {
    await dbHandler.connect();
    done();
});

/**
 * Clear all test data after every test.
 */
afterEach(async (done) => {
    await dbHandler.clearDatabase();
    done();
});

/**
 * Remove and close the db and server.
 */
afterAll(async (done) => {
    await dbHandler.closeDatabase();
    done();
});

/**
 * Shorten url test suite.
 */
describe('test /POST: /api/v1/shorten-url', () => {
    /**
     * Tests that a valid url can be created through the urlService without throwing any errors.
     */
    it('should be created correctly', async () => {
        expect(async () => await urlService.shortenUrl(urlComplete.url, urlComplete.baseUrl)).not.toThrow();
    });
    it('should throw an error indicating invalid url', async () => {
        expect(async () => await urlService.shortenUrl(urlError.url, urlError.baseUrl)).rejects.toThrow(
            'Invalid URL. Please enter a valid url for shortening.',
        );
    });
});

describe('test /GET: /api/v1/shorten-url/:slug', () => {
    /**
     * Tests that shortened url can redirect to the exact original url.
     */
    it('should redirect appropriately', async () => {
        expect(async () => {
            /**
             * First, seed the DB
             */
            const shortenedUrl = await urlService.shortenUrl(urlComplete.url, urlComplete.baseUrl);
            console.log('tetet', shortenedUrl);

            const test = await urlService.getUrl(shortenedUrl.urlSlug);
            console.log(test);
        }).not.toThrow();
    });
});
