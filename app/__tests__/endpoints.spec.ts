import request from 'supertest';
import http from 'http';
import { createServer } from '../bin/www';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';

let server: http.Server;

beforeAll(async () => {
    server = await createServer();
    await mongoose.connection.close();
});

afterEach(async () => {
    server.close();
});

describe('GET /', () => {
    it('should return status code 200 and valid response', async (done) => {
        request(server)
            .get(`/`)
            .expect('Content-Type', /text\/html/)
            .expect(StatusCodes.OK)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.text).toMatch('Express + TypeScript Server');
                done();
            });
    });
});

