# Phase 3: Backend Dependency Upgrades

## Overview
This phase focuses on upgrading the backend dependencies to their latest stable versions, including TypeScript, Express, Mongoose, Jest, and other critical packages. This will improve security, performance, and take advantage of new features.

**Duration Estimate**: 3-4 hours
**Risk Level**: Medium-High
**Prerequisites**: Phase 0, 1, and 2 completed

---

## Objectives

1. Upgrade TypeScript from 4.1.3 to 5.6.3
2. Upgrade Express and related middleware
3. Upgrade Mongoose from 5.x to 8.x (major breaking changes)
4. Upgrade Jest and testing dependencies
5. Upgrade ESLint to version 9 (flat config)
6. Update all type definitions
7. Fix breaking changes and type errors
8. Ensure all tests pass after upgrades

---

## Current vs Target Versions

| Package | Current | Target | Breaking Changes |
|---------|---------|--------|------------------|
| TypeScript | 4.1.3 | 5.6.3 | Yes (minor) |
| Express | 4.17.1 | 4.21.1 | No |
| Mongoose | 5.11.10 | 8.8.0 | Yes (major) |
| Jest | 26.0.1 | 29.7.0 | Yes (moderate) |
| ts-jest | 26.4.4 | 29.2.5 | Yes |
| ESLint | 7.17.0 | 9.14.0 | Yes (config format) |
| @types/node | 14.14.20 | 22.9.0 | Yes (minor) |

---

## Tasks

### 1. Backup Current State

**Priority**: Critical

```bash
# Create backup of package.json and package-lock.json
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup

# Ensure all tests pass before upgrade
npm test

# Document current test results
npm test > pre-upgrade-tests.log 2>&1
```

---

### 2. Upgrade TypeScript

**Priority**: Critical

```bash
# Upgrade TypeScript
npm install -D typescript@5.6.3

# Upgrade type definitions
npm install -D @types/node@22.9.0
npm install -D @types/express@5.0.0
npm install -D @types/cors@2.8.17
npm install -D @types/mongoose@8.6.5
npm install -D @types/debug@4.1.12
npm install -D @types/valid-url@1.0.7
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "lib": ["ES2022"],
    "moduleResolution": "Node16",
    "rootDir": "./app",
    "outDir": "./build",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["app/**/*"],
  "exclude": [
    "node_modules",
    "build",
    "app/__tests__",
    "app/**/*.spec.ts",
    "app/**/tests"
  ]
}
```

**Verification**:
```bash
npx tsc --noEmit
```

Fix any type errors that appear.

---

### 3. Upgrade Express and Middleware

**Priority**: High

```bash
# Upgrade Express
npm install express@4.21.1

# Upgrade middleware
npm install cors@2.8.5
npm install helmet@8.0.0
npm install body-parser@1.20.3
npm install dotenv@16.4.5

# Upgrade utilities
npm install debug@4.3.7
npm install http-status-codes@2.3.0
npm install valid-url@1.0.9
npm install shortid@2.2.16
```

**Breaking Changes in Helmet 8.x**:

Update `app/index.ts` helmet configuration:

```typescript
// Old (Helmet 4.x)
app.use(helmet());

// New (Helmet 8.x) - same usage, but different defaults
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
```

---

### 4. Upgrade Mongoose (Major Changes)

**Priority**: Critical (Breaking Changes)

```bash
# Upgrade Mongoose
npm install mongoose@8.8.0
```

#### Breaking Changes in Mongoose 8.x

**1. Connection Handling**

Update `app/database/connection.ts`:

```typescript
// Old (Mongoose 5.x)
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// New (Mongoose 8.x) - options removed
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING!);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
```

**2. Schema Definition**

Update `app/database/schema/url.ts`:

```typescript
import { Schema, model, Document } from 'mongoose';

// Define interface
export interface IUrl extends Document {
  urlSlug: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
}

// Define schema with proper typing
const urlSchema = new Schema<IUrl>({
  urlSlug: {
    type: String,
    required: true,
    unique: true,
  },
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Export model with proper typing
export const Url = model<IUrl>('Url', urlSchema);
```

**3. Query Methods**

Update `app/src/urls/urls.repositories.ts`:

```typescript
// Old (Mongoose 5.x)
const url = await Url.findOneAndUpdate(
  { urlSlug },
  { $inc: { clickCount: 1 } },
  { new: true }
);

// New (Mongoose 8.x) - same syntax but stricter typing
const url = await Url.findOneAndUpdate(
  { urlSlug },
  { $inc: { clickCount: 1 } },
  { new: true }
).exec(); // Recommended to call .exec()
```

