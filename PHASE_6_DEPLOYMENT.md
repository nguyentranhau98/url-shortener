# Phase 6: Production Deployment Configuration

## Overview
This phase focuses on preparing the application for production deployment, including build optimization, environment configuration, security hardening, monitoring setup, and deployment automation.

**Duration Estimate**: 2-3 hours
**Risk Level**: Medium
**Prerequisites**: Phases 0-5 completed

---

## Objectives

1. Optimize production builds
2. Configure environment variables for production
3. Implement security best practices
4. Set up deployment scripts
5. Configure deployment platforms (Heroku, Vercel, etc.)
6. Add monitoring and logging
7. Set up domain and SSL
8. Create deployment documentation
9. Implement health checks
10. Configure CORS for production

---

## Tasks

### 1. Optimize Frontend Build

**Priority**: Critical

Update `client/vite.config.ts` for production optimization:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },

  server: {
    port: 5173,
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    } : undefined,
  },

  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'axios'],
  },
}));
```

Install terser for better minification:

```bash
cd client
npm install -D terser@5.36.0
```

---

### 2. Environment Variables for Production

**Priority**: Critical

#### Frontend Environment

Update `client/.env.production`:

```bash
# Production API URL (update with your actual domain)
VITE_API_URL=https://your-api-domain.com
VITE_API_BASE_PATH=/api/v1

# Production flags
VITE_DEV_MODE=false
VITE_ENABLE_LOGS=false

# Analytics (optional)
VITE_GA_ID=G-XXXXXXXXXX
```

Create `client/.env.staging`:

```bash
# Staging API URL
VITE_API_URL=https://staging-api.your-domain.com
VITE_API_BASE_PATH=/api/v1

# Staging flags
VITE_DEV_MODE=false
VITE_ENABLE_LOGS=true
```

#### Backend Environment

Update `.env.production`:

```bash
# MongoDB Connection (use your production MongoDB URL)
CONNECTION_STRING=mongodb+srv://user:password@cluster.mongodb.net/url-shortener?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=production

# URL Shortener Configuration (use your production domain)
LOCAL_HOSTNAME=https://your-domain.com
MAXIMUM_ACCESS=100

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Optional: API Key for admin endpoints
API_KEY=your-secret-api-key
```

---

### 3. Security Hardening

**Priority**: Critical

#### Update CORS Configuration

Update `app/index.ts`:

```typescript
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

#### Update Helmet Configuration

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...allowedOrigins],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

#### Add Rate Limiting

Install rate limiter:

```bash
npm install express-rate-limit@7.4.1
```

