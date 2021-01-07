"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCount = exports.getUrl = exports.shortenUrl = void 0;
const url_1 = require("../../database/schema/url");
/**
 * Create new the shorten url record if not existed, otherwise return the existed one.
 * @param {string} originalUrl - The original input url retrived from user input.
 * @param {string} baseUrl - The base url used for creating the shortened url.
 * @param {string} uniqueCode - The unique code used to create the shortened url.
 * @return {string} - The object contain the shortened urls.
 */
function shortenUrl(originalUrl, baseUrl, uniqueCode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let url = yield url_1.URLModel.findOne({ originalUrl: originalUrl });
            if (url) {
                return url;
            }
            else {
                const shortUrl = `${baseUrl}/${uniqueCode}`;
                url = new url_1.URLModel({
                    urlSlug: uniqueCode,
                    originalUrl,
                    shortUrl,
                    clickCount: 0,
                });
                yield url.save();
                return url;
            }
        }
        catch (err) {
            throw new Error(err);
        }
    });
}
exports.shortenUrl = shortenUrl;
/**
 * Get the appropriate url from the database if existed in the database using the uniqueCode.
 * @param {string} uniqueCode - The uniqueCode used for identifying the shortened url.
 * @return {any} - a document containing information of the records that satisfy the criteria, or an error if failed.
 */
function getUrl(uniqueCode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield url_1.URLModel.findOne({ urlSlug: uniqueCode });
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
exports.getUrl = getUrl;
/**
 * Update the user count limit in the database.
 * @param {any} url - The url object containing the limit count.
 * @param {number} clickCount - The number of limit count to update.
 * @return {any} - a document containing information of the updated record, or an error if failed.
 */
function updateCount(url, clickCount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield url.updateOne({ clickCount });
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
exports.updateCount = updateCount;