**4. Error Handling**

```typescript
// Mongoose 8.x has better error types
import { MongooseError } from 'mongoose';

try {
  await Url.create(data);
} catch (error) {
  if (error instanceof MongooseError) {
    // Handle Mongoose-specific errors
  }
}
```

---

### 5. Upgrade Jest and Testing Dependencies

**Priority**: High

```bash
# Upgrade Jest
npm install -D jest@29.7.0
npm install -D ts-jest@29.2.5
npm install -D @types/jest@29.5.14

# Upgrade testing utilities
npm install -D supertest@7.0.0
npm install -D @types/supertest@6.0.2
npm install -D mongodb-memory-server@10.1.2
```

Update `jest.config.js`:

```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Updated for Jest 29
  roots: ['<rootDir>/app'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
  ],

  // Module name mapping
  moduleNameMapper: {
    '@exmpl/(.*)': '<rootDir>/$1',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'app/src/**/*.ts',
    '!app/src/**/*.spec.ts',
    '!app/src/**/tests/**',
  ],

  // Improved error handling
  errorOnDeprecated: true,

  // Transform configuration for ts-jest 29
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
      },
    }],
  },
};
```

**Fix MongoDB Memory Server**

Update `app/src/urls/tests/db-handler.ts`:

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const connect = async (): Promise<void> => {
  // MongoDB Memory Server 10.x
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
};

export const closeDatabase = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

---

### 6. Upgrade ESLint to Version 9

**Priority**: Medium

```bash
# Upgrade ESLint
npm install -D eslint@9.14.0
npm install -D @eslint/js
npm install -D typescript-eslint
npm install -D globals
```

**Migrate to Flat Config**

Rename `.eslintrc.js` to `eslint.config.js` and update:

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['build/', 'node_modules/', 'client/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'indent': ['error', 4],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'max-len': ['error', { 'code': 120 }],
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  }
);
```

---

### 7. Update Other Dependencies

**Priority**: Medium

```bash
# Upgrade development tools
npm install -D nodemon@3.1.7
npm install -D ts-node@10.9.2
```

Update `package.json` type to module if needed:

```json
{
  "type": "commonjs"
}
```

Keep as CommonJS for now since Express app uses CommonJS.

---

### 8. Fix Type Errors

**Priority**: Critical

After upgrades, run type checking:

```bash
npx tsc --noEmit
```

**Common issues and fixes**:

**Issue 1: Stricter null checks**

```typescript
// Old
const url = await Url.findOne({ urlSlug });
return url.originalUrl; // Error: url might be null

// New
const url = await Url.findOne({ urlSlug });
if (!url) {
  throw new Error('URL not found');
}
return url.originalUrl;
```

**Issue 2: Mongoose Document types**

```typescript
// Add proper types
import { Document } from 'mongoose';

interface IUrl extends Document {
  urlSlug: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
}
```

**Issue 3: Express types**

```typescript
// Use proper Express types
import { Request, Response, NextFunction } from 'express';

export const handler = (req: Request, res: Response, next: NextFunction) => {
  // ...
};
```

---

### 9. Update Test Files

**Priority**: High

Update `app/__tests__/endpoints.spec.ts`:

```typescript
import request from 'supertest';
import { Express } from 'express';
import mongoose from 'mongoose';

// Import your app
let app: Express;

