# Deployment Guide for Placement Assistant

## ⚠️ Important: Server Actions Requirement

This application **requires a server runtime** because it uses:
- Next.js Server Actions (`'use server'`)
- Google Genkit AI flows
- Server-side API calls

**Static hosting will NOT work.**

---

## 🚀 Recommended Deployment: Vercel (Easiest)

Vercel is built for Next.js and has zero-config support for Server Actions.

### Steps:

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add Environment Variables** in Vercel Dashboard:
   - `GEMINI_API_KEY`
   - `GOOGLE_GENAI_API_KEY`
   - `NEWS_API_KEY`
   - `YOUTUBE_API_KEY`

4. **Done!** Vercel automatically handles:
   - Server Actions
   - Edge Functions
   - Serverless Functions
   - Automatic scaling

**Deployment URL**: https://vercel.com/

---

## 🔶 Alternative: Netlify (Requires Configuration)

Netlify supports Server Actions through `@netlify/plugin-nextjs`.

### Prerequisites:

1. **Install Netlify Plugin**:
   ```bash
   npm install -D @netlify/plugin-nextjs
   ```

2. **Configuration**: Already created `netlify.toml`

3. **Deploy via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

4. **Add Environment Variables** in Netlify Dashboard:
   - Go to: Site Settings → Environment Variables
   - Add all API keys from `.env.local`

### ⚠️ Netlify Limitations:

- **Function timeout**: 10 seconds (free tier), 26 seconds (paid)
  - AI operations may timeout on free tier
- **Cold starts**: Slower first request
- **Bundle size**: May have issues with Genkit dependencies

---

## 🐳 Alternative: Docker + Cloud Run

For production with full control:

### Dockerfile:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Deploy to Google Cloud Run:

```bash
gcloud run deploy placement-assistant \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Benefits**:
- No timeout limitations
- Better for AI workloads
- Auto-scaling
- Pay per use

---

## 📋 Pre-Deployment Checklist

- [ ] All API keys in environment variables (not in code)
- [ ] `.env.local` is in `.gitignore` (already done ✓)
- [ ] Run `npm run build` locally to test
- [ ] Test with `npm run start` (production mode)
- [ ] Verify all Server Actions work
- [ ] Check API rate limits for production usage

---

## 🔧 Troubleshooting

### Error: "Server Action not found"

**Cause**: Server Actions aren't deploying correctly.

**Fix**:
1. Ensure `netlify.toml` or `vercel.json` is configured
2. Verify build output includes server functions
3. Check deployment logs for errors

### Error: "Function timeout"

**Cause**: AI operations taking too long.

**Fix**:
1. Upgrade to paid tier for longer timeouts
2. Use Vercel (no timeout on pro plan)
3. Optimize AI prompts to be faster
4. Use streaming responses

### Error: "Module not found"

**Cause**: Dependencies not bundled correctly.

**Fix**:
1. Check `serverExternalPackages` in `next.config.ts`
2. Ensure all dependencies are in `package.json`
3. Clear build cache and rebuild

---

## 📊 Performance Optimization for Production

1. **Enable caching**:
   - Cache API responses
   - Use React Server Components cache
   - Implement SWR for client data

2. **Optimize bundle size**:
   ```bash
   npm run build:analyze
   ```

3. **Monitor API usage**:
   - Set up tracking for Gemini API calls
   - Monitor rate limits
   - Implement request queuing

4. **Add error tracking**:
   - Sentry, LogRocket, or similar
   - Monitor server action failures
   - Track API errors

---

## 🎯 Recommendation

**For this project, use Vercel** because:
✅ Zero-config Server Actions support  
✅ Built for Next.js  
✅ Generous free tier  
✅ No timeout issues  
✅ Automatic edge caching  
✅ Built-in analytics  

Netlify will work but requires more configuration and has stricter limitations for AI workloads.

---

**Need Help?** Check:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Next.js Plugin](https://docs.netlify.com/integrations/frameworks/next-js/)
