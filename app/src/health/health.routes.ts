import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * Health check endpoint
 * @route GET /api/v1/health
 */
router.get('/health', async (_req: Request, res: Response) => {
    const health = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        database: 'disconnected',
    };

    try {
        if (mongoose.connection.readyState === 1) {
            health.database = 'connected';
        }

        res.status(200).json(health);
    } catch (error) {
        health.message = 'ERROR';
        res.status(503).json(health);
    }
});

/**
 * Readiness check endpoint
 * @route GET /api/v1/ready
 */
router.get('/ready', async (_req: Request, res: Response) => {
    if (mongoose.connection.readyState === 1) {
        res.status(200).json({ status: 'ready' });
    } else {
        res.status(503).json({ status: 'not ready' });
    }
});

export default router;
