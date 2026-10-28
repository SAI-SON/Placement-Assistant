'use client';
import { Header } from '@/components/app/header';
import { useState, useEffect, useTransition, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

import { useToast } from "@/hooks/use-toast";
import { analyzeResumeAction, getLearningSuggestionsAction } from '@/lib/actions';
import type { ResumeScoringAndFeedbackOutput } from '@/ai/flows/resume-scoring-and-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LoaderCircle, UploadCloud, CheckCircle2, Sparkles, Youtube, Lightbulb, ExternalLink, FileCheck, BarChart2, Search, ThumbsUp, AlertTriangle, ArrowRight } from 'lucide-react';
import ScoreChart from '@/components/app/score-chart';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type AnalysisState = ResumeScoringAndFeedbackOutput;

type LearningState = {
  videoSuggestions: string[];
};

const GlassmorphismCard = ({ children, className, ...props }: React.ComponentProps<typeof Card>) => (
  <Card
    className={cn(
      "glass-panel border-white/[0.08] rounded-2xl shadow-xl transition-all duration-300 hover:border-white/20",
      className
    )}
    {...props}
  >
    {children}
  </Card>
);

export default function UploadResumePage() {
  const [isClient, setIsClient] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [learningSuggestions, setLearningSuggestions] = useState<LearningState | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        toast({ title: 'Invalid File Type', description: 'Please upload a PDF or DOCX file.', variant: 'destructive' });
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        toast({ title: 'File Too Large', description: 'Please upload a file smaller than 4MB.', variant: 'destructive' });
        return;
      }
      setResumeFile(file);
      setAnalysis(null);
      setLearningSuggestions(null);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const handleAnalyze = () => {
    if (!resumeFile) return;

    startTransition(async () => {
      setAnalysis(null);
      setLearningSuggestions(null);

      try {
        const dataUri = await toDataURI(resumeFile);
        const analysisResult = await analyzeResumeAction({ resumeDataUri: dataUri });
        setAnalysis(analysisResult);

        if (analysisResult.score < 70 && analysisResult.improvements.length > 0) {
          const suggestionsResult = await getLearningSuggestionsAction({
            resumeScore: analysisResult.score,
            areasToImprove: analysisResult.improvements.map(i => i.title).join(', '),
          });
          setLearningSuggestions(suggestionsResult);
        }
        toast({ title: 'Analysis Complete!', description: 'Your resume has been successfully evaluated.' });
      } catch (e: any) {
        toast({ title: 'An Error Occurred', description: e.message, variant: 'destructive' });
      }
    });
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const handleReset = () => {
    setResumeFile(null);
    setAnalysis(null);
    setLearningSuggestions(null);
  };
  
  const getImprovementStyling = (title: string): { badge: React.ReactElement, cardClass: string } => {
    const lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes('critical')) {
      return {
        badge: <Badge variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] uppercase font-mono">Critical</Badge>,
        cardClass: "bg-red-950/20 border-red-500/30"
      };
    }
    if (lowerCaseTitle.includes('high impact')) {
      return {
        badge: <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] uppercase font-mono">High Impact</Badge>,
        cardClass: "bg-amber-950/20 border-amber-500/30"
      };
    }
    return {
      badge: <Badge className="bg-secondary/20 text-secondary border border-secondary/40 text-[10px] uppercase font-mono">Suggestion</Badge>,
      cardClass: "bg-cyan-950/20 border-secondary/30"
    };
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {analysis ? (
            // Analysis Results View
            <AnimatePresence>
              <motion.div 
                className="flex flex-col gap-6"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                }}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {/* Score & Summary Banner */}
                <motion.div variants={cardVariants}>
                  <GlassmorphismCard>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2.5 text-xl font-bold text-foreground">
                        <Sparkles className="size-5 text-primary" />
                        AI Resume Intelligence Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center gap-8 pt-4">
                      <div className="shrink-0">
                        <ScoreChart score={analysis.score} />
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-mono font-semibold">
                          ATS Grade: {analysis.score >= 80 ? 'Tier 1 Prime' : analysis.score >= 60 ? 'Competitive' : 'Needs Optimization'}
                        </div>
                        <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-sans">
                          {analysis.summary}
                        </p>
                      </div>
                    </CardContent>
                  </GlassmorphismCard>
                </motion.div>
                
                {/* Split Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={cardVariants}>
                    <GlassmorphismCard className="h-full border-l-4 border-l-tertiary">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
                          <ThumbsUp className="size-4 text-tertiary" /> What Stood Out
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90">
                          {analysis.whatWeLoved.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="font-bold text-tertiary shrink-0 mt-0.5">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </GlassmorphismCard>
                  </motion.div>

                  <motion.div variants={cardVariants}>
                    <GlassmorphismCard className="h-full border-l-4 border-l-amber-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
                          <AlertTriangle className="size-4 text-amber-400" /> Improvement Opportunities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90">
                          {analysis.whatsHoldingYouBack.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="font-bold text-amber-400 shrink-0 mt-0.5">!</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </GlassmorphismCard>
                  </motion.div>
                </div>

                {/* Actionable Checklist */}
                <motion.div variants={cardVariants}>
                  <GlassmorphismCard>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                        <Lightbulb className="size-5 text-primary" /> Actionable Fixes Checklist
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Prioritized adjustments to maximize ATS filter bypass and recruiter interest.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.improvements.map((item, index) => {
                        const { badge, cardClass } = getImprovementStyling(item.title);
                        return (
                          <div key={index} className={cn("p-4 border rounded-xl", cardClass)}>
                            <div className="flex items-center gap-2.5 mb-2.5">
                              {badge}
                              <span className="font-semibold text-sm text-foreground">{item.title.replace(/ \(.+\)/, '')}</span>
                            </div>
                            <div className="space-y-2.5 text-xs border-l-2 border-white/10 pl-3 ml-2">
                              <p><strong className="text-muted-foreground">Issue:</strong> {item.whatsWrong}</p>
                              <div>
                                <p className="font-medium text-muted-foreground mb-1">Recommended Rewrite:</p>
                                <p className="text-foreground/95 whitespace-pre-wrap font-mono bg-black/40 border border-white/[0.06] p-2.5 rounded-lg text-xs leading-relaxed">
                                  {item.howToFix}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </GlassmorphismCard>
                </motion.div>

                {learningSuggestions && learningSuggestions.videoSuggestions.length > 0 && (
                  <motion.div variants={cardVariants}>
                    <GlassmorphismCard>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
                          <Youtube className="size-4 text-red-500" /> Recommended Learning Modules
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Targeted masterclasses to address identified skill gaps.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2.5 text-xs">
                          {learningSuggestions.videoSuggestions.map((video, index) => (
                            <li key={index} className="flex items-center gap-2.5">
                              <Youtube className="size-4 text-red-500 shrink-0" />
                              <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                              >
                                {video} <ExternalLink className="size-3 text-muted-foreground" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </GlassmorphismCard>
                  </motion.div>
                )}

                <motion.div variants={cardVariants} className="flex justify-center pt-2">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="rounded-xl px-6 py-2.5 h-11 text-xs font-mono font-medium border-white/15 hover:bg-white/[0.08]"
                  >
                    <UploadCloud className="mr-2 size-4" />
                    Scan Another Resume Version
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          ) : (
            // Initial Upload View
            <div id="upload-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <motion.div variants={cardVariants} initial="hidden" animate="visible" className="lg:col-span-7">
                <GlassmorphismCard>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2.5 text-xl font-bold text-foreground">
                      <UploadCloud className="size-5 text-primary" /> Upload Resume for Instant Audit
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Upload your PDF or DOCX file (max 4MB) to receive deep ATS scoring and recruiter feedback.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      {...getRootProps()} 
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300",
                        isDragActive 
                          ? "bg-primary/20 border-primary shadow-[0_0_24px_rgba(139,92,246,0.3)]" 
                          : "border-white/[0.1] hover:bg-white/[0.03] hover:border-white/[0.25]"
                      )}
                    >
                      <input {...getInputProps()} />
                      {resumeFile ? (
                        <div className="flex flex-col items-center gap-2 text-primary">
                          <CheckCircle2 className="size-12 text-tertiary" />
                          <span className="font-semibold text-foreground text-sm truncate max-w-xs">{resumeFile.name}</span>
                          <span className="text-xs font-mono text-tertiary">Ready for analysis! Click button below.</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <div className="size-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                            <UploadCloud className="size-7 text-primary" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground text-sm block">
                              {isDragActive ? 'Drop your resume file here...' : 'Click to upload or drag & drop'}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5 block">
                              PDF or DOCX (up to 4MB)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={!resumeFile || isPending} 
                      className="w-full primary-glow-btn rounded-xl text-sm font-semibold h-12 gap-2"
                    >
                      {isPending ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="size-4" />
                          <span>Run AI ATS Scoring</span>
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </GlassmorphismCard>
              </motion.div>
              
              {/* Feature Highlights on right side */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-mono uppercase font-bold tracking-wider mb-2">
                    ⚡ 30-Second Turnaround
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Benchmark Against Top Tier Recruiters
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    Our AI models simulate exact ATS parsing algorithms used by FAANG, Tier 1 tech startups, and campus recruitment panels.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="glass-card-interactive p-4 rounded-xl flex items-start gap-3.5">
                    <div className="p-2 bg-primary/20 border border-primary/40 rounded-xl shrink-0">
                      <Search className="text-primary size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">ATS Keyword Parsing</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Identifies omitted frameworks, algorithms, and key impact verbs.</p>
                    </div>
                  </div>

                  <div className="glass-card-interactive p-4 rounded-xl flex items-start gap-3.5">
                    <div className="p-2 bg-secondary/20 border border-secondary/40 rounded-xl shrink-0">
                      <BarChart2 className="text-secondary size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">Quantified Impact Metrics</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Transforms passive bullet points into measurable engineering achievements.</p>
                    </div>
                  </div>

                  <div className="glass-card-interactive p-4 rounded-xl flex items-start gap-3.5">
                    <div className="p-2 bg-tertiary/20 border border-tertiary/40 rounded-xl shrink-0">
                      <FileCheck className="text-tertiary size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">Layout & Readability</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Validates single-column parsing, margins, and recruiter eye-path harmony.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
