# Current State Documentation

**Date**: 2025-11-06
**Version**: 1.0.0 (Pre-upgrade)

## Project Type

**Backend API** - Node.js/Express with TypeScript and MongoDB

## Backend Dependencies

### Production Dependencies
- express: ^4.17.1 - Web framework
- mongoose: ^5.11.10 - MongoDB ODM
- body-parser: ^1.19.0 - Request parsing
- cors: ^2.8.5 - CORS middleware
- helmet: ^4.3.1 - Security headers
- dotenv: ^8.2.0 - Environment variables
- shortid: ^2.2.16 - Unique ID generation
- valid-url: ^1.0.9 - URL validation
- http-status-codes: ^2.1.4 - HTTP status utilities
- debug: ^4.3.1 - Debug logging

### Development Dependencies
- typescript: ^4.1.3
- jest: ^26.0.1
- ts-jest: ^26.4.4
- @types/node: ^14.14.20
- @types/express: ^4.17.9
- @types/jest: ^26.0.19
- eslint: ^7.17.0
- @typescript-eslint/eslint-plugin: ^4.12.0
- @typescript-eslint/parser: ^4.12.0
- nodemon: ^2.0.6
- ts-node: ^9.1.1
- husky: ^4.3.6
- supertest: ^6.0.1
- mongodb-memory-server: ^6.9.2

## Architecture

### Backend Structure
- **Pattern**: Layer-based architecture (Routes → Controllers → Services → Repositories)
- **Database**: MongoDB with Mongoose ODM
- **Framework**: Express.js REST API
- **Language**: TypeScript with strict mode
- **Module System**: CommonJS
- **Target**: ES6

### Directory Structure
```
url-shortener/
├── app/
│   ├── bin/
│   │   └── www.ts           # Entry point
│   ├── index.ts             # Express app setup
│   ├── config/
│   │   └── routes-config.ts # Route configuration
│   ├── database/
│   │   ├── connection.ts    # MongoDB connection
│   │   └── schema/
│   │       └── url.ts       # URL model
│   └── src/
│       └── urls/            # URL shortening feature
│           ├── urls.routes.ts
│           ├── urls.controllers.ts
│           ├── urls.services.ts
│           ├── urls.repositories.ts
│           ├── urls.middlewares.ts
│           └── tests/
├── build/                   # Compiled output
├── package.json
├── tsconfig.json
└── jest.config.js
```

## API Endpoints

### 1. Health Check
- **GET /** - Returns "API is up and running"

### 2. Create Short URL
- **POST /api/v1/shorten-url**
- Body: `{ "originalUrl": "https://example.com" }`
- Response: Short URL object

### 3. Redirect to Original URL
- **GET /api/v1/shorten-url/:uniqueCode**
- Redirects to original URL
- Increments click count

## Database Schema

### URL Model
```typescript
{
  urlSlug: String,      // Unique short code
  originalUrl: String,  // Original long URL
  shortUrl: String,     // Full short URL
  clickCount: Number    // Access counter
}
```

## Build Process

- TypeScript compilation: `tsc --project ./`
- Output directory: `/build`
- Development: nodemon with ts-node for hot reload
- Production: Compiled JavaScript executed with Node.js

## Testing

- **Framework**: Jest with ts-jest preset
- **Utilities**: Supertest for HTTP testing, mongodb-memory-server for test DB
- **Coverage**: Estimated ~50%
- **Test Files**:
  - `app/__tests__/endpoints.spec.ts`
  - `app/src/urls/tests/urls.spec.ts`

## Current Issues

### Test Failures
- Tests fail without CONNECTION_STRING environment variable
- Need .env file for local testing

### Security Vulnerabilities
- 70 vulnerabilities detected (5 low, 37 moderate, 21 high, 7 critical)
- Related to outdated dependencies (3-4 years old)

### Deprecated Packages
- ESLint 7.17.0 no longer supported
- Various transitive dependencies deprecated

## Environment Variables Required

- `CONNECTION_STRING` - MongoDB connection URI (required)
- `PORT` - Server port (default: 3000)
- `LOCAL_HOSTNAME` - Localhost domain for URL generation
- `MAXIMUM_ACCESS` - Max clicks before URL expires (default: 10)
- `NODE_ENV` - Environment (development/production)
- `DEBUG` - Debug namespace (optional)

## Deployment

- **Platform**: Heroku (configured with Procfile)
- **Start Command**: `npm start` → `node build/bin/www.js`
- **Build Command**: `npm run build` → `tsc --project ./`

## Known Limitations

1. No frontend - backend API only
2. No authentication/authorization
3. No rate limiting
4. No URL analytics
5. No custom short codes
6. No URL expiration (only click limit)
7. Basic error handling
8. No logging framework
9. No monitoring/observability

## Upgrade Goals

1. Add modern Vite + React frontend
2. Upgrade all dependencies to latest stable versions
3. Improve TypeScript strictness and types
4. Add comprehensive testing
5. Implement security best practices
6. Add proper logging and monitoring
7. Improve error handling
8. Set up CI/CD pipeline

---

**Document Version**: 1.0
**Last Updated**: 2025-11-06
**Status**: Pre-upgrade baseline
