'use client';
import { Header } from '@/components/app/header';
import { useState, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SKILLS } from '@/lib/skills-data';
import { companies } from '@/lib/company-data';
import { LoaderCircle, Youtube, Compass, BookOpen, DollarSign, Briefcase, Map, Search, Building, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

type Video = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  url: string;
};

const GlassmorphismCard = ({ children, className, ...props }: React.ComponentProps<typeof Card>) => (
  <Card
    className={cn(
      "glass-panel border-white/[0.08] rounded-2xl shadow-xl transition-all duration-300",
      className
    )}
    {...props}
  >
    {children}
  </Card>
);

export default function CareerPathwayPage() {
  const [currentTopic, setCurrentTopic] = useState(SKILLS[0].name);
  const [searchTerm, setSearchTerm] = useState(SKILLS[0].name);
  const [isPending, startTransition] = useTransition();
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hiringCompanies = companies.filter(company => 
    company.requiredSkills.some(skill => skill.toLowerCase() === currentTopic.toLowerCase())
  );

  useEffect(() => {
    if (currentTopic) {
      fetchVideos(currentTopic);
    }
  }, [currentTopic]);

  const fetchVideos = (topic: string) => {
    if (!topic.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/youtube-search?topic=${encodeURIComponent(topic)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data.videos || []);
      } catch (err: any) {
        setError(err.message);
        setVideos([]);
      }
    });
  };

  const handleSkillClick = (skillName: string) => {
    setCurrentTopic(skillName);
    setSearchTerm(skillName);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentTopic(searchTerm);
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full overflow-y-auto">
        {/* Header Hero */}
        <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-xl">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary text-xs font-mono uppercase tracking-wider font-semibold w-fit mb-2">
            <Compass className="size-3.5" />
            Curriculum &amp; Hiring Radar
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Career Pathway &amp; Tech Mastery Hub
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Curated engineering roadmaps, industry video masterclasses, and real-time company skill requirements.
          </p>

          {/* Skill Selector Chips & Search Bar */}
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {SKILLS.map((skill) => {
                const isActive = currentTopic.toLowerCase() === skill.name.toLowerCase();
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleSkillClick(skill.name)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-1.5 border",
                      isActive
                        ? "bg-secondary/20 text-secondary border-secondary/50 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                        : "bg-white/[0.03] text-muted-foreground border-white/[0.08] hover:bg-white/[0.06] hover:text-foreground"
                    )}
                  >
                    <skill.icon className={cn("size-3.5", isActive ? "text-secondary" : "text-muted-foreground")} />
                    <span>{skill.name}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <Input 
                type="search"
                placeholder="Search any skill (e.g., 'Kafka', 'System Design')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border-white/[0.08] rounded-xl text-xs h-10 text-foreground placeholder:text-muted-foreground"
              />
              <Button type="submit" disabled={isPending} className="primary-glow-btn rounded-xl text-xs h-10 px-4 font-semibold gap-1.5">
                <Search className="size-3.5" /> Search
              </Button>
            </form>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Video Learning Feeds */}
          <GlassmorphismCard className="lg:col-span-8 p-5 sm:p-6">
            <CardHeader className="p-0 pb-4 border-b border-white/[0.06] mb-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Youtube className="size-4 text-red-500" /> Top Masterclasses for {currentTopic}
                </CardTitle>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-muted-foreground border border-white/[0.08]">
                  YouTube Dev Insights
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isPending ? (
                <div className="flex flex-col justify-center items-center h-64 gap-3 text-muted-foreground">
                  <LoaderCircle className="size-8 animate-spin text-primary" />
                  <span className="text-xs font-mono">Fetching video masterclasses for {currentTopic}...</span>
                </div>
              ) : error ? (
                <div className="text-center p-6 text-xs text-red-400 glass-panel rounded-xl">
                  {error}
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={video.id}
                      className="glass-card-interactive rounded-xl overflow-hidden group block border border-white/[0.06]"
                    >
                      <div className="relative w-full aspect-video bg-black/40">
                        <Image 
                          src={video.thumbnail} 
                          alt={video.title} 
                          fill 
                          unoptimized 
                          className="object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-xs leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-[10px] font-mono text-muted-foreground mt-1.5 flex items-center justify-between">
                          <span>{video.channel}</span>
                          <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 text-muted-foreground text-xs font-mono">
                  No video masterclasses found for "{currentTopic}". Try another skill.
                </div>
              )}
            </CardContent>
          </GlassmorphismCard>
          
          {/* Right Column (4 cols): Who's Hiring + Salary Intelligence */}
          <div className="lg:col-span-4 space-y-4">
            <GlassmorphismCard className="p-5 space-y-4">
              <CardHeader className="p-0 pb-3 border-b border-white/[0.06]">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Building className="size-4 text-primary" /> Verified Hiring Companies
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Companies seeking engineers with <span className="text-secondary font-mono font-medium">{currentTopic}</span> skills.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-2.5">
                {hiringCompanies.length > 0 ? (
                  hiringCompanies.slice(0, 4).map((c) => (
                    <div key={c.name} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-foreground">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground">{c.role}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30">
                        Active
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-white/[0.02] text-xs text-muted-foreground text-center">
                    No active company postings mapped to {currentTopic} currently.
                  </div>
                )}
              </CardContent>
            </GlassmorphismCard>

            <GlassmorphismCard className="p-5 space-y-3">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Sparkles className="size-4 text-secondary" /> Placement Compensation Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-2.5">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <DollarSign className="size-3.5 text-tertiary" /> Typical CTC Range
                  </div>
                  <div className="text-base font-mono font-bold text-tertiary mt-1">
                    ₹8.5L – ₹22.0L PA
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Based on Tier-1 Campus &amp; Off-Campus tech benchmarks.</p>
                </div>
              </CardContent>
            </GlassmorphismCard>
          </div>
        </div>
      </main>
    </>
  );
}
