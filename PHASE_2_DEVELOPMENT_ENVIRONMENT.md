# Phase 2: Development Environment Configuration

## Overview
This phase focuses on setting up a streamlined development environment that supports both frontend and backend development, including tooling, linting, formatting, and concurrent development workflows.

**Duration Estimate**: 2-3 hours
**Risk Level**: Low
**Prerequisites**: Phase 1 completed

---

## Objectives

1. Configure ESLint for frontend (React + TypeScript)
2. Set up Prettier for consistent code formatting
3. Configure concurrent development (run both frontend + backend)
4. Set up Git hooks for code quality
5. Configure VS Code settings (recommended)
6. Add development utilities and tooling
7. Configure debugging setup
8. Update root package.json for workspace management

---

## Tasks

### 1. Install ESLint for Frontend

**Priority**: High

```bash
cd client

# Install ESLint and plugins
npm install -D eslint@9.14.0
npm install -D @eslint/js
npm install -D typescript-eslint
npm install -D eslint-plugin-react@7.37.2
npm install -D eslint-plugin-react-hooks@5.0.0
npm install -D eslint-plugin-react-refresh@0.4.14
npm install -D eslint-plugin-jsx-a11y@6.10.2
npm install -D globals
```

Create `client/eslint.config.js` (ESLint 9 flat config):

```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'build'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
    },
  }
);
```

---

### 2. Install and Configure Prettier

**Priority**: High

```bash
cd client

# Install Prettier
npm install -D prettier@3.3.3
npm install -D eslint-config-prettier@9.1.0
npm install -D eslint-plugin-prettier@5.2.1
```

Create `client/.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "jsxBracketSameLine": false
}
```

Create `client/.prettierignore`:

```
dist
build
node_modules
coverage
*.min.js
*.min.css
package-lock.json
```

Update `client/package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,json}\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

### 3. Configure Concurrent Development

**Priority**: Critical

Install `concurrently` at the root level:

```bash
# From project root
npm install -D concurrently@9.1.0
```

Update root `package.json` to add development scripts:

```json
{
  "name": "url-shortener-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd app && npm run dev",
    "dev:frontend": "cd client && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "npm run build --prefix .",
    "build:frontend": "cd client && npm run build",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "npm test",
    "test:frontend": "cd client && npm run test",
    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "npm run lint",
    "lint:frontend": "cd client && npm run lint",
    "format": "cd client && npm run format"
  },
  "devDependencies": {
    "concurrently": "^9.1.0"
  }
}
```

Create better concurrent dev script with colors:

Update the `dev` script in root `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently -n \"BACKEND,FRONTEND\" -c \"bgBlue.bold,bgMagenta.bold\" \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

---

### 4. Set Up Git Hooks with Husky

**Priority**: Medium

```bash
# From project root
npm install -D husky@9.1.6
npx husky init

# Create pre-commit hook
echo "npm run lint:frontend" > .husky/pre-commit
echo "npm run type-check --prefix client" >> .husky/pre-commit
chmod +x .husky/pre-commit
```

Install `lint-staged` for optimized pre-commit:

```bash
npm install -D lint-staged@15.2.10
```

Create `.lintstagedrc.json` at root:

```json
{
  "client/src/**/*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "client/src/**/*.{css,json}": [
    "prettier --write"
  ],
  "app/**/*.ts": [
    "eslint --fix"
  ]
}
```

Update `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check --prefix client
```

---

### 5. VS Code Configuration

**Priority**: Low (but recommended)

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.css": "css"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true
  },
  "eslint.workingDirectories": [
    "./client",
    "./app"
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "editorconfig.editorconfig"
  ]
}
```

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome (Frontend)",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/client/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/app/bin/www.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/build/**/*.js"],
      "cwd": "${workspaceFolder}",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ],
  "compounds": [
    {
      "name": "Full Stack",
      "configurations": ["Launch Chrome (Frontend)", "Launch Backend"]
    }
  ]
}
```

---

### 6. EditorConfig for Consistency

**Priority**: Low

Create `.editorconfig` at root:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.{json,yml,yaml}]
indent_size = 2

[*.ts]
indent_size = 2

[*.tsx]
indent_size = 2

[Makefile]
indent_style = tab
```

---

### 7. Development Environment Variables

**Priority**: Medium

Update `client/.env.development`:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_BASE_PATH=/api/v1

# Development flags
VITE_DEV_MODE=true
VITE_ENABLE_LOGS=true
```

Create `client/.env.production`:

```bash
# API Configuration (will be set during deployment)
VITE_API_URL=https://your-production-domain.com
VITE_API_BASE_PATH=/api/v1

# Production flags
VITE_DEV_MODE=false
VITE_ENABLE_LOGS=false
```

---

### 8. Add Development Utilities

**Priority**: Low

Install useful development dependencies:

```bash
cd client

# Dev tools
npm install -D @vitejs/plugin-react-swc@3.7.1  # Faster refresh
npm install -D vite-plugin-checker@0.8.0       # Type checking in Vite
npm install -D vite-tsconfig-paths@5.1.3       # Better path resolution
```

Update `client/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';  // Changed to SWC for faster builds
import path from 'path';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),  // Automatically use tsconfig paths
    checker({
      typescript: true,  // Enable type checking in dev mode
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
  ],

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
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
```

---

### 9. Add Scripts Documentation

**Priority**: Low

Create `SCRIPTS.md` at root:

