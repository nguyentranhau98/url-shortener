"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCount = exports.getUrl = exports.shortenUrl = void 0;
const valid_url_1 = __importDefault(require("valid-url"));
const shortid_1 = __importDefault(require("shortid"));
const urlRepositories = __importStar(require("./urls.repositories"));
/**
 * Handle the shorten url progress.
 * @param {string} originalUrl - The original input url retrived from user input.
 * @param {string} baseUrl - The base url used for creating the shortened url.
 * @return {string} - The object contain the shortened urls.
 */
function shortenUrl(originalUrl, baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!valid_url_1.default.isUri(baseUrl)) {
            throw new Error('Internal error. Please come back later.');
        }
        const uniqueCode = shortid_1.default.generate();
        if (valid_url_1.default.isUri(originalUrl)) {
            const newUrl = yield urlRepositories.shortenUrl(originalUrl, baseUrl, uniqueCode);
            return newUrl;
        }
        else {
            throw new Error('Invalid URL. Please enter a valid url for shortening.');
        }
    });
}
exports.shortenUrl = shortenUrl;
/**
 * Get the appropriate url if existed in the database using the uniqueCode.
 * @param {string} uniqueCode - The uniqueCode used for identifying the shortened url.
 * @return {string} - The object contain the shortened urls.
 */
function getUrl(uniqueCode) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield urlRepositories.getUrl(uniqueCode);
    });
}
exports.getUrl = getUrl;
/**
 * Update the user count limit.
 * @param {any} url - The url object containing the limit count.
 * @param {number} clickCount - The number of limit count to update.
 * @return {string} - The promise, indicating whether it succeeded or not.
 */
function updateCount(url, clickCount) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield urlRepositories.updateCount(url, clickCount);
    });
}
exports.updateCount = updateCount;
