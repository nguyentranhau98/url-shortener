# Phase 5: Testing Setup and Implementation

## Overview
This phase focuses on setting up comprehensive testing for the frontend, updating backend tests, adding end-to-end tests, and ensuring good test coverage across the application.

**Duration Estimate**: 3-4 hours
**Risk Level**: Low
**Prerequisites**: Phases 0-4 completed

---

## Objectives

1. Set up Vitest for frontend testing
2. Configure React Testing Library
3. Write unit tests for components
4. Write unit tests for hooks
5. Write unit tests for utilities
6. Update backend tests for new dependencies
7. Add integration tests
8. Set up test coverage reporting
9. Configure CI/CD testing (optional)

---

## Tasks

### 1. Install Frontend Testing Dependencies

**Priority**: Critical

```bash
cd client

# Install Vitest (Vite-native test runner)
npm install -D vitest@2.1.5

# Install React Testing Library
npm install -D @testing-library/react@16.0.1
npm install -D @testing-library/jest-dom@6.6.3
npm install -D @testing-library/user-event@14.5.2

# Install jsdom for DOM simulation
npm install -D jsdom@25.0.1

# Install MSW for API mocking
npm install -D msw@2.6.4

# Install coverage tool
npm install -D @vitest/coverage-v8@2.1.5
```

---

### 2. Configure Vitest

**Priority**: Critical

Create `client/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
        'dist/',
      ],
    },
  },
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
});
```

---

### 3. Create Test Setup Files

**Priority**: Critical

Create `client/src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});
```

Create `client/src/test/utils.tsx`:

```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { ...options });
};

export * from '@testing-library/react';
export { customRender as render };
```

Create `client/src/test/mockData.ts`:

```typescript
import { ShortUrlResponse } from '@types';

export const mockShortUrlResponse: ShortUrlResponse = {
  urlSlug: 'abc123',
  originalUrl: 'https://example.com/very-long-url',
  shortUrl: 'http://localhost:3000/abc123',
  clickCount: 0,
};

export const mockShortUrlResponse2: ShortUrlResponse = {
  urlSlug: 'xyz789',
  originalUrl: 'https://example.com/another-long-url',
  shortUrl: 'http://localhost:3000/xyz789',
  clickCount: 5,
};
```

---

### 4. Write Unit Tests for Utilities

**Priority**: High

Create `client/src/utils/__tests__/validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { isValidUrl, normalizeUrl, validateUrl } from '../validation';

describe('validation utils', () => {
  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('normalizeUrl', () => {
    it('should add https:// to URLs without protocol', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com');
      expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
    });

    it('should not modify URLs with protocol', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
      expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    });
  });

  describe('validateUrl', () => {
    it('should return null for valid URLs', () => {
      expect(validateUrl('https://example.com')).toBeNull();
      expect(validateUrl('example.com')).toBeNull();
    });

    it('should return error for empty URL', () => {
      expect(validateUrl('')).toBe('URL is required');
      expect(validateUrl('   ')).toBe('URL is required');
    });

    it('should return error for too short URL', () => {
      expect(validateUrl('abc')).toBe('URL is too short');
    });

    it('should return error for too long URL', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      expect(validateUrl(longUrl)).toBe('URL is too long (max 2048 characters)');
    });

    it('should return error for invalid URL', () => {
      expect(validateUrl('not a valid url at all')).toBe('Please enter a valid URL');
    });
  });
});
```

Create `client/src/utils/__tests__/formatters.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatUrl, getShortCode } from '../formatters';

describe('formatter utils', () => {
  describe('formatUrl', () => {
    it('should not truncate short URLs', () => {
      const url = 'https://example.com';
      expect(formatUrl(url, 50)).toBe(url);
    });

    it('should truncate long URLs', () => {
      const url = 'https://example.com/very-long-path-that-exceeds-limit';
      const result = formatUrl(url, 30);
      expect(result).toBe('https://example.com/very-long...');
      expect(result.length).toBe(33); // 30 + '...'
    });
  });

  describe('getShortCode', () => {
    it('should extract short code from URL', () => {
      expect(getShortCode('http://localhost:3000/abc123')).toBe('abc123');
      expect(getShortCode('https://short.url/xyz789')).toBe('xyz789');
    });
  });
});
```

---

### 5. Write Unit Tests for Hooks

**Priority**: High

