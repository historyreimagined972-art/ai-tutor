# AI Tutor Web App

An AI-powered tutoring platform for Pakistani students featuring video recommendations, doubt clearing, test generation, and past paper browsing.

## Features

- **Video Lessons**: Curated video content organized by Board → Class → Subject → Topic taxonomy
- **Doubt Clearing**: AI-powered Q&A grounded in video transcripts (Google Gemma 4 via OpenRouter)
- **Practice Tests**: AI-generated MCQ tests with auto-grading and PDF download
- **Past Papers**: Browse and download past papers filtered by board, class, subject, and year
- **Admin Panel**: Manage taxonomy, channels, videos, and past papers

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, React Router
- **Backend**: Node.js, Express 5, TypeScript, Mongoose 9, Zod validation
- **Database**: MongoDB
- **Auth**: JWT (access + refresh tokens), bcrypt, HttpOnly cookies
- **AI**: OpenRouter API (Google Gemma 4 26B A4B)
- **PDF Generation**: pdf-lib

## Project Structure

```
ai-tutor/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment validation, DB connection
│   │   ├── middleware/       # Auth, error handling, validation
│   │   ├── modules/         # Feature modules (auth, taxonomy, videos, doubts, tests, pastpapers)
│   │   ├── services/        # AI service, PDF service
│   │   └── utils/           # Encryption, JWT helpers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── auth/            # Auth provider, token store, route guards
│   │   ├── features/        # Feature modules (taxonomy, videos, doubts, tests, pastpapers)
│   │   ├── lib/             # API client
│   │   └── pages/           # Page components
│   └── package.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenRouter API key

### Installation

```bash
# Install dependencies
npm install

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, and OpenRouter API key

# Frontend setup
cd ../frontend
cp .env.example .env
# Edit .env with VITE_API_BASE_URL=http://localhost:5000/api/v1

# Start development servers
cd backend && npm run dev
cd frontend && npm run dev
```

### Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Refresh token |
| POST | /api/v1/auth/logout | Logout |
| GET | /api/v1/taxonomy/tree | Get full taxonomy tree |
| GET | /api/v1/content/videos/student | Get videos for student |
| POST | /api/v1/doubts/ask | Ask a doubt |
| POST | /api/v1/tests/generate | Generate a test |
| GET | /api/v1/past-papers | Get past papers |

## Documentation

- [Architecture](ARCHITECTURE.md)
- [Data Model](DATA_MODEL.md)
- [API Reference](API.md)
- [Features](FEATURES.md)
- [Deployment](DEPLOYMENT.md)

## License

MIT
