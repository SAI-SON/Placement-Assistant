# Placement Assistant 🚀

AI-powered career assistance platform built with Next.js 15, Google Gemini AI, and shadcn/ui.

## Features

- 📄 **Resume Analysis** - Get instant AI feedback and scoring on your resume
- 💬 **AI Resume Coach** - Chat with AI for personalized resume improvement tips
- 🎤 **Interview Coach** - Practice interviews with AI-generated questions and feedback
- 📝 **Resume Generator** - Create professional ATS-friendly resumes
- 🎓 **Career Pathway** - Explore learning resources and company insights
- 📰 **Local Job News** - Stay updated with job market news

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Google Gemini AI via Genkit
- **UI**: React, Tailwind CSS, shadcn/ui, Framer Motion
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Google Gemini API Key ([Get it here](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd Placement-Assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy .env.example to .env.local
   cp .env.example .env.local
   ```

4. Add your API keys to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   NEWS_API_KEY=your_news_api_key
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:9002](http://localhost:9002)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run optimize` - Run linting and type checking
- `npm run deploy:test` - Test production build locally

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Recommended**: Deploy to [Vercel](https://vercel.com) for zero-config Server Actions support.

⚠️ **Important**: This app requires server runtime (not static hosting) due to Next.js Server Actions.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── upload-resume/     # Resume analysis
│   ├── ai-coach/          # AI chat coach
│   ├── ai-interview-coach/# Interview practice
│   ├── resume-templates/  # Resume generator
│   ├── career-pathway/    # Learning resources
│   └── job-news/          # Job news feed
├── components/
│   ├── app/               # App-specific components
│   └── ui/                # Reusable UI components (shadcn)
├── ai/
│   ├── genkit.ts          # Genkit AI configuration
│   ├── flows/             # AI flows for features
│   └── ai-feedback-chat.ts# Chat AI logic
└── lib/
    ├── actions.ts         # Server Actions
    └── utils.ts           # Utilities

```

## API Keys Required

1. **Google Gemini API** (Required)
   - Get from: https://aistudio.google.com/app/apikey
   - Free tier: 60 requests/minute

2. **News API** (Optional - for job news)
   - Get from: https://newsapi.org/

3. **YouTube Data API** (Optional - for video suggestions)
   - Get from: https://console.cloud.google.com/

## Rate Limits

- Gemini 1.5 Flash: 60 RPM, 1,500/day (free tier)
- See [docs/API_RATE_LIMITS.md](docs/API_RATE_LIMITS.md) for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run optimize` to check code quality
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Google Gemini AI
>>>>>>> b7e31df (feat: revamp UI with Stitch design spec, optimize rendering performance, and add AI model multi-failover)
