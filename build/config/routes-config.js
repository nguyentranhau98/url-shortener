"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const urls_routes_1 = __importDefault(require("../src/urls/urls.routes"));
const router = express_1.Router();
router.use('/shorten-url', urls_routes_1.default);
exports.default = router;
