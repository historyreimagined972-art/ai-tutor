# Deployment

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- OpenRouter API key
- Vercel account (for frontend)
- Railway/Render account (for backend)

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-tutor
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
OPENROUTER_API_KEY=sk-or-...
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=https://your-backend.railway.app/api/v1
```

## Deployment Steps

### 1. Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set JWT_SECRET="..."
railway variables set JWT_REFRESH_SECRET="..."
railway variables set OPENROUTER_API_KEY="sk-or-..."

# Deploy
railway up
```

### 2. Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Initialize project
cd frontend
vercel

# Deploy
vercel --prod
```

### 3. MongoDB Atlas

1. Create free cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string
5. Update MONGODB_URI in backend environment

### 4. OpenRouter

1. Sign up at openrouter.ai
2. Get API key from dashboard
3. Add to backend environment

## Production Checklist

- [ ] Set strong JWT secrets (64+ random characters)
- [ ] Configure CORS allowed origins
- [ ] Enable MongoDB Atlas encryption
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limiting
- [ ] Test all API endpoints
- [ ] Verify AI integration works
- [ ] Test PDF generation
- [ ] Check mobile responsiveness

## Monitoring

- Backend health: GET /api/v1/health
- API health: GET /api/v1/health/detailed