```markdown
# Development Scripts Guide

## Root Level Scripts

### Development
- `npm run dev` - Run both frontend and backend concurrently
- `npm run dev:backend` - Run only backend (port 3000)
- `npm run dev:frontend` - Run only frontend (port 5173)

### Build
- `npm run build` - Build both frontend and backend for production
- `npm run build:backend` - Build backend only
- `npm run build:frontend` - Build frontend only

### Testing
- `npm run test` - Run all tests (backend + frontend)
- `npm run test:backend` - Run backend tests only
- `npm run test:frontend` - Run frontend tests only

### Code Quality
- `npm run lint` - Lint all code
- `npm run lint:backend` - Lint backend code
- `npm run lint:frontend` - Lint frontend code
- `npm run format` - Format frontend code with Prettier

## Frontend Scripts (client/)

### Development
- `npm run dev` - Start Vite dev server with HMR
- `npm run preview` - Preview production build locally

### Build
- `npm run build` - Type check and build for production
- `npm run type-check` - Run TypeScript type checking

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and auto-fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted

## Backend Scripts (root)

### Development
- `npm run dev` - Start backend with nodemon (hot reload)
- `npm start` - Start production server

### Build
- `npm run build` - Compile TypeScript to JavaScript

### Testing
- `npm test` - Run Jest tests

### Code Quality
- `npm run lint` - Run ESLint on backend code

## Environment Setup

### Backend
Create `.env` file in root with:
```
CONNECTION_STRING=mongodb://localhost:27017/url-shortener
PORT=3000
LOCAL_HOSTNAME=http://localhost:3000
MAXIMUM_ACCESS=10
```

### Frontend
Environment files already created in `client/`:
- `.env.development` - Development settings
- `.env.production` - Production settings

## Common Workflows

### Start full development environment
```bash
npm run dev
```
This starts both backend (port 3000) and frontend (port 5173)

### Build for production
```bash
npm run build
```

### Run tests before commit
```bash
npm test
```

### Fix all linting issues
```bash
npm run lint:frontend -- --fix
```

### Format all code
```bash
npm run format
```
```

---

### 10. Update Backend to Support CORS Properly

**Priority**: High

Since we're now running frontend on a different port, ensure CORS is properly configured.

The backend already has CORS configured in `app/index.ts`, but let's verify it allows the frontend origin.

Check `app/index.ts` - it should already have:
```typescript
app.use(cors());
```

This allows all origins. For production, you'll want to restrict this in Phase 6.

---

## Verification Steps

### 1. Test Concurrent Development

```bash
# From project root
npm run dev
```

**Expected**:
- ✅ Backend starts on port 3000
- ✅ Frontend starts on port 5173
- ✅ Browser opens automatically
- ✅ Both show logs in different colors

### 2. Test Linting

```bash
# From project root
npm run lint
```

**Expected**:
- ✅ Both backend and frontend are linted
- ✅ No errors (or known issues documented)

### 3. Test Formatting

```bash
cd client
npm run format:check
```

**Expected**:
- ✅ All files pass Prettier check

### 4. Test Git Hooks

```bash
# Make a small change to a file
# Try to commit
git add .
git commit -m "test: verify git hooks"
```

**Expected**:
- ✅ Lint-staged runs
- ✅ Type checking runs
- ✅ Commit succeeds if no errors

### 5. Test Type Checking

```bash
cd client
npm run type-check
```

**Expected**:
- ✅ No TypeScript errors

---

## Verification Checklist

- [ ] ESLint configured for frontend
- [ ] Prettier installed and configured
- [ ] Concurrent development works (npm run dev)
- [ ] Both frontend and backend run simultaneously
- [ ] Git hooks working (lint-staged + husky)
- [ ] VS Code settings created
- [ ] Type checking works
- [ ] Linting works for both frontend and backend
- [ ] Formatting works
- [ ] All scripts documented

---

## Troubleshooting

### Issue: Concurrent dev doesn't work

**Solution**:
- Ensure concurrently is installed at root level
- Check that both dev scripts work individually
- Verify paths in package.json are correct

### Issue: ESLint errors in IDE

**Solution**:
- Reload VS Code window
- Ensure ESLint extension installed
- Check eslint.workingDirectories in VS Code settings

### Issue: Git hooks not running

**Solution**:
- Ensure .husky/pre-commit has execute permissions
- Run: `chmod +x .husky/pre-commit`
- Verify husky is installed: `npx husky --version`

### Issue: Type checking fails

**Solution**:
- Ensure all TypeScript dependencies installed
- Check tsconfig.json is valid
- Run `npm run type-check` to see specific errors

---

## Success Criteria

Phase 2 is complete when:

1. ✅ ESLint and Prettier configured for frontend
2. ✅ Can run both frontend and backend with one command
3. ✅ Git hooks enforce code quality
4. ✅ VS Code properly configured
5. ✅ All verification tests pass
6. ✅ Development workflow is smooth and efficient
7. ✅ Ready for Phase 3 backend upgrades

---

## Estimated Time Breakdown

| Task | Time Estimate |
|------|---------------|
| ESLint setup | 30 minutes |
| Prettier configuration | 15 minutes |
| Concurrent dev setup | 20 minutes |
| Git hooks configuration | 25 minutes |
| VS Code setup | 20 minutes |
| Testing and verification | 30 minutes |
| **Total** | **~2.5 hours** |

---

## Commit Message

```
feat: configure development environment

- Set up ESLint 9 with flat config for frontend
- Configure Prettier for consistent code formatting
- Add concurrent development with concurrently
- Set up Husky + lint-staged for pre-commit hooks
- Configure VS Code settings and debugging
- Add development scripts and documentation
- Optimize Vite config with SWC and type checking
- Configure environment variables for dev/prod

Phase: 2/6 - Development Environment Configuration
```

---

## Next Phase

Once Phase 2 is complete, proceed to [PHASE_3_BACKEND_UPGRADES.md](./PHASE_3_BACKEND_UPGRADES.md)

---

**Phase Owner**: DevOps Team
**Last Updated**: 2025-11-06
