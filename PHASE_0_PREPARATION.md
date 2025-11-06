# Phase 0: Pre-upgrade Preparation

## Overview
This phase focuses on analyzing the current state, creating backups, documenting the existing architecture, and preparing the repository for the upgrade process.

**Duration Estimate**: 1-2 hours
**Risk Level**: Low
**Prerequisites**: None

---

## Objectives

1. ✅ Analyze current codebase structure
2. ✅ Document existing dependencies and versions
3. Create comprehensive backup
4. Audit existing tests and ensure they pass
5. Document current API endpoints
6. Set up upgrade branch
7. Create rollback strategy
8. Identify potential breaking changes

---

## Tasks

### 1. Repository Backup

**Priority**: Critical

```bash
# Create a backup branch
git checkout -b backup/pre-vite-react-upgrade
git push -u origin backup/pre-vite-react-upgrade

# Tag current state
git tag -a v1.0.0-pre-upgrade -m "State before Vite + React upgrade"
git push origin v1.0.0-pre-upgrade

# Return to main development branch
git checkout claude/vite-react-upgrade-plan-011CUrBHZGy773CMRfLDb66m
```

**Verification**: Confirm backup branch and tag exist in remote repository.

---

### 2. Current State Documentation

**Priority**: High

#### 2.1 Dependency Audit

Create `docs/CURRENT_STATE.md`:

```markdown
# Current State Documentation

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
- eslint: ^7.17.0
- nodemon: ^2.0.6
- ts-node: ^9.1.1
- husky: ^4.3.6
- supertest: ^6.0.1
- mongodb-memory-server: ^6.9.2

## Architecture

### Backend Structure
- Layer-based architecture (Routes → Controllers → Services → Repositories)
- MongoDB with Mongoose ODM
- Express.js REST API
- TypeScript with strict mode

### API Endpoints
- GET / - Health check
- POST /api/v1/shorten-url - Create short URL
- GET /api/v1/shorten-url/:uniqueCode - Redirect to original URL

### Database Schema
- URL model with fields: urlSlug, originalUrl, shortUrl, clickCount

## Build Process
- TypeScript compilation to /build directory
- CommonJS modules targeting ES6
- No bundler (using tsc only)

## Testing
- Jest with ts-jest preset
- Integration tests using supertest
- In-memory MongoDB for testing
- Test coverage: ~50% (estimate)

## Issues Identified
- Outdated dependencies (3-4 years old)
- Missing frontend
- No modern build tooling
- Limited test coverage
```

#### 2.2 API Documentation

Create `docs/API_ENDPOINTS.md`:

```markdown
# API Endpoints Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: (deployment URL)

## Endpoints

### 1. Health Check
**GET /**

**Response**: 200 OK
```json
"API is up and running"
```

### 2. Create Short URL
**POST /api/v1/shorten-url**

**Request Body**:
```json
{
  "originalUrl": "https://example.com/very-long-url"
}
```

**Response**: 201 Created
```json
{
  "urlSlug": "abc123",
  "originalUrl": "https://example.com/very-long-url",
  "shortUrl": "http://localhost:3000/abc123",
  "clickCount": 0
}
```

**Validation**:
- originalUrl must be a valid URL format
- Returns 400 if URL is invalid

### 3. Redirect to Original URL
**GET /api/v1/shorten-url/:uniqueCode**

**Parameters**:
- `uniqueCode`: The short URL identifier

**Response**: 302 Redirect
- Redirects to original URL
- Increments click count

**Error Cases**:
- 404 if uniqueCode not found
- 410 Gone if maximum access reached
```

---

### 3. Test Suite Verification

**Priority**: Critical

Run existing tests to ensure baseline functionality:

```bash
# Install dependencies (if not already)
npm install

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Lint check
npm run lint
```

**Expected Results**:
- All tests should pass
- No linting errors (or document any existing issues)
- Record test coverage baseline

**Document Results**:
```bash
# Save test results
npm test > test-results-baseline.txt 2>&1

# Save coverage report
npm test -- --coverage > coverage-baseline.txt 2>&1
```

---

### 4. Environment Configuration Audit

**Priority**: High

Document all required environment variables:

Create `.env.example`:
```bash
# MongoDB Connection
CONNECTION_STRING=mongodb://localhost:27017/url-shortener

# Server Configuration
PORT=3000
NODE_ENV=development

# URL Shortener Configuration
LOCAL_HOSTNAME=http://localhost:3000
MAXIMUM_ACCESS=10

# Optional: Debug
DEBUG=app:*
```

**Verification**:
- Document which variables are required vs optional
- Check if secrets are properly .gitignored
- Verify .env file exists locally but not in repo

