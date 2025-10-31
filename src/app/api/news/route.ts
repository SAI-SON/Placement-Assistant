import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const district = searchParams.get('district');

  if (!state || !district) {
    return NextResponse.json({ error: 'State and district are required' }, { status: 400 });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'News API key is not configured' }, { status: 500 });
  }

  const query = `("jobs" OR "hiring" OR "career") AND "${district}" AND "${state}"`;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}&sortBy=publishedAt&pageSize=20`;

  try {
    const newsResponse = await fetch(url);
    if (!newsResponse.ok) {
      const errorData = await newsResponse.json();
      console.error('News API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch news', details: errorData }, { status: newsResponse.status });
    }
    const data = await newsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}
