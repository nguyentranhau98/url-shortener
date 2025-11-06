# Phase 4: Frontend-Backend Integration

## Overview
This phase focuses on integrating the React frontend with the backend API, implementing the URL shortening functionality, creating API client services, handling errors, and building out the user interface.

**Duration Estimate**: 4-6 hours
**Risk Level**: Medium
**Prerequisites**: Phases 0-3 completed

---

## Objectives

1. Create API client service
2. Implement URL shortening functionality
3. Build responsive UI components
4. Add form validation
5. Implement error handling
6. Add loading states
7. Create redirect handling
8. Add analytics/statistics view (optional)
9. Implement URL history (localStorage)
10. Add copy-to-clipboard functionality

---

## Tasks

### 1. Create API Client Service

**Priority**: Critical

Create `client/src/services/api.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ShortUrlResponse, ShortenUrlRequest, ApiError } from '@types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}${API_BASE_PATH}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth tokens here if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          statusCode: error.response?.status || 500,
        };
        return Promise.reject(apiError);
      }
    );
  }

  async shortenUrl(originalUrl: string): Promise<ShortUrlResponse> {
    const request: ShortenUrlRequest = { originalUrl };
    const response = await this.client.post<ShortUrlResponse>('/shorten-url', request);
    return response.data;
  }

  async getUrlInfo(uniqueCode: string): Promise<ShortUrlResponse> {
    const response = await this.client.get<ShortUrlResponse>(`/shorten-url/${uniqueCode}`);
    return response.data;
  }

  async checkHealth(): Promise<string> {
    const response = await this.client.get<string>('/');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
```

Install axios:

```bash
cd client
npm install axios@1.7.7
```

---

### 2. Create Custom Hooks

**Priority**: High

Create `client/src/hooks/useUrlShortener.ts`:

```typescript
import { useState } from 'react';
import { apiClient } from '@services/api';
import { ShortUrlResponse, ApiError } from '@types';

interface UseUrlShortenerReturn {
  shortenUrl: (url: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  result: ShortUrlResponse | null;
  clearResult: () => void;
}

export const useUrlShortener = (): UseUrlShortenerReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortUrlResponse | null>(null);

  const shortenUrl = async (url: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.shortenUrl(url);
      setResult(response);

      // Save to localStorage
      saveToHistory(response);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  const saveToHistory = (urlData: ShortUrlResponse) => {
    const history = localStorage.getItem('urlHistory');
    const parsedHistory: ShortUrlResponse[] = history ? JSON.parse(history) : [];

    // Add new URL to the beginning, limit to 10 items
    const updatedHistory = [urlData, ...parsedHistory.filter(
      item => item.urlSlug !== urlData.urlSlug
    )].slice(0, 10);

    localStorage.setItem('urlHistory', JSON.stringify(updatedHistory));
  };

  return { shortenUrl, loading, error, result, clearResult };
};
```

Create `client/src/hooks/useUrlHistory.ts`:

```typescript
import { useState, useEffect } from 'react';
import { ShortUrlResponse } from '@types';

export const useUrlHistory = () => {
  const [history, setHistory] = useState<ShortUrlResponse[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const stored = localStorage.getItem('urlHistory');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('urlHistory');
    setHistory([]);
  };

  const removeItem = (urlSlug: string) => {
    const updated = history.filter(item => item.urlSlug !== urlSlug);
    localStorage.setItem('urlHistory', JSON.stringify(updated));
    setHistory(updated);
  };

  return { history, clearHistory, removeItem, reloadHistory: loadHistory };
};
```

Create `client/src/hooks/useCopyToClipboard.ts`:

```typescript
import { useState } from 'react';

export const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);

      // Reset after 2 seconds
      setTimeout(() => setCopiedText(null), 2000);

      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopiedText(null);
      return false;
    }
  };

  return { copiedText, copy };
};
```

---

### 3. Create Utility Functions

**Priority**: Medium

Create `client/src/utils/validation.ts`:

```typescript
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const normalizeUrl = (url: string): string => {
  // Add https:// if no protocol specified
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

export const validateUrl = (url: string): string | null => {
  if (!url.trim()) {
    return 'URL is required';
  }

  if (url.length < 10) {
    return 'URL is too short';
  }

  if (url.length > 2048) {
    return 'URL is too long (max 2048 characters)';
  }

  const normalized = normalizeUrl(url);
  if (!isValidUrl(normalized)) {
    return 'Please enter a valid URL';
  }

  return null;
};
```

Create `client/src/utils/formatters.ts`:

```typescript
export const formatUrl = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) {
    return url;
  }
  return `${url.substring(0, maxLength)}...`;
};

export const getShortCode = (shortUrl: string): string => {
  const parts = shortUrl.split('/');
  return parts[parts.length - 1];
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
```

---

### 4. Build Main URL Shortener Component

**Priority**: Critical

Create `client/src/components/UrlShortener.tsx`:

