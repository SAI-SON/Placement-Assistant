# Placement Assistant — Frontend

Next.js 15 (App Router) frontend for the Placement Assistant platform.

## Stack

- **Framework**: Next.js 15 + React 18
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **Animations**: Framer Motion
- **AI (fallback)**: Genkit + Google Generative AI
- **Port**: `9002`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in your real values
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Public URL of the Express backend (used in browser) |
| `BACKEND_URL` | Server-side URL of the Express backend (used in Server Actions / API routes) |
| `GEMINI_API_KEY` | Google AI Studio key (Gemini 2.0 Flash — fallback when backend is down) |
| `NEWS_API_KEY` | NewsAPI key (fallback) |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key (fallback) |

### 3. Run dev server

```bash
npm run dev        # starts on http://localhost:9002
```

Or from the project root:
```bash
npm run dev        # starts both frontend and backend concurrently
```

## Pages

| Route | Description |
|---|---|
| `/` | Landing / Dashboard |
| `/upload-resume` | AI Resume Scanner |
| `/ai-coach` | AI Career Coach (chat) |
| `/ai-interview-coach` | AI Interview Coach |
| `/resume-templates` | Resume Builder |
| `/career-pathway` | Career Pathway Explorer |
| `/job-news` | Local Placement News |

## Architecture

```
src/
├── app/               # Next.js App Router pages + API routes
│   ├── api/
│   │   ├── news/      # Proxies → backend /api/news
│   │   └── youtube-search/  # Proxies → backend /api/youtube
│   ├── layout.tsx
│   └── [pages]/
├── components/        # Shared UI components
│   ├── app/           # Feature-specific components
│   └── ui/            # shadcn/ui primitives
├── hooks/             # Custom React hooks
├── lib/
│   ├── actions.ts     # Server Actions (call backend, fallback to Genkit)
│   └── utils.ts
└── ai/                # Genkit fallback flows (used when backend is unavailable)
```

## Deployment (Vercel — recommended)

1. Push `frontend/` as root of a new Git repo **or** use Vercel monorepo support with root directory set to `frontend/`
2. Set environment variables in Vercel dashboard (from `.env.example`)
3. Framework preset: **Next.js** — Vercel auto-detects

## Deployment (Netlify)

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Use the included `netlify.toml` for plugin config

## Scripts

```bash
npm run dev        # Next.js dev server on port 9002
npm run build      # Production build
npm run start      # Serve production build
npm run typecheck  # TypeScript type check
npm run lint       # ESLint
```