Create `client/src/hooks/__tests__/useUrlShortener.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUrlShortener } from '../useUrlShortener';
import { apiClient } from '@services/api';
import { mockShortUrlResponse } from '@/test/mockData';

// Mock the API client
vi.mock('@services/api', () => ({
  apiClient: {
    shortenUrl: vi.fn(),
  },
}));

describe('useUrlShortener', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useUrlShortener());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.result).toBeNull();
  });

  it('should successfully shorten URL', async () => {
    vi.mocked(apiClient.shortenUrl).mockResolvedValue(mockShortUrlResponse);

    const { result } = renderHook(() => useUrlShortener());

    await result.current.shortenUrl('https://example.com');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.result).toEqual(mockShortUrlResponse);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Failed to shorten URL';
    vi.mocked(apiClient.shortenUrl).mockRejectedValue({
      message: errorMessage,
      statusCode: 500,
    });

    const { result } = renderHook(() => useUrlShortener());

    await result.current.shortenUrl('https://example.com');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.result).toBeNull();
    });
  });

  it('should save to localStorage on success', async () => {
    vi.mocked(apiClient.shortenUrl).mockResolvedValue(mockShortUrlResponse);

    const { result } = renderHook(() => useUrlShortener());

    await result.current.shortenUrl('https://example.com');

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'urlHistory',
        expect.stringContaining(mockShortUrlResponse.urlSlug)
      );
    });
  });

  it('should clear result and error', () => {
    const { result } = renderHook(() => useUrlShortener());

    result.current.clearResult();

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
```

Create `client/src/hooks/__tests__/useCopyToClipboard.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCopyToClipboard } from '../useCopyToClipboard';

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null copiedText', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.copiedText).toBeNull();
  });

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    const textToCopy = 'https://short.url/abc123';
    const success = await result.current.copy(textToCopy);

    expect(success).toBe(true);
    expect(result.current.copiedText).toBe(textToCopy);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(textToCopy);
  });

  it('should reset copiedText after timeout', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCopyToClipboard());

    await result.current.copy('test');
    expect(result.current.copiedText).toBe('test');

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(result.current.copiedText).toBeNull();
    });

    vi.useRealTimers();
  });
});
```

---

### 6. Write Component Tests

**Priority**: High

Create `client/src/components/__tests__/UrlInput.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import UrlInput from '../UrlInput';

describe('UrlInput', () => {
  it('should render input field', () => {
    render(<UrlInput value="" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText(/enter your long url/i);
    expect(input).toBeInTheDocument();
  });

  it('should display value', () => {
    const value = 'https://example.com';
    render(<UrlInput value={value} onChange={vi.fn()} />);

    const input = screen.getByDisplayValue(value);
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<UrlInput value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText(/enter your long url/i);
    await user.type(input, 'test');

    expect(onChange).toHaveBeenCalled();
  });

  it('should display error message', () => {
    const error = 'Invalid URL';
    render(<UrlInput value="" onChange={vi.fn()} error={error} />);

    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<UrlInput value="" onChange={vi.fn()} disabled />);

    const input = screen.getByPlaceholderText(/enter your long url/i);
    expect(input).toBeDisabled();
  });

  it('should apply error class when error is present', () => {
    render(<UrlInput value="" onChange={vi.fn()} error="Error" />);

    const input = screen.getByPlaceholderText(/enter your long url/i);
    expect(input).toHaveClass('url-input-error');
  });
});
```

Create `client/src/components/__tests__/ShortUrlResult.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import ShortUrlResult from '../ShortUrlResult';
import { mockShortUrlResponse } from '@/test/mockData';

describe('ShortUrlResult', () => {
  it('should render short URL', () => {
    render(<ShortUrlResult result={mockShortUrlResponse} onReset={vi.fn()} />);

    expect(screen.getByText(mockShortUrlResponse.shortUrl)).toBeInTheDocument();
  });

  it('should render original URL', () => {
    render(<ShortUrlResult result={mockShortUrlResponse} onReset={vi.fn()} />);

    expect(screen.getByText(mockShortUrlResponse.originalUrl)).toBeInTheDocument();
  });

  it('should call onReset when reset button clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<ShortUrlResult result={mockShortUrlResponse} onReset={onReset} />);

    const resetButton = screen.getByText(/shorten another url/i);
    await user.click(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('should copy to clipboard when copy button clicked', async () => {
    const user = userEvent.setup();

    render(<ShortUrlResult result={mockShortUrlResponse} onReset={vi.fn()} />);

    const copyButton = screen.getByText(/copy/i);
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      mockShortUrlResponse.shortUrl
    );
  });

  it('should show "Copied!" after copying', async () => {
    const user = userEvent.setup();

    render(<ShortUrlResult result={mockShortUrlResponse} onReset={vi.fn()} />);

    const copyButton = screen.getByText(/copy/i);
    await user.click(copyButton);

    expect(screen.getByText(/copied!/i)).toBeInTheDocument();
  });
});
```

---

### 7. Update Package Scripts

**Priority**: Medium