beforeAll(async () => {
  // Setup
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('API Endpoints', () => {
  test('GET / should return 200', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
});
```

---

### 10. Run and Fix Tests

**Priority**: Critical

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- app/__tests__/endpoints.spec.ts
```

Fix any failing tests. Common issues:

1. **Async/await handling**: Jest 29 is stricter
2. **MongoDB connection**: Ensure proper setup/teardown
3. **Type issues**: Fix TypeScript errors in test files

---

## Breaking Changes Summary

### TypeScript 5.x
- ✅ Stricter type checking (fix type errors)
- ✅ Better inference (may reveal hidden bugs)
- ✅ New module resolution (updated tsconfig)

### Mongoose 8.x
- ✅ Removed connection options (useNewUrlParser, etc.)
- ✅ Query returns require .exec() for promises
- ✅ Better TypeScript support (use proper interfaces)
- ✅ Error handling updated

### Jest 29
- ✅ Updated configuration format
- ✅ Stricter async handling
- ✅ ts-jest configuration changes

### ESLint 9
- ✅ Flat config format (eslint.config.js)
- ✅ Updated plugin imports
- ✅ Different rule configuration

### Helmet 8.x
- ✅ Different default CSP settings
- ✅ Updated configuration API

---

## Verification Steps

### 1. Type Checking

```bash
npx tsc --noEmit
```

**Expected**: No type errors

### 2. Linting

```bash
npm run lint
```

**Expected**: No linting errors

### 3. Tests

```bash
npm test
```

**Expected**: All tests pass

### 4. Build

```bash
npm run build
```

**Expected**: Build succeeds, no errors

### 5. Run Application

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Test API
curl http://localhost:3000/
```

**Expected**: API responds correctly

### 6. Test MongoDB Connection

```bash
# Ensure MongoDB is running
# Start the app
npm run dev

# Check logs for "MongoDB connected"
```

---

## Verification Checklist

- [ ] TypeScript upgraded to 5.6.3
- [ ] All type definitions updated
- [ ] Express and middleware upgraded
- [ ] Mongoose upgraded to 8.8.0
- [ ] Mongoose connection code updated
- [ ] Schema definitions updated with proper types
- [ ] Jest upgraded to 29.7.0
- [ ] ESLint upgraded to 9.14.0
- [ ] All type errors fixed
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Application runs without errors
- [ ] MongoDB connection works
- [ ] No security vulnerabilities (`npm audit`)

---

## Rollback Plan

If critical issues arise:

```bash
# Restore backup
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json

# Reinstall old dependencies
rm -rf node_modules
npm install

# Verify
npm test
```

---

## Common Issues and Solutions

### Issue: Mongoose connection fails

**Solution**:
```typescript
// Ensure CONNECTION_STRING is set in .env
// Remove old connection options
await mongoose.connect(process.env.CONNECTION_STRING!);
```

### Issue: Type errors with Mongoose models

**Solution**:
```typescript
// Define proper interfaces
interface IUrl extends Document {
  // fields
}

const urlSchema = new Schema<IUrl>({ /* ... */ });
export const Url = model<IUrl>('Url', urlSchema);
```

### Issue: Jest tests fail with module errors

**Solution**:
```javascript
// Update jest.config.js transform
transform: {
  '^.+\\.ts$': ['ts-jest', {
    tsconfig: {
      esModuleInterop: true,
    },
  }],
},
```

### Issue: ESLint not working

**Solution**:
```bash
# Ensure flat config is used
# File should be named eslint.config.js, not .eslintrc.js
# Update eslint command in package.json:
"lint": "eslint ."
```

---

## Success Criteria

Phase 3 is complete when:

1. ✅ All dependencies upgraded to target versions
2. ✅ No TypeScript errors
3. ✅ All tests pass
4. ✅ Application builds successfully
5. ✅ Backend runs without errors
6. ✅ MongoDB connection works
7. ✅ No critical security vulnerabilities
8. ✅ Ready for Phase 4 integration

---

## Estimated Time Breakdown

| Task | Time Estimate |
|------|---------------|
| TypeScript upgrade | 30 minutes |
| Express upgrade | 20 minutes |
| Mongoose upgrade | 90 minutes |
| Jest upgrade | 45 minutes |
| ESLint upgrade | 30 minutes |
| Fix type errors | 60 minutes |
| Fix and run tests | 45 minutes |
| Verification | 30 minutes |
| **Total** | **~5.5 hours** |

Note: May take longer depending on number of type errors and test failures.

---

## Commit Message

```
chore: upgrade backend dependencies to latest stable versions

BREAKING CHANGES:
- Upgrade TypeScript 4.1.3 → 5.6.3
- Upgrade Mongoose 5.11.10 → 8.8.0
- Upgrade Jest 26.0.1 → 29.7.0
- Upgrade ESLint 7.17.0 → 9.14.0
- Upgrade Express and middleware packages

Changes:
- Update tsconfig.json for TS 5.6 features
- Migrate Mongoose connection to v8 API
- Remove deprecated connection options
- Update Mongoose schemas with proper typing
- Migrate Jest config to v29 format
- Migrate ESLint to flat config format
- Fix all type errors from stricter checking
- Update all type definitions to latest
- Ensure all tests pass with new versions

Phase: 3/6 - Backend Dependency Upgrades
```

---

## Next Phase

Once Phase 3 is complete, proceed to [PHASE_4_INTEGRATION.md](./PHASE_4_INTEGRATION.md)

---

**Phase Owner**: Backend Team
**Last Updated**: 2025-11-06
