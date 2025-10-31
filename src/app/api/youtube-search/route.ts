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

  const query = `${topic} tutorial`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&maxResults=10&key=${apiKey}`;

  try {
    const youtubeResponse = await fetch(url);
    if (!youtubeResponse.ok) {
      const errorData = await youtubeResponse.json();
      console.error('YouTube API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch videos', details: errorData }, { status: youtubeResponse.status });
    }
    const data = await youtubeResponse.json();
    const videos = data.items.map((video: any) => ({
        id: video.id.videoId,
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        thumbnail: video.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
    }));
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}
