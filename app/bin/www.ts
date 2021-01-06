import http from 'http';
import app from '../index';
import debugModule from 'debug';
import 'dotenv/config';

const debug = debugModule('express:server');
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);

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
function normalizePort(val: string) {
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
function onError(error: NodeJS.ErrnoException) {
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
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    debug('Listening on ' + bind);
}