```typescript
import { useState } from 'react';
import { useUrlShortener } from '@hooks/useUrlShortener';
import { validateUrl, normalizeUrl } from '@utils/validation';
import UrlInput from './UrlInput';
import ShortUrlResult from './ShortUrlResult';
import ErrorMessage from './common/ErrorMessage';
import LoadingSpinner from './common/LoadingSpinner';
import './UrlShortener.css';

const UrlShortener = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { shortenUrl, loading, error, result, clearResult } = useUrlShortener();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const error = validateUrl(inputUrl);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    const normalized = normalizeUrl(inputUrl);
    await shortenUrl(normalized);
  };

  const handleInputChange = (value: string) => {
    setInputUrl(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleReset = () => {
    setInputUrl('');
    clearResult();
    setValidationError(null);
  };

  return (
    <div className="url-shortener">
      <div className="url-shortener-header">
        <h1>URL Shortener</h1>
        <p>Transform long URLs into short, shareable links</p>
      </div>

      <form onSubmit={handleSubmit} className="url-shortener-form">
        <UrlInput
          value={inputUrl}
          onChange={handleInputChange}
          disabled={loading}
          error={validationError || undefined}
        />

        <button
          type="submit"
          disabled={loading || !inputUrl.trim()}
          className="shorten-button"
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {loading && <LoadingSpinner />}

      {error && <ErrorMessage message={error} onDismiss={clearResult} />}

      {result && (
        <ShortUrlResult
          result={result}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default UrlShortener;
```

Create `client/src/components/UrlShortener.css`:

```css
.url-shortener {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.url-shortener-header {
  text-align: center;
  margin-bottom: 2rem;
}

.url-shortener-header h1 {
  font-size: 2.5rem;
  color: #646cff;
  margin-bottom: 0.5rem;
}

.url-shortener-header p {
  font-size: 1.1rem;
  color: #888;
}

.url-shortener-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.shorten-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shorten-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.shorten-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .url-shortener {
    padding: 1rem;
  }

  .url-shortener-header h1 {
    font-size: 2rem;
  }
}
```

---

### 5. Create Component Library

**Priority**: High

Create `client/src/components/UrlInput.tsx`:

```typescript
import { ChangeEvent } from 'react';
import './UrlInput.css';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const UrlInput = ({ value, onChange, disabled, error }: UrlInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="url-input-container">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Enter your long URL here... (e.g., https://example.com/very-long-url)"
        className={`url-input ${error ? 'url-input-error' : ''}`}
        autoFocus
      />
      {error && <span className="url-input-error-message">{error}</span>}
    </div>
  );
};

export default UrlInput;
```

Create `client/src/components/UrlInput.css`:

```css
.url-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.url-input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: transparent;
  color: inherit;
  transition: all 0.3s ease;
}

.url-input:focus {
  outline: none;
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}

.url-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.url-input-error {
  border-color: #ff4444;
}

.url-input-error:focus {
  border-color: #ff4444;
  box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.1);
}

.url-input-error-message {
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

Create `client/src/components/ShortUrlResult.tsx`:

```typescript
import { useCopyToClipboard } from '@hooks/useCopyToClipboard';
import { ShortUrlResponse } from '@types';
import './ShortUrlResult.css';

interface ShortUrlResultProps {
  result: ShortUrlResponse;
  onReset: () => void;
}

