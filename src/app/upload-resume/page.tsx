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
import { LoaderCircle, UploadCloud, CheckCircle2, Sparkles, Youtube, Lightbulb, ExternalLink, FileCheck, BarChart2, Search, ThumbsUp, AlertTriangle } from 'lucide-react';
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
        "bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl shadow-lg transition-all duration-300 hover:border-white/20 hover:shadow-primary/10",
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
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for GenAI
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
            badge: <Badge variant="critical">Critical</Badge>,
            cardClass: "bg-red-900/20 border-red-500/30"
        }
    }
    if (lowerCaseTitle.includes('high impact')) {
        return {
            badge: <Badge variant="warning">High Impact</Badge>,
            cardClass: "bg-yellow-900/20 border-yellow-500/30"
        }
    }
    return {
        badge: <Badge variant="success">Suggestion</Badge>,
        cardClass: "bg-green-900/20 border-green-500/30"
    }
  }


  return (
    <>
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {analysis ? (
            // Analysis Results View
            <AnimatePresence>
              <motion.div 
                  className="flex flex-col gap-8"
                  variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
              >
                  <motion.div variants={cardVariants}>
                      <GlassmorphismCard>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-2xl"><Sparkles className="text-primary"/> Here's Your Resume Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col md:flex-row items-center gap-8">
                              <div className="flex-shrink-0">
                                  <ScoreChart score={analysis.score} />
                              </div>
                              <div className="text-lg text-foreground/90 space-y-4">
                                  <p>{analysis.summary}</p>
                              </div>
                          </CardContent>
                      </GlassmorphismCard>
                  </motion.div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <motion.div variants={cardVariants}>
                          <GlassmorphismCard className="h-full">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-3 text-xl"><ThumbsUp className="text-green-400"/> What We Loved</CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <ul className="space-y-3 list-disc list-inside text-foreground/90">
                                      {analysis.whatWeLoved.map((item, index) => (
                                          <li key={index}><span className="font-semibold text-green-300">✓</span> {item}</li>
                                      ))}
                                  </ul>
                              </CardContent>
                          </GlassmorphismCard>
                      </motion.div>
                      <motion.div variants={cardVariants}>
                          <GlassmorphismCard className="h-full">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-3 text-xl"><AlertTriangle className="text-yellow-400"/> What's Holding You Back</CardTitle>
                              </CardHeader>
                              <CardContent>
                                   <ul className="space-y-3 list-disc list-inside text-foreground/90">
                                      {analysis.whatsHoldingYouBack.map((item, index) => (
                                          <li key={index}><span className="font-semibold text-yellow-300">!</span> {item}</li>
                                      ))}
                                  </ul>
                              </CardContent>
                          </GlassmorphismCard>
                      </motion.div>
                  </div>

                  <motion.div variants={cardVariants}>
                      <GlassmorphismCard>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-2xl"><Lightbulb className="text-primary"/> Your Quick-Win Checklist</CardTitle>
                              <CardDescription>Here are the top things you can fix right now to make your resume even stronger.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              {analysis.improvements.map((item, index) => {
                                  const { badge, cardClass } = getImprovementStyling(item.title);
                                  return (
                                    <div key={index} className={cn("p-4 border rounded-lg", cardClass)}>
                                        <h3 className="font-semibold text-lg flex items-center gap-3 mb-3">
                                            {badge}
                                            <span>{item.title.replace(/ \(.+\)/, '')}</span>
                                        </h3>
                                        <div className="pl-4 space-y-3 text-sm border-l-2 border-border/50 ml-4">
                                            <p><strong className="text-muted-foreground">What's Wrong:</strong> {item.whatsWrong}</p>
                                            <div>
                                                <p className="font-medium text-muted-foreground">How to Fix:</p>
                                                <p className="text-foreground/90 whitespace-pre-wrap font-mono bg-muted/30 p-3 rounded-md mt-1 text-xs">{item.howToFix}</p>
                                            </div>
                                        </div>
                                    </div>
                                  )
                              })}
                          </CardContent>
                      </GlassmorphismCard>
                  </motion.div>

                  {learningSuggestions && learningSuggestions.videoSuggestions.length > 0 && (
                        <motion.div variants={cardVariants}>
                            <GlassmorphismCard>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl"><Youtube className="text-primary"/> Personalized Learning</CardTitle>
                                    <CardDescription>Based on your feedback, here are some videos to help you improve.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                    {learningSuggestions.videoSuggestions.map((video, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                        <Youtube className="w-5 h-5 text-accent flex-shrink-0"/>
                                        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video)}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                            {video} <ExternalLink className="w-3 h-3"/>
                                        </a>
                                        </li>
                                    ))}
                                    </ul>
                                </CardContent>
                            </GlassmorphismCard>
                        </motion.div>
                    )}

                  <motion.div variants={cardVariants} className="flex justify-center">
                      <Button onClick={handleReset} variant="secondary" size="lg" className="rounded-lg text-base font-semibold py-6 px-8">
                          <UploadCloud className="mr-2"/>
                          Analyze Another Resume
                      </Button>
                  </motion.div>

              </motion.div>
            </AnimatePresence>
          ) : (
             // Initial Upload View
            <div id="upload-view" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <motion.div variants={cardVariants} initial="hidden" animate="visible" id="upload-resume">
                  <GlassmorphismCard>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-3 text-2xl"><UploadCloud className="text-primary"/> Upload Your Resume</CardTitle>
                          <CardDescription>Drag & drop or click to upload (PDF/DOCX, max 4MB).</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div 
                          {...getRootProps()} 
                          className={cn(
                              "border-2 border-dashed border-muted-foreground/30 rounded-xl p-12 text-center cursor-pointer transition-colors duration-300",
                              isDragActive ? "bg-primary/20 border-primary" : "hover:bg-muted/30 hover:border-muted-foreground/50"
                          )}
                          >
                          <input {...getInputProps()} />
                          {resumeFile ? (
                              <div className="flex flex-col items-center gap-2 text-primary">
                                  <CheckCircle2 className="w-12 h-12" />
                                  <span className="font-semibold text-foreground truncate">{resumeFile.name}</span>
                                  <span className="text-xs text-muted-foreground">Ready to analyze!</span>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                  <UploadCloud className="w-12 h-12" />
                                  <span className="font-semibold">{isDragActive ? 'Drop it like it\'s hot!' : 'Drag & drop file here'}</span>
                                  <span className="text-sm">or click to select</span>
                              </div>
                          )}
                          </div>
                      </CardContent>
                      <CardFooter>
                          <Button onClick={handleAnalyze} disabled={!resumeFile || isPending} className="w-full bg-primary hover:bg-primary/90 rounded-lg text-lg font-semibold py-6 transition-all duration-300 transform hover:scale-105">
                          {isPending ? <LoaderCircle className="animate-spin" /> : <><Sparkles className="mr-2"/><span>Analyze Resume</span></>}
                          </Button>
                      </CardFooter>
                  </GlassmorphismCard>
              </motion.div>
              
              <div className="flex flex-col gap-8">
                <div className="text-left">
                  <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">See Your Resume's Score in Seconds</h2>
                  <p className="text-lg text-muted-foreground">Upload your resume to unlock your personalized report. Our AI will instantly review it and show you exactly what to improve.</p>
                </div>

                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg"><Search className="text-primary w-6 h-6"/></div>
                    <div>
                      <h3 className="font-semibold text-lg">Keyword Match</h3>
                      <p className="text-muted-foreground">See how well your resume matches target job descriptions.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg"><BarChart2 className="text-primary w-6 h-6"/></div>
                    <div>
                      <h3 className="font-semibold text-lg">Impact & Metrics</h3>
                      <p className="text-muted-foreground">Learn to replace weak phrases with powerful, data-driven achievements.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg"><FileCheck className="text-primary w-6 h-6"/></div>
                    <div>
                      <h3 className="font-semibold text-lg">Formatting & Readability</h3>
                      <p className="text-muted-foreground">Get expert layout structure, and clarity.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
