"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const index_1 = __importDefault(require("../index"));
const debug_1 = __importDefault(require("debug"));
require("dotenv/config");
const debug = debug_1.default('express:server');
const port = normalizePort(process.env.PORT || '3000');
index_1.default.set('port', port);
const server = http_1.default.createServer(index_1.default);
server.on('error', onError);
server.on('listening', onListening);
server.listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`);
});
/**
 * Normalize a port into a number, string, or false.
 * @param {string} val - The value of the port.
 * @return {string | false} - The port number or false value
 */
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server "error" event.
 * @param {NodeJS.ErrnoException} error - The error object.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr === null || addr === void 0 ? void 0 : addr.port}`;
    debug('Listening on ' + bind);
}
