# Deploy to Railway

## One-Click Deploy

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo
4. Railway will auto-detect `docker-compose.railway.yml`
5. Add these environment variables in Railway dashboard:

```
POSTGRES_DB=aios
POSTGRES_USER=aios_user
POSTGRES_PASSWORD=<generate-a-strong-password>
ENCRYPTION_KEY=<32-byte-hex-key>
JWT_SECRET=<random-secret>
OPENROUTER_API_KEY=sk-or-your-key
GEMINI_API_KEY=your-key
DEFAULT_MODEL=llama3:70b
FALLBACK_MODEL=openrouter/anthropic/claude-3.5-sonnet
```

6. Deploy — Railway gives you a URL like `your-project.up.railway.app`

## After Deploy

Railway auto-provisions PostgreSQL and Redis. Update env vars:
- `DATABASE_URL` → Railway's auto-generated Postgres URL
- `REDIS_URL` → Railway's auto-generated Redis URL
- `NEXT_PUBLIC_API_URL` → `https://your-project.up.railway.app` (api service)
- `NEXT_PUBLIC_WS_URL` → `wss://your-project.up.railway.app` (api service)
- `ORCHESTRATOR_URL` → `https://your-project.up.railway.app` (orchestrator service)
