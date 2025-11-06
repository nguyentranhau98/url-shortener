# Phase 1: Vite + React Setup

## Overview
This phase focuses on creating the frontend structure with the latest stable versions of Vite and React, setting up TypeScript, and establishing the basic project foundation.

**Duration Estimate**: 2-3 hours
**Risk Level**: Low
**Prerequisites**: Phase 0 completed

---

## Objectives

1. Create frontend directory structure
2. Initialize Vite + React with TypeScript
3. Configure TypeScript for frontend
4. Set up basic routing
5. Create initial component structure
6. Configure path aliases
7. Install essential dependencies
8. Verify development server runs

---

## Target Versions

- **React**: 18.3.1 (latest stable)
- **React DOM**: 18.3.1
- **Vite**: 6.0.1 (latest stable)
- **TypeScript**: 5.6.3 (latest stable)
- **@vitejs/plugin-react**: 4.3.4

---

## Tasks

### 1. Create Frontend Directory

**Priority**: Critical

```bash
# From project root
mkdir -p client/src client/public

# Create directory structure
cd client
mkdir -p src/{components,pages,hooks,services,utils,types,assets}
mkdir -p src/components/{common,layout}
mkdir -p public/assets
```

**Directory Structure**:
```
client/
├── public/
│   ├── assets/
│   └── vite.svg
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # React components
│   │   ├── common/      # Reusable components
│   │   └── layout/      # Layout components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Root component
│   ├── App.css
│   ├── main.tsx         # Entry point
│   └── index.css
├── index.html           # HTML entry point
├── package.json
├── tsconfig.json        # TypeScript config
├── tsconfig.node.json   # TypeScript config for Vite
├── vite.config.ts       # Vite configuration
└── .gitignore
```

---

### 2. Initialize Vite Project

**Priority**: Critical

```bash
# From project root
cd client

# Initialize package.json
npm init -y

# Install Vite and React dependencies
npm install react@18.3.1 react-dom@18.3.1
npm install -D vite@6.0.1 @vitejs/plugin-react@4.3.4

# Install TypeScript and types
npm install -D typescript@5.6.3
npm install -D @types/react@18.3.12 @types/react-dom@18.3.1
npm install -D @types/node@22.9.0
```

**Verification**: Check that package.json has correct versions.

---

### 3. Configure Vite

**Priority**: Critical

Create `client/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Path aliases
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

  // Server configuration
  server: {
    port: 5173,
    open: true,
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },

  // Optimizations
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
```

---

### 4. Configure TypeScript

**Priority**: Critical

Create `client/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases - must match vite.config.ts */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@pages/*": ["./src/pages/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@services/*": ["./src/services/*"],
      "@utils/*": ["./src/utils/*"],
      "@types/*": ["./src/types/*"],
      "@assets/*": ["./src/assets/*"]
    }
  },
  "include": ["src"]
}
```

Create `client/tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

---

### 5. Create HTML Entry Point

**Priority**: Critical

Create `client/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>URL Shortener</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### 6. Create React Entry Point

**Priority**: Critical