const ShortUrlResult = ({ result, onReset }: ShortUrlResultProps) => {
  const { copiedText, copy } = useCopyToClipboard();
  const isCopied = copiedText === result.shortUrl;

  const handleCopy = () => {
    copy(result.shortUrl);
  };

  return (
    <div className="short-url-result">
      <div className="result-header">
        <h3>✨ Your shortened URL is ready!</h3>
      </div>

      <div className="result-content">
        <div className="url-display">
          <a
            href={result.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="short-url-link"
          >
            {result.shortUrl}
          </a>
        </div>

        <button
          onClick={handleCopy}
          className={`copy-button ${isCopied ? 'copied' : ''}`}
        >
          {isCopied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      <div className="result-details">
        <div className="detail-item">
          <span className="detail-label">Original URL:</span>
          <span className="detail-value">{result.originalUrl}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Short Code:</span>
          <span className="detail-value">{result.urlSlug}</span>
        </div>
      </div>

      <button onClick={onReset} className="reset-button">
        Shorten Another URL
      </button>
    </div>
  );
};

export default ShortUrlResult;
```

Create `client/src/components/ShortUrlResult.css`:

```css
.short-url-result {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  padding: 2rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header h3 {
  margin: 0 0 1.5rem 0;
  color: #646cff;
  font-size: 1.5rem;
  text-align: center;
}

.result-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.url-display {
  flex: 1;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #646cff;
}

.short-url-link {
  color: #646cff;
  font-size: 1.1rem;
  font-weight: 600;
  word-break: break-all;
  text-decoration: none;
}

.short-url-link:hover {
  text-decoration: underline;
}

.copy-button {
  padding: 1rem 1.5rem;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.copy-button:hover {
  background-color: #535bf2;
}

.copy-button.copied {
  background-color: #22c55e;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 600;
}

.detail-value {
  word-break: break-all;
  color: #333;
}

.reset-button {
  width: 100%;
  padding: 0.75rem;
  background-color: transparent;
  color: #646cff;
  border: 2px solid #646cff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background-color: #646cff;
  color: white;
}

@media (max-width: 768px) {
  .result-content {
    flex-direction: column;
  }
}
```

Create common components:

`client/src/components/common/LoadingSpinner.tsx`:

```typescript
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Shortening your URL...</p>
    </div>
  );
};

export default LoadingSpinner;
```

`client/src/components/common/LoadingSpinner.css`:

```css
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #646cff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #888;
  font-size: 0.95rem;
}
```

`client/src/components/common/ErrorMessage.tsx`:

```typescript
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

const ErrorMessage = ({ message, onDismiss }: ErrorMessageProps) => {
  return (
    <div className="error-message">
      <span className="error-icon">⚠️</span>
      <span className="error-text">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="error-dismiss">
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
```

`client/src/components/common/ErrorMessage.css`:

```css
.error-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c00;
  animation: slideIn 0.3s ease-out;
}

.error-icon {
  font-size: 1.5rem;
}

.error-text {
  flex: 1;
}

.error-dismiss {
  background: none;
  border: none;
  color: #c00;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.error-dismiss:hover {
  opacity: 0.7;
}
```

---

### 6. Update Main App

**Priority**: Critical

Update `client/src/App.tsx`:

```typescript
import UrlShortener from './components/UrlShortener';
import './App.css';

function App() {
  return (
    <div className="App">
      <main className="App-main">
        <UrlShortener />
      </main>

      <footer className="App-footer">
        <p>Built with React + Vite + TypeScript</p>
      </footer>
    </div>
  );
}

export default App;
```

Update `client/src/App.css`:

```css
.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.App-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.App-footer {
  text-align: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

@media (prefers-color-scheme: light) {
  .App {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}
```

---

### 7. Optional: URL History Component

**Priority**: Low

Create `client/src/components/UrlHistory.tsx`:

```typescript
import { useUrlHistory } from '@hooks/useUrlHistory';
import { useCopyToClipboard } from '@hooks/useCopyToClipboard';
import './UrlHistory.css';

const UrlHistory = () => {
  const { history, clearHistory, removeItem } = useUrlHistory();
  const { copy, copiedText } = useCopyToClipboard();

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="url-history">
      <div className="history-header">
        <h3>Recent URLs</h3>
        <button onClick={clearHistory} className="clear-history-btn">
          Clear All
        </button>
      </div>

      <div className="history-list">
        {history.map((item) => (
          <div key={item.urlSlug} className="history-item">
            <div className="history-item-content">
              <a
                href={item.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="history-short-url"
              >
                {item.shortUrl}
              </a>
              <span className="history-original-url">{item.originalUrl}</span>
            </div>

            <div className="history-item-actions">
              <button
                onClick={() => copy(item.shortUrl)}
                className="history-action-btn"
              >
                {copiedText === item.shortUrl ? '✓' : '📋'}
              </button>
              <button
                onClick={() => removeItem(item.urlSlug)}
                className="history-action-btn history-delete-btn"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrlHistory;
```

---

## Verification Steps

### 1. Test API Connection

```bash
# Start backend
npm run dev:backend

# In another terminal, start frontend
npm run dev:frontend

# Check browser console for errors
```

### 2. Test URL Shortening

1. Open http://localhost:5173
2. Enter a valid URL
3. Click "Shorten URL"
4. Verify short URL is displayed
5. Click copy button
6. Verify URL is copied

### 3. Test Error Handling

1. Enter invalid URL
2. Verify validation error shows
3. Submit without backend running
4. Verify error message displays

### 4. Test Responsive Design

1. Open browser dev tools
2. Test on mobile viewport
3. Verify UI adapts correctly

---

## Verification Checklist

- [ ] API client service created and working
- [ ] URL shortening functionality works
- [ ] Form validation works
- [ ] Error handling displays correctly
- [ ] Loading states display
- [ ] Copy to clipboard works
- [ ] Responsive design works on mobile
- [ ] TypeScript types are correct
- [ ] No console errors
- [ ] Backend integration successful

---

## Success Criteria

Phase 4 is complete when:

1. ✅ Frontend successfully connects to backend API
2. ✅ URL shortening works end-to-end
3. ✅ Error handling is robust
4. ✅ UI is responsive and user-friendly
5. ✅ All features work as expected
6. ✅ No TypeScript or runtime errors
7. ✅ Ready for Phase 5 testing

---

## Commit Message

```
feat: integrate frontend with backend API

- Create API client service with axios
- Implement URL shortening functionality
- Build responsive UI components
- Add form validation and error handling
- Create custom hooks for state management
- Add copy-to-clipboard functionality
- Implement URL history with localStorage
- Create loading and error states
- Build comprehensive component library

Phase: 4/6 - Frontend-Backend Integration
```

---

## Next Phase

Once Phase 4 is complete, proceed to [PHASE_5_TESTING.md](./PHASE_5_TESTING.md)

---

**Phase Owner**: Full Stack Team
**Last Updated**: 2025-11-06
