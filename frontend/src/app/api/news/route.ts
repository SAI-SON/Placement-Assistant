import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const district = searchParams.get('district');

  if (!state || !district) {
    return NextResponse.json({ error: 'State and district are required' }, { status: 400 });
  }

  try {
    // 1. Fetch from Express + PostgreSQL Backend
    const backendRes = await fetch(
      `${BACKEND_URL}/api/news?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`,
      {
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('[Frontend News API] Backend unreachable, using fallback news generator:', err);
  }

  // Graceful fallback if backend is offline
  return NextResponse.json({
    articles: [
      {
        title: `Campus Recruitment Drive Announced for Software Engineers in ${district}, ${state}`,
        source: { name: 'Placement Cell Gazette' },
        publishedAt: new Date().toISOString(),
        url: 'https://news.google.com/search?q=campus+recruitment+hiring',
        description: `Leading tech enterprises and regional engineering hubs have kicked off recruitment drives targeting Full-Stack, Cloud, and AI fresher roles across ${district}.`,
      },
      {
        title: `IT Services and Startup Hubs Accelerate Fresh Graduate Hiring in ${state}`,
        source: { name: 'Tech Career Pulse' },
        publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        url: 'https://news.google.com/search?q=tech+hiring+freshers',
        description: `Quarterly hiring reports indicate high demand for modern web development, DevOps, and backend engineering capabilities.`,
      },
    ],
  });
}
