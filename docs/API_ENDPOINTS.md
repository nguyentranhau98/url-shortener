# API Endpoints Documentation

**Version**: 1.0.0
**Base URL**: `http://localhost:3000`

## Overview

The URL Shortener API provides endpoints for creating short URLs and redirecting to original URLs.

---

## Endpoints

### 1. Health Check

**Endpoint**: `GET /`

**Description**: Check if the API is running.

**Request**: None

**Response**:
```
Status: 200 OK
Content-Type: text/plain

"API is up and running"
```

**Example**:
```bash
curl http://localhost:3000/
```

---

### 2. Create Short URL

**Endpoint**: `POST /api/v1/shorten-url`

**Description**: Create a shortened URL from a long URL.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "originalUrl": "https://example.com/very-long-url-that-needs-shortening"
}
```

**Success Response**:
```
Status: 201 Created
Content-Type: application/json
```

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "urlSlug": "abc123xyz",
  "originalUrl": "https://example.com/very-long-url-that-needs-shortening",
  "shortUrl": "http://localhost:3000/abc123xyz",
  "clickCount": 0,
  "createdAt": "2025-11-06T07:00:00.000Z",
  "updatedAt": "2025-11-06T07:00:00.000Z"
}
```

**Error Responses**:

*Invalid URL Format*:
```
Status: 400 Bad Request
Content-Type: application/json
```
```json
{
  "error": "Invalid URL format"
}
```

*Missing originalUrl*:
```
Status: 400 Bad Request
Content-Type: application/json
```
```json
{
  "error": "originalUrl is required"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/shorten-url \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com/long-url"}'
```

---

### 3. Redirect to Original URL

**Endpoint**: `GET /api/v1/shorten-url/:uniqueCode`

**Description**: Redirect to the original URL using the short code. Increments the click counter.

**Path Parameters**:
- `uniqueCode` (string, required): The unique short code identifier

**Success Response**:
```
Status: 302 Found
Location: <original-url>
```

The browser will be redirected to the original URL. The click count is incremented.

**Error Responses**:

*Short URL Not Found*:
```
Status: 404 Not Found
Content-Type: application/json
```
```json
{
  "error": "Short URL not found"
}
```

*Maximum Access Reached*:
```
Status: 410 Gone
Content-Type: application/json
```
```json
{
  "error": "This short URL has expired (maximum access reached)"
}
```

**Example**:
```bash
curl -L http://localhost:3000/api/v1/shorten-url/abc123xyz
```

**Note**: The `-L` flag tells curl to follow the redirect.

---

## Request/Response Flow

### Creating a Short URL

```
Client                          Server                    Database
  |                               |                           |
  |--POST /api/v1/shorten-url---->|                           |
  |   {"originalUrl": "..."}      |                           |
  |                               |----Validate URL---------->|
  |                               |<--Validation OK-----------|
  |                               |                           |
  |                               |----Generate slug--------->|
  |                               |<--Unique slug-------------|
  |                               |                           |
  |                               |----Save URL-------------->|
  |                               |<--URL saved---------------|
  |                               |                           |
  |<--201 Created-----------------|                           |
  |   {shortUrl, slug, ...}       |                           |
```

### Using a Short URL

```
Client                          Server                    Database
  |                               |                           |
  |--GET /api/v1/.../abc123------>|                           |
  |                               |----Find URL by slug------>|
  |                               |<--URL found---------------|
  |                               |                           |
  |                               |----Increment counter----->|
  |                               |<--Counter updated---------|
  |                               |                           |
  |<--302 Redirect----------------|                           |
  |   Location: originalUrl       |                           |
  |                               |                           |
  |--GET originalUrl------------> (External website)
```

---

## Data Models

### URL Object

```typescript
{
  _id: string;              // MongoDB ObjectId
  urlSlug: string;          // Unique short code (e.g., "abc123")
  originalUrl: string;      // Original long URL
  shortUrl: string;         // Full short URL (e.g., "http://localhost:3000/abc123")
  clickCount: number;       // Number of times accessed
  createdAt: Date;          // Creation timestamp
  updatedAt: Date;          // Last update timestamp
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `302 Found` - Redirect to original URL
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `410 Gone` - Resource expired/no longer available
- `500 Internal Server Error` - Server error

---

## Rate Limiting

**Current Status**: Not implemented

**Planned**: To be added in Phase 6
- 100 requests per 15 minutes per IP
- Returns 429 Too Many Requests when exceeded

---

## CORS Configuration

**Current Status**: Allows all origins

```typescript
app.use(cors());
```

**Planned**: Restrict to known origins in production (Phase 6)

---

## Authentication

**Current Status**: Not implemented

All endpoints are publicly accessible.

**Planned**: Optional API key authentication for admin endpoints (future enhancement)

---

## Validation Rules

### Original URL Validation

Current implementation uses `valid-url` package:
- Must be a valid URL format
- Must include protocol (http:// or https://)
- Maximum length: Implementation dependent (no explicit limit)

**Planned Improvements** (Phase 3):
- Maximum URL length: 2048 characters
- Protocol whitelist: http, https only
- Domain blacklist: Prevent malicious domains
- URL normalization: Consistent formatting

---

## Performance Considerations

### Current Implementation
- No caching
- Direct database queries
- No connection pooling configuration

### Planned Improvements
- Add Redis caching for frequently accessed URLs
- Implement database indexing on urlSlug
- Connection pooling optimization

---

## Testing

Test the API using:

1. **cURL** (examples shown above)
2. **Postman**: Import collection (to be created)
3. **HTTPie**: `http POST localhost:3000/api/v1/shorten-url originalUrl=https://example.com`
4. **Automated Tests**: `npm test`

---

## Changelog

### Version 1.0.0 (Current)
- Initial API implementation
- Basic URL shortening functionality
- Redirect with click tracking
- MongoDB storage

### Version 2.0.0 (Planned - Post Upgrade)
- Add request validation
- Implement rate limiting
- Add comprehensive error handling
- CORS restrictions for production
- Health check endpoints
- API documentation via Swagger/OpenAPI

---

**Last Updated**: 2025-11-06
**Maintained By**: Development Team
