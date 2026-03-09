'use client';

import { Newspaper, Building, MapPin, Search, Calendar, ChevronDown, LoaderCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { statesAndDistricts } from '@/lib/location-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { parseISO, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Button, buttonVariants } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Header } from '@/components/app/header';

type Article = {
  title: string;
  source: { name: string };
  publishedAt: string;
  url: string;
  description: string;
  urlToImage?: string;
};

type GroupedArticles = {
    today: Article[];
    yesterday: Article[];
    thisWeek: Article[];
    older: Article[];
};

const GlassmorphismCard = ({ children, className, ...props }: React.ComponentProps<typeof Card>) => (
    <Card
      className={cn(
        "bg-card/50 backdrop-blur-xl border-white/10 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );

export default function JobNewsPage() {
  const [selectedState, setSelectedState] = useState<string | null>("Tamil Nadu");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>("Madurai");
  const [districts, setDistricts] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (selectedState) {
      setDistricts(statesAndDistricts[selectedState] || []);
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  useEffect(() => {
    // Automatically fetch news on initial load with default values
    fetchNews();
  }, []);

  const fetchNews = () => {
    if (!selectedState || !selectedDistrict) {
      setError("Please select both a state and a district.");
      return;
    }
    setError(null);
    setHasSearched(true);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/news?state=${selectedState}&district=${selectedDistrict}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch news');
        }
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err: any) {
        setError(err.message);
        setArticles([]);
      }
    });
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict(null);
    setArticles([]);
    setHasSearched(false);
  }

  const handleDistrictChange = (district: string) => {
      setSelectedDistrict(district);
  }

  const formatTimeAgo = (dateString: string) => {
    try {
        return `${formatDistanceToNow(parseISO(dateString))} ago`;
    } catch(e) {
        return 'recently';
    }
  };

  const groupedArticles = articles.reduce<GroupedArticles>((acc, article) => {
    try {
        const date = parseISO(article.publishedAt);
        if (isToday(date)) acc.today.push(article);
        else if (isYesterday(date)) acc.yesterday.push(article);
        else if (isThisWeek(date, { weekStartsOn: 1 })) acc.thisWeek.push(article);
        else acc.older.push(article);
    } catch (e) {
        acc.older.push(article);
    }
    return acc;
  }, { today: [], yesterday: [], thisWeek: [], older: [] });

  const NewsCard = ({ article }: { article: Article }) => (
    <GlassmorphismCard>
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-muted/30 p-3 rounded-lg transition-colors">
          {article.urlToImage && (
              <div className="relative w-full h-40">
                  <Image src={article.urlToImage} alt={article.title} fill unoptimized className="object-cover opacity-80 rounded-t-lg"/>
              </div>
          )}
          <CardHeader>
            <CardTitle className="font-semibold text-base text-foreground/90 leading-tight mb-1">{article.title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">{article.source.name} &bull; {formatTimeAgo(article.publishedAt)}</CardDescription>
          </CardHeader>
      </a>
    </GlassmorphismCard>
  );
  
  const ArticleGroup = ({ title, articles }: { title: string; articles: Article[] }) => {
    if (articles.length === 0) return null;
    return (
        <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-4 px-3">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, i) => (
                    <motion.div 
                        key={`${article.url}-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                        <NewsCard article={article} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="sticky top-16 bg-background/80 backdrop-blur-sm z-10 p-4 md:p-6 border-b">
          <div className="max-w-7xl mx-auto">
            <h1 className="flex items-center gap-3 text-2xl font-bold"><Newspaper className="text-primary"/> Local Job News</h1>
            <p className="text-muted-foreground mt-1">Find local news about hiring, careers, and job opportunities in your area.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <Select onValueChange={handleStateChange} value={selectedState || ""}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(statesAndDistricts).sort().map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={handleDistrictChange} value={selectedDistrict || ""} disabled={!selectedState}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                        {districts.sort().map(district => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={fetchNews} disabled={isPending || !selectedDistrict}>
                    {isPending ? <LoaderCircle className="animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Find News
                </Button>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
            {isPending ? (
                <div className="flex justify-center items-center h-60">
                    <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-center text-red-500 p-4 m-2 bg-red-500/10 rounded-lg flex flex-col items-center gap-2">
                    <AlertTriangle className="w-8 h-8"/>
                    <span className="font-semibold text-lg">An Error Occurred</span>
                    <span>{error}</span>
                </div>
            ) : hasSearched && articles.length === 0 ? (
                <div className="text-center text-muted-foreground p-10 m-2 bg-muted/20 rounded-lg">
                    <p className="text-xl font-semibold">No recent job news found.</p>
                    <p>Try expanding your search to another area!</p>
                </div>
            ) : (
                <div className="space-y-10">
                    <ArticleGroup title="Today" articles={groupedArticles.today} />
                    <ArticleGroup title="Yesterday" articles={groupedArticles.yesterday} />
                    <ArticleGroup title="This Week" articles={groupedArticles.thisWeek} />
                    <ArticleGroup title="Older" articles={groupedArticles.older} />
                </div>
            )}
            </div>
        </ScrollArea>
      </main>
    </>
  );
}
