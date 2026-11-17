'use client';
import { Header } from '@/components/app/header';
import { useState, useEffect, useTransition, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Mic, Bot, Send, CheckCircle2, UploadCloud, ThumbsUp, Lightbulb, ChevronRight, UserCheck, BarChart, Sparkles, Star, Check, X, ShieldCheck, Zap, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { generateQuestionsAction, evaluateAnswerAction } from '@/lib/actions';
import { ScrollArea } from '@/components/ui/scroll-area';

type Question = {
  question: string;
  questionNumber: number;
};

type Evaluation = {
  score: number;
  whatYouDidWell: string;
  howToImprove: string;
};

type Stage = 'setup' | 'interview' | 'feedback' | 'summary';

export default function AiInterviewCoachPage() {
  const [stage, setStage] = useState<Stage>('setup');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [resumeDataUri, setResumeDataUri] = useState('');
  const [isClient, setIsClient] = useState(false);

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

  const handleStartInterview = () => {
    if (!resumeFile || !jobDescription.trim()) {
      toast({ title: 'Missing Information', description: 'Please upload a resume and provide a target job description.', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      try {
        const dataUri = await toDataURI(resumeFile);
        setResumeDataUri(dataUri);
        const result = await generateQuestionsAction({ resumeDataUri: dataUri, jobDescription });
        setQuestions(result.questions);
        setStage('interview');
        toast({ title: 'Simulation Ready', description: "AI interviewer is calibrated. Good luck!" });
      } catch (e: any) {
        toast({ title: 'An Error Occurred', description: e.message, variant: 'destructive' });
      }
    });
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      toast({ title: 'Empty Answer', description: 'Please type or dictate an answer before submitting.', variant: 'destructive' });
      return;
    }
    startTransition(async () => {
      try {
        const result = await evaluateAnswerAction({
          question: questions[currentQuestionIndex].question,
          answer: userAnswer,
          resumeDataUri,
          jobDescription
        });
        setEvaluations([...evaluations, result]);
        setStage('feedback');
        setUserAnswer('');
      } catch (e: any) {
        toast({ title: 'An Error Occurred', description: e.message, variant: 'destructive' });
      }
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStage('interview');
    } else {
      setStage('summary');
    }
  };

  const handleReset = () => {
    setStage('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setEvaluations([]);
  };

  const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
  const averageScore = evaluations.length > 0 ? (totalScore / evaluations.length) : 0;
  const interviewProgress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const overallPercentage = Math.round(averageScore * 10);
  
  let scoreDescription = "Needs Polish";
  if (overallPercentage >= 85) scoreDescription = "Elite Tier (Offer Probable)";
  else if (overallPercentage >= 70) scoreDescription = "Strong Candidate (Competitive)";
  else if (overallPercentage >= 50) scoreDescription = "Average Performance";

  const strengths = evaluations.map(e => e.whatYouDidWell).slice(0, 3);
  const improvements = evaluations.map(e => e.howToImprove).slice(0, 3);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header Banner */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-mono uppercase tracking-wider font-semibold mb-1">
                <Mic className="size-3.5" />
                Live Audio &amp; Behavioral Drill
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                AI Mock Interview Studio
              </h1>
            </div>

            {/* Stage Indicator Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
              <span className={cn("px-3 py-1 rounded-lg transition-colors", stage === 'setup' ? "bg-primary text-white font-semibold" : "text-muted-foreground")}>
                1. Calibration
              </span>
              <span className={cn("px-3 py-1 rounded-lg transition-colors", stage === 'interview' ? "bg-secondary text-black font-semibold" : "text-muted-foreground")}>
                2. Live Drill
              </span>
              <span className={cn("px-3 py-1 rounded-lg transition-colors", stage === 'feedback' ? "bg-tertiary text-black font-semibold" : "text-muted-foreground")}>
                3. Feedback
              </span>
              <span className={cn("px-3 py-1 rounded-lg transition-colors", stage === 'summary' ? "bg-primary text-white font-semibold" : "text-muted-foreground")}>
                4. Debrief
              </span>
            </div>
          </div>

          {/* STAGE 1: SETUP */}
          {stage === 'setup' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <Card className="lg:col-span-7 glass-panel border-white/[0.08] rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2.5 text-xl font-bold text-foreground">
                    <Mic className="size-5 text-secondary" /> Setup Interview Parameters
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Upload your candidate resume and paste the job description to generate role-specific questions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <Label htmlFor="resume-upload" className="text-xs font-medium text-foreground mb-2 block">
                      Target Candidate Resume (PDF/DOCX)
                    </Label>
                    <div 
                      {...getRootProps()} 
                      className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
                        isDragActive 
                          ? "bg-primary/20 border-primary" 
                          : "border-white/[0.1] hover:bg-white/[0.03] hover:border-white/[0.25]"
                      )}
                    >
                      <input {...getInputProps()} id="resume-upload" />
                      {resumeFile ? (
                        <div className="flex flex-col items-center gap-1.5 text-tertiary">
                          <CheckCircle2 className="size-8" />
                          <span className="font-semibold text-foreground text-sm truncate max-w-xs">{resumeFile.name}</span>
                          <span className="text-[11px] font-mono text-muted-foreground">Resume parsed &amp; locked</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <UploadCloud className="size-8 text-secondary" />
                          <span className="font-medium text-foreground text-xs">Drop resume or click to browse</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="job-description" className="text-xs font-medium text-foreground mb-2 block">
                      Target Job Description &amp; Requirements
                    </Label>
                    <Textarea 
                      id="job-description" 
                      placeholder="e.g. Full-Stack Engineer at Stripe: Experience with TypeScript, React, Distributed Systems, microservices architecture..." 
                      className="min-h-[140px] bg-black/40 border-white/[0.08] rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary/60 focus:ring-1 focus:ring-secondary/60 transition-all resize-none"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleStartInterview} 
                    disabled={isPending || !resumeFile || !jobDescription.trim()} 
                    className="w-full primary-glow-btn rounded-xl text-sm font-semibold h-12 gap-2"
                  >
                    {isPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="size-4 fill-current" />
                        <span>Calibrate &amp; Begin Simulation</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Tips & Expectations Column */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="glass-panel border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
                    <Lightbulb className="size-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">Why AI Simulated Drills Work</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Generic interview questions prepare you for nothing. Our engine performs dual-cross analysis on your projects vs. the job description to target your exact potential vulnerabilities.
                  </p>
                  <div className="space-y-3 pt-1">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                      <UserCheck className="size-4 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">Personalized Behavioral &amp; Tech Scenarios</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Deep queries crafted directly from the code and impact claims on your resume.</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                      <BarChart className="size-4 text-tertiary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">Immediate STAR Evaluation</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Instant scoring on clarity, technical precision, and measurable outcome framing.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* STAGE 2: LIVE DRILL INTERVIEW */}
          {stage === 'interview' && questions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <Card className="lg:col-span-7 glass-panel border-white/[0.08] rounded-2xl shadow-xl flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-secondary uppercase tracking-wider font-semibold">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {Math.round(interviewProgress)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden mb-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
                      style={{ width: `${interviewProgress}%` }}
                    />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                    "{questions[currentQuestionIndex].question}"
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder="Structure your answer using Situation, Task, Action, and Result (STAR)..."
                      className="min-h-[220px] bg-black/40 border-white/[0.08] rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary/60 focus:ring-1 focus:ring-secondary/60 transition-all resize-none leading-relaxed"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Words: {userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0}
                  </span>
                  <Button 
                    onClick={handleSubmitAnswer} 
                    disabled={isPending || !userAnswer.trim()} 
                    className="primary-glow-btn text-white rounded-xl text-xs font-semibold px-6 h-10 gap-2"
                  >
                    {isPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <>
                        <span>Submit for Evaluation</span>
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* STAR Framework Guide Side Panel */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="glass-panel border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                    <Star className="size-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-foreground">The Recruiter S.T.A.R. Framework</h3>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <strong className="text-secondary font-mono">S - Situation:</strong>
                      <span className="text-muted-foreground ml-1">What was the context or challenge? Keep it brief.</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <strong className="text-primary font-mono">T - Task:</strong>
                      <span className="text-muted-foreground ml-1">What was your exact role and deliverable?</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <strong className="text-tertiary font-mono">A - Action:</strong>
                      <span className="text-muted-foreground ml-1">What engineering decisions did YOU make?</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <strong className="text-amber-400 font-mono">R - Result:</strong>
                      <span className="text-muted-foreground ml-1">What was the quantifiable impact (e.g. +20% faster)?</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* STAGE 3: QUESTION FEEDBACK */}
          {stage === 'feedback' && evaluations[currentQuestionIndex] && (
            <div className="max-w-3xl mx-auto">
              <Card className="glass-panel border-white/[0.08] rounded-2xl shadow-xl overflow-hidden">
                <CardHeader className="border-b border-white/[0.06] pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                        Question Evaluation
                      </span>
                      <CardTitle className="text-xl font-bold text-foreground mt-1">
                        AI Assessor Feedback
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/40 text-primary font-mono font-bold text-lg">
                      {evaluations[currentQuestionIndex].score}
                      <span className="text-xs text-muted-foreground font-normal">/10</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 p-6">
                  {/* Strengths */}
                  <div className="p-4 rounded-xl bg-tertiary/10 border border-tertiary/30 space-y-2">
                    <div className="flex items-center gap-2 text-tertiary font-semibold text-xs uppercase tracking-wide font-mono">
                      <ThumbsUp className="size-4" />
                      What You Did Well
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-6">
                      {evaluations[currentQuestionIndex].whatYouDidWell}
                    </p>
                  </div>

                  {/* Improvements */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wide font-mono">
                      <Lightbulb className="size-4" />
                      How To Improve Your Delivery
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-6">
                      {evaluations[currentQuestionIndex].howToImprove}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-white/[0.06] p-5 bg-black/20 flex justify-end">
                  <Button 
                    onClick={handleNextQuestion} 
                    className="primary-glow-btn text-white rounded-xl text-xs font-semibold px-6 h-10 gap-2"
                  >
                    <span>{currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish & View Full Debrief"}</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* STAGE 4: SUMMARY DEBRIEF */}
          {stage === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Score Column (5 cols) */}
              <Card className="lg:col-span-5 glass-panel border-white/[0.08] rounded-2xl p-6 text-center shadow-xl space-y-5">
                <CardHeader className="p-0">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                    Comprehensive Result
                  </span>
                  <CardTitle className="text-xl font-bold text-foreground">Interview Readiness Score</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="size-40 rounded-full bg-primary/10 border-4 border-primary/40 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                    <span className="text-4xl font-mono font-extrabold text-primary">
                      {overallPercentage}<span className="text-xl font-normal">%</span>
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                      Overall Score
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mt-4">{scoreDescription}</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Based on {evaluations.length} evaluated technical &amp; behavioral question responses.
                  </p>
                </CardContent>
                <CardFooter className="p-0 pt-3 flex justify-center">
                  <Button 
                    onClick={handleReset} 
                    variant="outline" 
                    className="rounded-xl px-5 h-10 text-xs font-mono border-white/15 gap-2"
                  >
                    <RotateCcw className="size-3.5" />
                    New Interview Session
                  </Button>
                </CardFooter>
              </Card>

              {/* Performance Key Points Column (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <Card className="glass-panel border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-5">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-lg font-bold text-foreground">Candidate Debrief Takeaways</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Key strengths and technical areas needing reinforcement before live panel interviews.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div>
                      <h4 className="text-xs font-mono font-semibold text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Check className="size-3.5" /> Proven Strengths
                      </h4>
                      <ul className="space-y-2 text-xs">
                        {strengths.map((s, i) => (
                          <li key={i} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-foreground/90">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Lightbulb className="size-3.5" /> Recommended Polish
                      </h4>
                      <ul className="space-y-2 text-xs">
                        {improvements.map((imp, i) => (
                          <li key={i} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-foreground/90">
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
