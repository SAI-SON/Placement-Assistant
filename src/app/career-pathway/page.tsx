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
import { LoaderCircle, Youtube, Compass, BookOpen, DollarSign, Briefcase, Map, Search, Building } from 'lucide-react';
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
        "bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl shadow-lg transition-all duration-300 hover:border-white/20 hover:shadow-primary/10 h-full",
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
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentTopic(searchTerm);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="max-w-7xl mx-auto space-y-8"
        >
          <motion.div variants={cardVariants}>
            <div className="text-center">
              <h1 className="flex items-center justify-center gap-3 text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                <Compass /> Career Pathway Hub
              </h1>
              <p className="text-lg text-muted-foreground">Your AI guide to exploring tech careers, learning new skills, and finding opportunities.</p>
            </div>
          </motion.div>
          
          <motion.div variants={cardVariants}>
            <Card className="bg-card/30">
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {SKILLS.map((skill) => (
                            <Button 
                                key={skill.id} 
                                variant={currentTopic === skill.name ? 'default' : 'secondary'}
                                className="rounded-full"
                                onClick={() => handleSkillClick(skill.name)}
                            >
                                <skill.icon className="mr-2 h-4 w-4"/>
                                {skill.name}
                            </Button>
                        ))}
                    </div>
                     <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
                        <Input 
                            type="search"
                            placeholder="Or type any skill... (e.g., 'Golang', 'Cybersecurity')"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-background/50"
                        />
                        <Button type="submit" disabled={isPending}>
                            <Search className="h-4 w-4 mr-2"/> Search
                        </Button>
                    </form>
                </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassmorphismCard className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl"><Youtube className="text-primary"/> Top Learning Videos for {currentTopic}</CardTitle>
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <div className="flex justify-center items-center h-60">
                    <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500">{error}</div>
                ) : videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {videos.map((video) => (
                      <motion.a href={video.url} target="_blank" rel="noopener noreferrer" key={video.id} variants={cardVariants} className="block group">
                        <Card className="h-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-primary/20">
                          <div className="relative w-full aspect-video">
                            <Image src={video.thumbnail} alt={video.title} layout="fill" objectFit="cover" className="group-hover:opacity-90"/>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-semibold text-sm leading-tight line-clamp-2">{video.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                          </CardContent>
                        </Card>
                      </motion.a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground p-10 m-2 bg-muted/20 rounded-lg">
                    <p className="text-xl font-semibold">No videos found for "{currentTopic}".</p>
                    <p>Please check your spelling or try a different search term.</p>
                  </div>
                )}
              </CardContent>
            </GlassmorphismCard>
            
            <div className="flex flex-col gap-6">
                <GlassmorphismCard>
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-xl"><Building className="text-primary"/> Who's Hiring</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 p-4 pt-0">
                          {hiringCompanies.length > 0 ? hiringCompanies.slice(0, 4).map(c => (
                              <div key={c.name} className="p-3 rounded-lg bg-background/50">
                                  <p className="font-bold">{c.name}</p>
                                  <p className="text-sm text-muted-foreground">{c.role}</p>
                              </div>
                          )) : (
                            <p className="text-sm text-muted-foreground text-center p-4">No hiring info for this skill.</p>
                          )}
                    </CardContent>
                </GlassmorphismCard>
                <GlassmorphismCard>
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-xl"><BookOpen className="text-primary"/> Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 pt-0">
                          <Button variant="outline" className="w-full justify-start h-auto flex-col items-start p-3" disabled>
                              <div className="flex items-center font-semibold"><DollarSign className="mr-2 h-4 w-4 text-primary"/> Salary Insights</div>
                              <p className="text-xs text-muted-foreground pl-6">Approx: ₹8-15 LPA (current)</p>
                        </Button>
                          <Button variant="outline" className="w-full justify-start h-auto flex-col items-start p-3" disabled>
                              <div className="flex items-center font-semibold"><Map className="mr-2 h-4 w-4 text-primary"/> Career Roadmap</div>
                              <p className="text-xs text-muted-foreground pl-6">AI-generated path to mastery</p>
                          </Button>
                    </CardContent>
                </GlassmorphismCard>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
