# API Rate Limits Guide

## Google Gemini API (Free Tier)

The application now uses **Gemini 1.5 Flash** which has better rate limits:

| Model | Requests Per Minute (RPM) | Daily Limit |
|-------|--------------------------|-------------|
| gemini-1.5-flash | 60 RPM | 1,500/day |
| gemini-1.5-pro | 10 RPM | 50/day |

### If You Hit Rate Limits

**Error Message:**
```
Too many requests. Please wait 30 seconds and try again.
```

**Solutions:**

1. **Wait 30-60 seconds** between requests
2. **Upgrade to paid tier** at [Google AI Studio](https://aistudio.google.com/)
3. **Use fewer features simultaneously** (don't spam the analyze button)

### Upgrade Options

Free tier is great for development, but for production:

- **Pay-as-you-go**: $0.00015/request for flash model
- Much higher limits (up to 1000+ RPM)
- Visit: https://ai.google.dev/pricing

## Other API Limits

### News API (Free Tier)
- 100 requests/day
- Upgrade at: https://newsapi.org/pricing

### YouTube Data API (Free Tier)  
- 10,000 quota units/day
- Each search = ~100 units
- Upgrade at: https://console.cloud.google.com/

## Best Practices

1. ✅ **Debounce user actions** - Don't allow rapid clicking
2. ✅ **Cache responses** - Store results when possible
3. ✅ **Show loading states** - User knows something is happening
4. ✅ **Handle errors gracefully** - Display user-friendly messages
5. ✅ **Monitor usage** - Check quotas at https://ai.dev/rate-limit

## Error Messages Explained

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 429 | Too Many Requests | Wait 30-60 seconds |
| 403 | Forbidden/API Key Issue | Check API key in .env.local |
| 401 | Unauthorized | Verify API key is correct |
| 400 | Bad Request | Check input format |

---

**Updated:** March 9, 2026
