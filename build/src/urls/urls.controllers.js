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
exports.getShortenUrl = exports.shortenUrl = void 0;
const http_status_codes_1 = require("http-status-codes");
const process_1 = __importDefault(require("process"));
const urlService = __importStar(require("./urls.services"));
/**
 * Create a short url from the long input url.
 * @param {Request} req - The upcoming request param.
 * @param {Response} res - The returning response param.
 * @return {Response} - The response of the request.
 */
function shortenUrl(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const originalUrl = req.body.url;
            const baseUrl = getBaseUrl(req);
            const result = yield urlService.shortenUrl(originalUrl, baseUrl);
            return res.status(http_status_codes_1.StatusCodes.OK).json({
                message: result,
            });
        }
        catch (error) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                message: error.message,
            });
        }
    });
}
exports.shortenUrl = shortenUrl;
/**
 * Access the original url using the shortened url.
 * @param {Request} req - The upcoming request param.
 * @param {Response} res - The returning response param.
 * @return {Response} - The response of the request.
 */
function getShortenUrl(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const uniqueCode = req.params.uniqueCode;
            const url = yield urlService.getUrl(uniqueCode);
            const maximumAccess = process_1.default.env.MAXIMUM_ACCESS
                ? process_1.default.env.MAXIMUM_ACCESS
                : 10;
            if (url) {
                let { clickCount } = url;
                if (clickCount > maximumAccess) {
                    return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                        message: 'Maximum',
                    });
                }
                clickCount++;
                yield urlService.updateCount(url, clickCount);
                return res.redirect(url.originalUrl);
            }
            else {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    message: 'Not existed',
                });
            }
        }
        catch (error) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                message: error.message,
            });
        }
    });
}
exports.getShortenUrl = getShortenUrl;
/**
 * Get the base url, will return the config localhost url if running at localhost,
 * otherwise return the base url of the server.
 * @param {Request} req - The request used to retrieve the base url.
 * @return {string} - The base url.
 */
function getBaseUrl(req) {
    const hostname = req.hostname === 'localhost'
        ? process_1.default.env.LOCAL_HOSTNAME
        : req.hostname;
    return `${hostname}${req.originalUrl}`;
}
