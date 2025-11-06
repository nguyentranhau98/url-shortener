import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import routesConfig from './config/routes-config';
import healthRoutes from './src/health/health.routes';
import { connectDB } from './database/connection';

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Rate limiting for API routes
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
connectDB();

// Apply rate limiting to API routes
app.use('/api', limiter);

// Health check and API routes
app.use('/api/v1', healthRoutes);
app.use('/api/v1', routesConfig);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req: Request, res: Response) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../client/dist/index.html'));
        } else {
            res.status(404).json({ message: 'API endpoint not found' });
        }
    });
} else {
    app.get('/', (_req: Request, res: Response) =>
        res.send('Express + TypeScript Server'),
    );
    app.use('*', (_req: Request, res: Response) => {
        return res.status(404).json({
            message: 'Not found',
        });
    });
}

export default app;
