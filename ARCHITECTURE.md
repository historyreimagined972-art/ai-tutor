# Architecture

## Overview

The AI Tutor app follows a monorepo structure with separate backend and frontend applications sharing TypeScript configuration.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
├─────────────────────────────────────────────────────────────┤
│  Pages: Login, Register, Dashboard, Videos, Doubts, Tests  │
│  Features: Taxonomy, Videos, Doubts, Tests, Past Papers     │
│  Auth: AuthProvider, Token Store, Route Guards              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express)                        │
├─────────────────────────────────────────────────────────────┤
│  Modules: Auth, Taxonomy, Videos, Doubts, Tests, PastPapers│
│  Middleware: Auth, Validation, Error Handler, Rate Limit    │
│  Services: AI (OpenRouter/Gemma), PDF (pdf-lib)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                       │
├─────────────────────────────────────────────────────────────┤
│  Collections: Users, Boards, Classes, Subjects, Topics,    │
│  Channels, Videos, Doubts, Tests, Attempts, PastPapers     │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
1. User submits credentials → POST /auth/login
2. Server validates → issues access token (15min) + refresh token (7d)
3. Access token sent in Authorization header
4. Refresh token stored in HttpOnly cookie
5. On 401, frontend calls /auth/refresh with cookie
6. Server rotates refresh token (reuse detection)
```

## AI Integration Flow

```
1. Student pastes transcript + asks question
2. Frontend sends to POST /doubts/ask
3. Backend sends to OpenRouter API (Gemma 4 model)
4. AI response grounded in transcript context
5. Response returned with grounding indicator
```

## State Management

- **Server State**: TanStack Query with automatic caching/refetching
- **Auth State**: React Context (AuthProvider)
- **Form State**: Local component state with useState

## Security

- HttpOnly cookies for refresh tokens
- Rate limiting (100 requests/15 minutes)
- MongoDB injection prevention (mongo-sanitize)
- Helmet security headers
- Input validation with Zod schemas
