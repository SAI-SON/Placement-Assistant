# 🚀 Placement Assistant - Backend API

Production-ready Node.js, Express, and PostgreSQL backend powering AI career workflows, ATS diagnostics, mock interview evaluations, and telemetry caching.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v20+) with TypeScript
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 18 with connection pooling (`pg`)
- **AI Models**: Google Gemini (`gemini-2.5-flash`, `gemini-1.5-flash` with multi-model failover)
- **External Integrations**: NewsAPI (Regional Tech Radar), YouTube Data API v3

---

## 📁 Architecture & File Structure

```
backend/
├── .env.example              # Sample environment template
├── .env                      # Local environment variables
├── .gitignore                # Ignored paths (node_modules, dist, .env)
├── package.json              # Express dependencies and scripts
├── tsconfig.json             # TypeScript compiler options
├── README.md                 # This documentation file
└── src/
    ├── config/
    │   └── db.ts             # PostgreSQL pool & auto-DDL schema initialization
    ├── controllers/          # Endpoint request & response handlers
    │   ├── coachController.ts       # AI mentor chat & history
    │   ├── healthController.ts      # Health check & DB ping
    │   ├── interviewController.ts   # 5-question plan & STAR rubric evaluation
    │   ├── learningController.ts    # YouTube learning suggestions
    │   ├── newsController.ts        # Cached tech hiring news
    │   ├── resumeController.ts      # ATS analysis & resume generator
    │   └── youtubeController.ts     # Cached YouTube tutorial search
    ├── middlewares/
    │   ├── errorHandler.ts   # Centralized JSON error response handler
    │   └── logger.ts         # High-resolution request duration logger
    ├── models/
    │   └── schema.sql        # Reference PostgreSQL DDL schemas
    ├── routes/               # Express routing layer
    │   ├── coachRoutes.ts
    │   ├── healthRoutes.ts
    │   ├── index.ts          # Central router mounting all /api/* routes
    │   ├── interviewRoutes.ts
    │   ├── learningRoutes.ts
    │   ├── newsRoutes.ts
    │   ├── resumeRoutes.ts
    │   └── youtubeRoutes.ts
    ├── services/
    │   └── geminiService.ts  # Gemini AI prompts, failover & multimodal analysis
    ├── types/
    │   ├── api.ts            # Request & response contracts
    │   └── database.ts       # PostgreSQL table entity interfaces
    └── server.ts             # Express server entry point, CORS & startup
```

---

## 🗄️ Database Tables (Auto-Initialized in PostgreSQL)

When the server starts, it automatically creates and verifies all 8 tables:

1. `resume_analyses` — Parsed resumes, ATS score (0-100), feedback & improvement checklists.
2. `learning_suggestions` — Personalized video suggestions based on resume weak spots.
3. `interview_sessions` — Generated 5-question interview sessions.
4. `interview_evaluations` — STAR-method answer evaluation, scores, and coaching tips.
5. `chat_messages` — AI Career & Placement Coach conversation history.
6. `saved_resumes` — Candidate profile data, generated text, and markdown resumes.
7. `cached_news` — Regional hiring news cached for 30 minutes.
8. `cached_youtube` — Tutorial searches cached for 2 hours.

---

## 🚦 Available API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status & PostgreSQL ping latency |
| `POST` | `/api/resume/analyze` | ATS resume scoring & feedback via Gemini AI |
| `GET` | `/api/resume/history` | Fetches candidate resume scan history |
| `POST` | `/api/resume/generate` | Generates ATS resume and saves to PostgreSQL |
| `GET` | `/api/resume/saved` | Retrieves all saved generated resumes |
| `POST` | `/api/interview/generate-questions` | Generates 5 tailored interview questions |
| `POST` | `/api/interview/evaluate-answer` | Evaluates answer using the STAR rubric |
| `GET` | `/api/interview/sessions` | Lists candidate interview sessions |
| `POST` | `/api/coach/chat` | AI Career Coach interactive mentorship chat |
| `GET` | `/api/coach/history` | Retrieves conversation history |
| `POST` | `/api/learning/suggestions` | Generates targeted video learning topics |
| `GET` | `/api/news` | Job news by `state` and `district` (cached in DB) |
| `GET` | `/api/youtube` | YouTube tutorial search by `topic` (cached in DB) |

---

## ⚡ Running the Backend

```bash
# Development mode with hot-reloading:
npm run dev

# Production build:
npm run build

# Start production server:
npm start
```