---

### 5. Dependency Security Audit

**Priority**: Medium

```bash
# Run security audit
npm audit

# Check for outdated packages
npm outdated

# Save results
npm audit > security-audit-baseline.txt 2>&1
npm outdated > outdated-packages-baseline.txt 2>&1
```

**Expected Issues**:
- Multiple vulnerabilities due to outdated packages
- Document critical vs non-critical issues
- This will be addressed in Phase 3

---

### 6. Git Strategy Setup

**Priority**: High

**Branch Strategy**:
```bash
# Current branch for all upgrade work
claude/vite-react-upgrade-plan-011CUrBHZGy773CMRfLDb66m

# Each phase will have commits:
# - Phase 0: "chore: prepare for vite+react upgrade"
# - Phase 1: "feat: add vite+react frontend structure"
# - Phase 2: "feat: configure development environment"
# - Phase 3: "chore: upgrade backend dependencies"
# - Phase 4: "feat: integrate frontend with backend"
# - Phase 5: "test: add frontend tests"
# - Phase 6: "chore: configure production deployment"
```

**Commit Message Convention**:
- Use conventional commits format
- Types: feat, fix, chore, test, docs, refactor
- Include phase number in commit body

---

### 7. Identify Breaking Changes

**Priority**: High

#### TypeScript 4.1 → 5.6

**Breaking Changes**:
- Stricter checks for `any` types
- Better inference may reveal type errors
- Module resolution updates
- Decorator metadata changes

**Mitigation**:
- Run `tsc --noEmit` to check for type errors
- Update tsconfig.json incrementally
- Fix type errors before proceeding

#### Mongoose 5.x → 8.x

**Breaking Changes**:
- `findOneAndUpdate` returns query instead of promise
- Connection events changed
- Removed `useFindAndModify` option
- Query execution changes

**Mitigation**:
- Review Mongoose migration guide
- Test all database operations
- Update query syntax

#### Express 4.17 → 4.21

**Changes**:
- Mostly non-breaking
- Security updates
- Minor API additions

**Mitigation**:
- Low risk upgrade
- Test middleware functionality

#### Jest 26 → 29

**Breaking Changes**:
- ESM support changes
- Test environment handling
- Async handling improvements

**Mitigation**:
- Update jest.config.js
- Update test utilities
- Verify all tests pass

---

### 8. Project Structure Planning

**Priority**: High

**Proposed Structure**:
```
url-shortener/
├── backend/                    # Existing backend (moved)
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── frontend/                   # New React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
├── package.json                # Root package.json (workspace)
├── UPGRADE_TRACKER.md
├── PHASE_*.md files
└── README.md
```

**Alternative (Simpler)**:
```
url-shortener/
├── app/                        # Backend (existing)
├── client/                     # Frontend (new)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── package.json               # Backend package.json (existing)
└── ...
```

**Decision**: Use simpler structure with `client/` directory for frontend.

---

## Verification Checklist

Before proceeding to Phase 1, ensure:

- [ ] Backup branch created and pushed
- [ ] Git tag created for current state
- [ ] All existing tests pass
- [ ] Test coverage baseline documented
- [ ] Current dependencies documented
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Security audit completed and documented
- [ ] Breaking changes identified
- [ ] Project structure planned
- [ ] Rollback strategy defined

---

## Rollback Strategy

If critical issues arise:

1. **Immediate Rollback**:
   ```bash
   git reset --hard v1.0.0-pre-upgrade
   npm install
   npm test
   ```

2. **Partial Rollback**:
   ```bash
   # Revert specific commits
   git revert <commit-hash>
   ```

3. **Branch Rollback**:
   ```bash
   # Switch to backup branch
   git checkout backup/pre-vite-react-upgrade
   ```

---

## Success Criteria

Phase 0 is complete when:

1. ✅ All verification checklist items completed
2. ✅ Documentation created and reviewed
3. ✅ Backup and rollback strategy in place
4. ✅ Team understands the upgrade plan
5. ✅ Ready to begin Phase 1

---

## Estimated Time Breakdown

| Task | Time Estimate |
|------|---------------|
| Repository backup | 15 minutes |
| Documentation | 30 minutes |
| Test verification | 20 minutes |
| Security audit | 15 minutes |
| Breaking changes analysis | 30 minutes |
| **Total** | **~2 hours** |

---

## Next Phase

Once Phase 0 is complete, proceed to [PHASE_1_VITE_REACT_SETUP.md](./PHASE_1_VITE_REACT_SETUP.md)

---

**Phase Owner**: Development Team
**Last Updated**: 2025-11-06