Update `app/index.ts`:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api', limiter);
```

#### Add Request Validation

Install validator:

```bash
npm install express-validator@7.2.0
```

Update `app/src/urls/urls.middlewares.ts`:

```typescript
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateShortenUrl = [
  body('originalUrl')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Invalid URL format')
    .isLength({ max: 2048 })
    .withMessage('URL too long'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

---

### 4. Add Health Check Endpoint

**Priority**: High

Create `app/src/health/health.routes.ts`:

```typescript
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: 'disconnected',
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      health.database = 'connected';
    }

    res.status(200).json(health);
  } catch (error) {
    health.message = 'ERROR';
    res.status(503).json(health);
  }
});

router.get('/ready', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});

export default router;
```

Update `app/config/routes-config.ts`:

```typescript
import healthRoutes from '../src/health/health.routes';

// Add health routes
app.use('/api/v1', healthRoutes);
```

---

### 5. Logging Configuration

**Priority**: Medium

Install logging library:

```bash
npm install winston@3.17.0
```

Create `app/src/utils/logger.ts`:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

Create logs directory:

```bash
mkdir -p logs
echo "logs/" >> .gitignore
```

Use logger in application:

```typescript
import logger from './src/utils/logger';

// Replace console.log with logger
logger.info('Server started');
logger.error('Error occurred', { error });
```

---

### 6. Build Scripts

**Priority**: Critical

Update root `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently -n \"BACKEND,FRONTEND\" -c \"bgBlue.bold,bgMagenta.bold\" \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run dev",
    "dev:frontend": "cd client && npm run dev",

    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "npm run build",
    "build:frontend": "cd client && npm run build",

    "start": "NODE_ENV=production node build/bin/www.js",
    "start:dev": "npm run dev",

    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "npm test",
    "test:frontend": "cd client && npm run test:run",

    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "npm run lint",
    "lint:frontend": "cd client && npm run lint",

    "deploy:heroku": "git push heroku main",
    "deploy:staging": "git push staging staging-branch"
  }
}
```

---

### 7. Deployment Platform Configuration

**Priority**: High

#### Heroku Deployment

Create `Procfile`:

```
web: npm start
```

Create `app.json`:

```json
{
  "name": "URL Shortener",
  "description": "A modern URL shortening service",
  "repository": "https://github.com/your-username/url-shortener",
  "keywords": ["node", "express", "react", "vite", "mongodb"],
  "env": {
    "CONNECTION_STRING": {
      "description": "MongoDB connection string",
      "required": true
    },
    "NODE_ENV": {
      "description": "Node environment",
      "value": "production"
    },
    "LOCAL_HOSTNAME": {
      "description": "Application hostname",
      "required": true
    },
    "ALLOWED_ORIGINS": {
      "description": "Comma-separated list of allowed CORS origins",
      "required": true
    }
  },
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ]
}
```

Add build script for Heroku in root `package.json`:

```json
{
  "scripts": {
    "heroku-postbuild": "npm run build:frontend && npm run build:backend"
  }
}
```

Serve frontend from backend in production. Update `app/index.ts`:

```typescript
import express from 'express';
import path from 'path';

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // All other routes should serve the React app
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    }
  });
}
```

#### Vercel Deployment (Frontend Only)

Create `client/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.herokuapp.com/api/:path*"
    }
  ]
}
```

#### Railway Deployment

Create `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### 8. Docker Configuration (Optional)

**Priority**: Low

Create `Dockerfile`:

```dockerfile
# Multi-stage build

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY app/ ./app/
COPY tsconfig.json ./
RUN npm run build

# Stage 3: Production
FROM node:20-alpine
WORKDIR /app

# Copy backend build
COPY --from=backend-build /app/build ./build
COPY --from=backend-build /app/node_modules ./node_modules
COPY package*.json ./

# Copy frontend build
COPY --from=frontend-build /app/client/dist ./client/dist

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "build/bin/www.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - CONNECTION_STRING=mongodb://mongo:27017/url-shortener
      - NODE_ENV=production
      - LOCAL_HOSTNAME=http://localhost:3000
    depends_on:
      - mongo

  mongo:
    image: mongo:8
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Create `.dockerignore`:

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.vscode
coverage
dist
build
logs
*.log
```

---

### 9. Monitoring and Analytics

**Priority**: Low

#### Add Performance Monitoring

Install monitoring package:

```bash
npm install newrelic@12.8.0
# or
npm install @sentry/node@8.43.0
```

Create `newrelic.js` (if using New Relic):

```javascript
'use strict';

exports.config = {
  app_name: ['URL Shortener'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
    ],
  },
};
```

#### Add Analytics to Frontend

```bash
cd client
npm install @vercel/analytics@1.4.1
# or
npm install react-ga4@2.1.0
```

Update `client/src/main.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
```

---

### 10. Deployment Documentation

**Priority**: Medium

Create `DEPLOYMENT.md`:

```markdown
# Deployment Guide

## Prerequisites

- Node.js 20+
- MongoDB instance (Atlas, local, or other)
- Deployment platform account (Heroku, Vercel, Railway, etc.)

## Environment Variables

### Backend
- `CONNECTION_STRING`: MongoDB connection URL
- `NODE_ENV`: production
- `LOCAL_HOSTNAME`: Your production domain
- `ALLOWED_ORIGINS`: Frontend URL(s)
- `PORT`: Server port (default: 3000)

### Frontend
- `VITE_API_URL`: Backend API URL
- `VITE_API_BASE_PATH`: /api/v1

## Deployment Steps

### 1. Heroku (Full Stack)

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB (MongoDBAtlas add-on)
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set LOCAL_HOSTNAME=https://your-app-name.herokuapp.com
heroku config:set ALLOWED_ORIGINS=https://your-app-name.herokuapp.com

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### 2. Vercel (Frontend) + Heroku (Backend)

Frontend (Vercel):
```bash
cd client
vercel --prod
```

Backend (Heroku):
```bash
heroku create your-backend-app
git push heroku main
```

### 3. Docker

```bash
# Build image
docker build -t url-shortener .

# Run container
docker run -p 3000:3000 \
  -e CONNECTION_STRING=mongodb://... \
  -e NODE_ENV=production \
  url-shortener
```

### 4. Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

## Post-Deployment

1. Verify health endpoint: https://your-domain.com/api/v1/health
2. Test URL shortening functionality
3. Check logs for errors
4. Monitor performance metrics
5. Set up alerts for downtime

## Troubleshooting

### Database Connection Issues
- Verify CONNECTION_STRING is correct
- Check MongoDB Atlas IP whitelist
- Ensure database user has proper permissions

### CORS Errors
- Verify ALLOWED_ORIGINS includes frontend URL
- Check that frontend VITE_API_URL is correct

### Build Failures
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Review build logs for specific errors
```

---

## Verification Steps

### 1. Test Production Build Locally

```bash
# Build both frontend and backend
npm run build

# Set production environment
export NODE_ENV=production
export CONNECTION_STRING=your-mongodb-url

# Start server
npm start

# Open http://localhost:3000
```

### 2. Test Health Endpoints

```bash
curl https://your-domain.com/api/v1/health
curl https://your-domain.com/api/v1/ready
```

### 3. Test CORS

```bash
curl -H "Origin: https://your-frontend-domain.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://your-backend-domain.com/api/v1/shorten-url
```

---

## Verification Checklist

- [ ] Production builds optimized
- [ ] Environment variables configured
- [ ] Security headers configured (Helmet)
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation added
- [ ] Health check endpoints working
- [ ] Logging configured
- [ ] Deployment scripts created
- [ ] Application deployed successfully
- [ ] SSL/HTTPS configured
- [ ] Monitoring set up (optional)
- [ ] Documentation complete

---

## Security Checklist

- [ ] HTTPS enforced
- [ ] CORS restricted to known origins
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Sensitive data not in environment variables committed to repo
- [ ] Security headers configured (HSTS, CSP, etc.)
- [ ] MongoDB connection uses authentication
- [ ] API keys/secrets properly secured
- [ ] Error messages don't leak sensitive info

---

## Success Criteria

Phase 6 is complete when:

1. ✅ Production builds are optimized
2. ✅ Security best practices implemented
3. ✅ Application successfully deployed
4. ✅ All environment variables configured
5. ✅ Health checks working
6. ✅ CORS properly configured
7. ✅ Monitoring set up (if applicable)
8. ✅ Documentation complete
9. ✅ Application is live and functional

---

## Estimated Time Breakdown

| Task | Time Estimate |
|------|---------------|
| Build optimization | 30 minutes |
| Security configuration | 45 minutes |
| Deployment setup | 60 minutes |
| Health checks & logging | 30 minutes |
| Testing deployment | 30 minutes |
| Documentation | 20 minutes |
| **Total** | **~3.5 hours** |

---

## Commit Message

```
chore: configure production deployment

- Optimize Vite build configuration
- Add production environment variables
- Implement security best practices (CORS, Helmet, rate limiting)
- Add request validation with express-validator
- Create health check endpoints
- Set up Winston logging
- Configure deployment for multiple platforms (Heroku, Vercel, Docker)
- Add production build scripts
- Serve frontend from backend in production
- Create deployment documentation
- Set up monitoring (optional)

Phase: 6/6 - Production Deployment Configuration
```

---

## Post-Deployment Tasks

After successful deployment:

1. **Monitor Application**
   - Check error logs daily
   - Monitor performance metrics
   - Track usage patterns

2. **Set Up Alerts**
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic, Datadog)

3. **Documentation**
   - Update README with live URLs
   - Document any deployment-specific quirks
   - Create runbooks for common issues

4. **Optimization**
   - Review and optimize database queries
   - Implement caching if needed
   - Consider CDN for static assets

---

## Next Steps

With all phases complete, consider:

1. **Feature Enhancements**
   - Custom short codes
   - URL analytics dashboard
   - User authentication
   - QR code generation

2. **Performance Improvements**
   - Implement Redis caching
   - Add database indexing
   - Optimize bundle sizes

3. **DevOps**
   - Set up CI/CD pipelines
   - Implement automated testing
   - Add staging environment

---

**Phase Owner**: DevOps Team
**Last Updated**: 2025-11-06
