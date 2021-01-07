"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
;
const urlSchema = new mongoose_1.default.Schema({
    urlSlug: String,
    originalUrl: String,
    shortUrl: String,
    clickCount: Number,
});
exports.URLModel = mongoose_1.default.model('url', urlSchema);
