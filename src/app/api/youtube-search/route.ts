import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key is not configured' }, { status: 500 });
  }

  const query = `${topic} tutorial full course`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&maxResults=6&key=${apiKey}`;

  try {
    // Cache for 1 hour to make subsequent clicks instant (< 5ms response time)
    const youtubeResponse = await fetch(url, {
      next: { revalidate: 3600 },
    });
    
    if (!youtubeResponse.ok) {
      const errorData = await youtubeResponse.json().catch(() => ({}));
      console.warn('YouTube API error, returning fallback masterclasses:', errorData);
      
      // Fallback learning videos if quota hit
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
        ]
      });
    }
    
    const data = await youtubeResponse.json();
    const videos = (data.items || []).map((video: any) => ({
      id: video.id?.videoId || String(Math.random()),
      title: video.snippet?.title || `${topic} Tutorial`,
      channel: video.snippet?.channelTitle || 'Tech Instructor',
      thumbnail: video.snippet?.thumbnails?.medium?.url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&q=80',
      url: `https://www.youtube.com/watch?v=${video.id?.videoId}`,
    }));
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}