Create `client/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `client/src/index.css`:

```css
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  button {
    background-color: #f9f9f9;
  }
}
```

---

### 7. Create Root Component

**Priority**: Critical

Create `client/src/App.tsx`:

```typescript
import { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Shortener</h1>
        <p>Shorten your URLs with ease</p>
      </header>

      <main className="App-main">
        <div className="url-form">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your long URL here..."
            className="url-input"
          />
          <button className="shorten-btn">
            Shorten URL
          </button>
        </div>

        {shortUrl && (
          <div className="result">
            <p>Your shortened URL:</p>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Built with React + Vite</p>
      </footer>
    </div>
  );
}

export default App;
```

Create `client/src/App.css`:

```css
.App {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.App-header {
  margin-bottom: 3rem;
}

.App-header h1 {
  color: #646cff;
  margin-bottom: 0.5rem;
}

.App-header p {
  color: #888;
  font-size: 1.2rem;
}

.App-main {
  min-height: 300px;
}

.url-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.url-input {
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #646cff;
  border-radius: 8px;
  background-color: transparent;
  color: inherit;
}

.url-input:focus {
  outline: none;
  border-color: #535bf2;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}

.shorten-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background-color: #646cff;
  color: white;
  border: none;
  cursor: pointer;
}

.shorten-btn:hover {
  background-color: #535bf2;
}

.result {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(100, 108, 255, 0.1);
  border-radius: 8px;
}

.result a {
  color: #646cff;
  font-size: 1.2rem;
  word-break: break-all;
}

.App-footer {
  margin-top: 4rem;
  color: #888;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .App {
    padding: 1rem;
  }

  .url-form {
    max-width: 100%;
  }
}
```

---

### 8. Create TypeScript Types

**Priority**: High

Create `client/src/types/index.ts`:

```typescript
export interface ShortUrlResponse {
  urlSlug: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
}

export interface ShortenUrlRequest {
  originalUrl: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
```

---

### 9. Configure Package Scripts

**Priority**: Critical

Update `client/package.json` scripts section:

```json
{
  "name": "url-shortener-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  }
}
```

---

### 10. Create .gitignore for Frontend

**Priority**: Medium

Create `client/.gitignore`:

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependencies
node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.*.local

# Build output
build
.vite
```

---

### 11. Install React Router (Optional but Recommended)

**Priority**: Medium

```bash
cd client
npm install react-router-dom@6.28.0
npm install -D @types/react-router-dom
```

Create `client/src/pages/HomePage.tsx`:

```typescript
import { useState } from 'react';

export default function HomePage() {
  const [url, setUrl] = useState('');

  return (
    <div className="home-page">
      <h1>URL Shortener</h1>
      <p>Shorten your URLs with ease</p>

      <div className="url-form">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter your long URL here..."
        />
        <button>Shorten URL</button>
      </div>
    </div>
  );
}
```

Update `client/src/App.tsx` to use router:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

### 12. Environment Variables Setup

**Priority**: Medium

Create `client/.env.example`:

```bash
# Backend API URL
VITE_API_URL=http://localhost:3000
VITE_API_BASE_PATH=/api/v1
```

Create `client/.env.development`:

```bash
VITE_API_URL=http://localhost:3000
VITE_API_BASE_PATH=/api/v1
```

**Usage in code**:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH;
```

---

### 13. Add Vite Environment Types

**Priority**: Low

Create `client/src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_BASE_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Verification Steps

Run these commands to verify the setup:

```bash
# From client directory
cd client

# Install all dependencies
npm install

# Type check
npm run type-check

# Start development server
npm run dev
```

**Expected Results**:
- ✅ No TypeScript errors
- ✅ Development server starts on http://localhost:5173
- ✅ Basic UI renders with URL input form
- ✅ No console errors in browser

---

## Verification Checklist

- [ ] Frontend directory structure created
- [ ] Vite installed and configured
- [ ] React 18.3.1 installed
- [ ] TypeScript 5.6.3 configured
- [ ] Path aliases working
- [ ] Development server runs successfully
- [ ] Hot Module Replacement (HMR) working
- [ ] Basic UI renders correctly
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] React Router installed and working (if included)

---

## Troubleshooting

### Issue: TypeScript errors with path aliases

**Solution**: Ensure paths in `tsconfig.json` match aliases in `vite.config.ts`

### Issue: Vite server doesn't start

**Solution**:
- Check port 5173 is available
- Verify all dependencies installed
- Check for syntax errors in config files

### Issue: HMR not working

**Solution**:
- Clear browser cache
- Restart Vite dev server
- Check for errors in terminal

---

## Success Criteria

Phase 1 is complete when:

1. ✅ Frontend directory structure created
2. ✅ Vite + React installed with correct versions
3. ✅ TypeScript configured and type-checking passes
4. ✅ Development server runs without errors
5. ✅ Basic UI renders in browser
6. ✅ HMR (Hot Module Replacement) working
7. ✅ Ready for Phase 2 development environment setup

---

## Estimated Time Breakdown

| Task | Time Estimate |
|------|---------------|
| Directory setup | 15 minutes |
| Vite + React installation | 20 minutes |
| TypeScript configuration | 20 minutes |
| Create base components | 30 minutes |
| React Router setup | 20 minutes |
| Testing and verification | 30 minutes |
| **Total** | **~2.5 hours** |

---

## Commit Message

```
feat: add vite+react frontend structure

- Initialize Vite 6.0.1 with React 18.3.1
- Configure TypeScript 5.6.3 with strict mode
- Set up project structure with organized directories
- Configure path aliases for clean imports
- Add React Router 6.28.0 for routing
- Create basic UI components and layout
- Configure Vite proxy for backend API
- Add environment variable support

Phase: 1/6 - Vite + React Setup
```

---

## Next Phase

Once Phase 1 is complete, proceed to [PHASE_2_DEVELOPMENT_ENVIRONMENT.md](./PHASE_2_DEVELOPMENT_ENVIRONMENT.md)

---

**Phase Owner**: Frontend Team
**Last Updated**: 2025-11-06
