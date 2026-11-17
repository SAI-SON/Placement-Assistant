import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  }

  try {
    // 1. Fetch from Express + PostgreSQL Backend
    const backendRes = await fetch(
      `${BACKEND_URL}/api/youtube?topic=${encodeURIComponent(topic)}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('[Frontend YouTube API] Backend unreachable, using fallback videos:', err);
  }

  // Graceful fallback if backend is offline
  return NextResponse.json({
    videos: [
      {
        id: 'fallback-1',
        title: `${topic} Full Course - Beginner to Advanced Masterclass`,
        channel: 'freeCodeCamp.org',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&q=80',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' course')}`,
      },
      {
        id: 'fallback-2',
        title: `Mastering ${topic} in 100 Minutes with Hands-on Projects`,
        channel: 'Fireship',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&q=80',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' project tutorial')}`,
      },
    ],
  });
}