Update `client/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,json}\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

### 8. Update Backend Tests

**Priority**: Medium

Update `app/src/urls/tests/urls.spec.ts` to work with Mongoose 8.x:

```typescript
import { connect, closeDatabase, clearDatabase } from './db-handler';
import { Url } from '../../../database/schema/url';

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('URL Model', () => {
  it('should create a new URL', async () => {
    const urlData = {
      urlSlug: 'test123',
      originalUrl: 'https://example.com',
      shortUrl: 'http://localhost:3000/test123',
      clickCount: 0,
    };

    const url = await Url.create(urlData);

    expect(url.urlSlug).toBe(urlData.urlSlug);
    expect(url.originalUrl).toBe(urlData.originalUrl);
    expect(url.shortUrl).toBe(urlData.shortUrl);
    expect(url.clickCount).toBe(0);
  });

  it('should increment click count', async () => {
    const url = await Url.create({
      urlSlug: 'test123',
      originalUrl: 'https://example.com',
      shortUrl: 'http://localhost:3000/test123',
      clickCount: 0,
    });

    const updated = await Url.findOneAndUpdate(
      { urlSlug: 'test123' },
      { $inc: { clickCount: 1 } },
      { new: true }
    ).exec();

    expect(updated?.clickCount).toBe(1);
  });

  it('should find URL by slug', async () => {
    await Url.create({
      urlSlug: 'test123',
      originalUrl: 'https://example.com',
      shortUrl: 'http://localhost:3000/test123',
      clickCount: 0,
    });

    const found = await Url.findOne({ urlSlug: 'test123' }).exec();

    expect(found).not.toBeNull();
    expect(found?.urlSlug).toBe('test123');
  });
});
```

---

### 9. Set Up Test Coverage

**Priority**: Low

Create `.github/workflows/test.yml` (if using GitHub):

```yaml
name: Tests

on:
  push:
    branches: [main, claude/**]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run backend tests
        run: npm test

      - name: Run backend lint
        run: npm run lint

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd client && npm install

      - name: Run frontend tests
        run: cd client && npm run test:run

      - name: Run frontend lint
        run: cd client && npm run lint

      - name: Type check
        run: cd client && npm run type-check

      - name: Generate coverage
        run: cd client && npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          directory: ./client/coverage
```

---

## Verification Steps

### 1. Run Frontend Tests

```bash
cd client

# Run tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

**Expected**: All tests pass, coverage report generated

### 2. Run Backend Tests

```bash
# From root
npm test
```

**Expected**: All tests pass

### 3. Run All Tests

```bash
# From root
npm run test
```

**Expected**: Both frontend and backend tests pass

---

## Verification Checklist

- [ ] Vitest installed and configured
- [ ] React Testing Library set up
- [ ] Test setup files created
- [ ] Utility function tests written and passing
- [ ] Hook tests written and passing
- [ ] Component tests written and passing
- [ ] Backend tests updated for Mongoose 8.x
- [ ] All tests pass
- [ ] Test coverage is adequate (>70%)
- [ ] CI/CD pipeline configured (optional)

---

## Test Coverage Goals

| Area | Target Coverage |
|------|----------------|
| Utilities | >90% |
| Hooks | >80% |
| Components | >70% |
| Services | >80% |
| Overall Frontend | >75% |
| Backend | >80% |

---

## Success Criteria

Phase 5 is complete when:

1. ✅ Frontend testing framework set up (Vitest + RTL)
2. ✅ Comprehensive tests written for utilities, hooks, and components
3. ✅ Backend tests updated and passing
4. ✅ Test coverage meets goals
5. ✅ All tests pass in CI/CD (if configured)
6. ✅ Ready for Phase 6 deployment

---

## Estimated Time Breakdown

| Task | Time Estimate |
|------|---------------|
| Testing setup | 30 minutes |
| Utility tests | 30 minutes |
| Hook tests | 45 minutes |
| Component tests | 60 minutes |
| Backend test updates | 30 minutes |
| CI/CD configuration | 30 minutes |
| Verification | 20 minutes |
| **Total** | **~3.5 hours** |

---

## Commit Message

```
test: add comprehensive testing setup

- Set up Vitest with React Testing Library
- Configure test environment and mocks
- Write unit tests for utilities (validation, formatters)
- Write unit tests for custom hooks
- Write component tests with user interactions
- Update backend tests for Mongoose 8.x
- Add test coverage reporting
- Configure CI/CD testing pipeline
- Achieve >75% overall test coverage

Phase: 5/6 - Testing Setup and Implementation
```

---

## Next Phase

Once Phase 5 is complete, proceed to [PHASE_6_DEPLOYMENT.md](./PHASE_6_DEPLOYMENT.md)

---

**Phase Owner**: QA Team
**Last Updated**: 2025-11-06
