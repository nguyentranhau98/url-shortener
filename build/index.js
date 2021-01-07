"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_config_1 = __importDefault(require("./config/routes-config"));
const connection_1 = require("./database/connection");
const app = express_1.default();
app.use(cors_1.default());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(helmet_1.default());
connection_1.connectDB();
app.get('/', (req, res) => res.send('Express + TypeScript Server'));
app.use('/api/v1', routes_config_1.default);
app.use('*', (req, res) => {
    return res.status(404).json({
        message: 'Not found',
    });
});
exports.default = app;
