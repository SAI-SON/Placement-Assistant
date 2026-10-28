'use client';

import { Newspaper, Building, MapPin, Search, Calendar, ChevronDown, LoaderCircle, AlertTriangle, ExternalLink, Globe } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { statesAndDistricts } from '@/lib/location-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { parseISO, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
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
      "glass-card-interactive border-white/[0.08] shadow-xl rounded-2xl overflow-hidden",
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
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
  };

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
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
        {article.urlToImage && (
          <div className="relative w-full h-44 overflow-hidden bg-black/40">
            <Image 
              src={article.urlToImage} 
              alt={article.title} 
              fill 
              unoptimized 
              className="object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
          </div>
        )}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-2">
            <span className="text-secondary font-medium flex items-center gap-1">
              <Globe className="size-3" />
              {article.source.name}
            </span>
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
          <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
            {article.title}
          </h4>
          {article.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {article.description}
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-secondary font-medium">
            <span>Read Full Dispatch</span>
            <ExternalLink className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </a>
    </GlassmorphismCard>
  );
  
  const ArticleGroup = ({ title, articles }: { title: string; articles: Article[] }) => {
    if (articles.length === 0) return null;
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="size-2 rounded-full bg-secondary" />
          <h3 className="text-base font-bold text-foreground font-sans tracking-tight">{title}</h3>
          <span className="text-[11px] font-mono text-muted-foreground ml-1">({articles.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article, i) => (
            <motion.div 
              key={`${article.url}-${i}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <NewsCard article={article} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full overflow-y-auto">
        {/* Search Header Panel */}
        <section className="glass-panel rounded-2xl p-6 border border-white/[0.08] shadow-xl">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-mono uppercase tracking-wider font-semibold w-fit mb-2">
            <Newspaper className="size-3.5" />
            Regional Employment Radar
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Local Placement &amp; Tech Job News
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Live telemetry tracking campus recruitments, corporate drives, and tech industry job expansion across Indian states and districts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-5">
            <div className="sm:col-span-5">
              <Select onValueChange={handleStateChange} value={selectedState || ""}>
                <SelectTrigger className="bg-black/40 border-white/[0.08] rounded-xl text-xs h-11">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-white/10 text-xs">
                  {Object.keys(statesAndDistricts).sort().map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-4">
              <Select onValueChange={handleDistrictChange} value={selectedDistrict || ""} disabled={!selectedState}>
                <SelectTrigger className="bg-black/40 border-white/[0.08] rounded-xl text-xs h-11">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-white/10 text-xs">
                  {districts.sort().map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Button 
                onClick={fetchNews} 
                disabled={isPending || !selectedDistrict}
                className="w-full primary-glow-btn rounded-xl text-xs font-semibold h-11 gap-2"
              >
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
                Scan Feed
              </Button>
            </div>
          </div>
        </section>

        {/* Content Stream */}
        <section className="flex-1">
          {isPending ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3 text-muted-foreground">
              <LoaderCircle className="size-8 animate-spin text-primary" />
              <span className="text-xs font-mono">Aggregating live regional employment feeds...</span>
            </div>
          ) : error ? (
            <div className="text-center p-8 glass-panel border-red-500/30 rounded-2xl flex flex-col items-center gap-2">
              <AlertTriangle className="size-8 text-red-400" />
              <span className="font-bold text-sm text-foreground">Failed to Load Feed</span>
              <span className="text-xs text-muted-foreground">{error}</span>
            </div>
          ) : hasSearched && articles.length === 0 ? (
            <div className="text-center p-12 glass-panel rounded-2xl">
              <Newspaper className="size-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-base font-semibold text-foreground">No recent job announcements found</p>
              <p className="text-xs text-muted-foreground mt-1">Try querying a neighboring district or metro zone.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <ArticleGroup title="Today's Dispatches" articles={groupedArticles.today} />
              <ArticleGroup title="Yesterday" articles={groupedArticles.yesterday} />
              <ArticleGroup title="This Past Week" articles={groupedArticles.thisWeek} />
              <ArticleGroup title="Earlier Highlights" articles={groupedArticles.older} />
            </div>
          )}
        </section>
      </main>
    </>
  );
}
