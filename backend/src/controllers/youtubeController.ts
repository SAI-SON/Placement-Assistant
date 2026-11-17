import { Request, Response } from 'express';
import { query } from '../config/db';

export async function searchYouTube(req: Request, res: Response): Promise<void> {
  try {
    const topic = req.query.topic as string;

    if (!topic) {
      res.status(400).json({ error: 'topic query parameter is required' });
      return;
    }

    const cleanTopic = topic.trim();

    // 1. Check PostgreSQL cache first
    const cachedResult = await query(
      `
      SELECT videos, expires_at
      FROM cached_youtube
      WHERE topic = $1 AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
      `,
      [cleanTopic]
    );

    if (cachedResult.rowCount && cachedResult.rowCount > 0) {
      res.json({
        cached: true,
        videos: cachedResult.rows[0].videos,
      });
      return;
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const searchQuery = `${cleanTopic} tutorial full course`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      searchQuery
    )}&type=video&maxResults=6&key=${apiKey}`;

    let videos: any[] = [];

    try {
      const apiResponse = await fetch(url);
      if (apiResponse.ok) {
        const data = (await apiResponse.json()) as any;
        videos = (data.items || []).map((video: any) => ({
          id: video.id?.videoId || String(Math.random()),
          title: video.snippet?.title || `${cleanTopic} Tutorial`,
          channel: video.snippet?.channelTitle || 'Tech Instructor',
          thumbnail:
            video.snippet?.thumbnails?.medium?.url ||
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&q=80',
          url: `https://www.youtube.com/watch?v=${video.id?.videoId}`,
        }));
      } else {
        console.warn('[YouTubeController] YouTube API error:', apiResponse.status);
      }
    } catch (fetchErr) {
      console.warn('[YouTubeController] Failed to reach YouTube API:', fetchErr);
    }

    // Fallback videos if quota exhausted or network error
    if (!videos || videos.length === 0) {
      videos = [
        {
          id: 'fallback-1',
          title: `${cleanTopic} Full Course - Beginner to Advanced Masterclass`,
          channel: 'freeCodeCamp.org',
          thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&q=80',
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTopic + ' course')}`,
        },
        {
          id: 'fallback-2',
          title: `Mastering ${cleanTopic} in 100 Minutes with Hands-on Projects`,
          channel: 'Fireship',
          thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&q=80',
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTopic + ' project tutorial')}`,
        },
      ];
    }

    // Save to PostgreSQL cache for 2 hours
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await query(
      `
      INSERT INTO cached_youtube (topic, videos, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (topic) DO UPDATE
      SET videos = EXCLUDED.videos,
          expires_at = EXCLUDED.expires_at,
          created_at = CURRENT_TIMESTAMP
      `,
      [cleanTopic, JSON.stringify(videos), expiresAt]
    );

    res.json({
      cached: false,
      videos,
    });
  } catch (error: any) {
    console.error('[YouTubeController] Error searching YouTube:', error);
    res.status(500).json({ error: error.message || 'Internal server error searching videos' });
  }
}
