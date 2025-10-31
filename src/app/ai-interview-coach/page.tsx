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
import { LoaderCircle, Mic, Bot, Send, CheckCircle2, UploadCloud, ThumbsUp, Lightbulb, ChevronRight, UserCheck, BarChart, Sparkles, Star, Check, X } from 'lucide-react';
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
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for GenAI
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
      toast({ title: 'Missing Information', description: 'Please upload a resume and provide a job description.', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      try {
        const dataUri = await toDataURI(resumeFile);
        setResumeDataUri(dataUri);
        const result = await generateQuestionsAction({ resumeDataUri: dataUri, jobDescription });
        setQuestions(result.questions);
        setStage('interview');
        toast({ title: 'Interview Ready', description: "Let's begin!" });
      } catch (e: any) {
        toast({ title: 'An Error Occurred', description: e.message, variant: 'destructive' });
      }
    });
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      toast({ title: 'Empty Answer', description: 'Please provide an answer to the question.', variant: 'destructive' });
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
      } catch (e: any)
{
        toast({ title: 'An Error Occurred', description: e.message, variant: 'destructive' });
      }
    });
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStage('interview');
    } else {
      setStage('summary');
    }
  }

  const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
  const averageScore = questions.length > 0 ? (totalScore / evaluations.length) : 0;
  const interviewProgress = (currentQuestionIndex / questions.length) * 100;
  
  const overallPercentage = Math.round(averageScore * 10);
  
  let scoreDescription;
  if(overallPercentage >= 80) scoreDescription = "Excellent Work!";
  else if (overallPercentage >= 60) scoreDescription = "Good Job!";
  else if (overallPercentage >= 40) scoreDescription = "Solid Effort";
  else scoreDescription = "Needs Improvement";

  const strengths = evaluations.map(e => e.whatYouDidWell).slice(0, 2); // Get top 2
  const improvements = evaluations.map(e => e.howToImprove).slice(0, 2);


  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

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
          {stage === 'setup' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold"><Mic className="text-primary"/> AI Interview Coach</CardTitle>
                  <CardDescription>Simulate a professional interview based on your resume and a target job description.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="resume-upload" className="mb-2 block font-medium">Your Resume</Label>
                        <div 
                        {...getRootProps()} 
                        className={cn(
                            "border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center cursor-pointer transition-colors duration-300",
                            isDragActive ? "bg-primary/20 border-primary" : "hover:bg-muted/30"
                        )}
                        >
                        <input {...getInputProps()} id="resume-upload" />
                        {resumeFile ? (
                            <div className="flex flex-col items-center gap-2 text-primary">
                                <CheckCircle2 className="w-10 h-10" />
                                <span className="font-semibold text-foreground truncate">{resumeFile.name}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <UploadCloud className="w-10 h-10" />
                                <span className="font-semibold">Drop Resume Here</span>
                            </div>
                        )}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="job-description" className="font-medium">Target Job Description</Label>
                        <Textarea 
                            id="job-description" 
                            placeholder="Paste the job description here..." 
                            className="mt-2 h-full min-h-[150px]"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleStartInterview} disabled={isPending} className="w-full text-lg py-6 rounded-md">
                    {isPending ? <LoaderCircle className="animate-spin" /> : "Start Interview Practice"}
                  </Button>
                </CardFooter>
              </Card>
              <Card className="bg-card/50">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl font-bold"><Lightbulb className="text-primary"/> Get Ready for the Real Thing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <p className="text-muted-foreground">Don't just practice. Practice for the *real* interview. Our AI analyzes your resume against the job description to generate a personalized set of questions you're highly likely to be asked.</p>
                      <ul className="space-y-4">
                          <li className="flex items-start gap-4">
                              <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg"><UserCheck className="text-primary w-5 h-5"/></div>
                              <div>
                                  <h4 className="font-semibold">Personalized Questions</h4>
                                  <p className="text-sm text-muted-foreground">No more generic lists. Get questions tailored specifically to your experience.</p>
                              </div>
                          </li>
                          <li className="flex items-start gap-4">
                              <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg"><BarChart className="text-primary w-5 h-5"/></div>
                              <div>
                                  <h4 className="font-semibold">Instant Feedback</h4>
                                  <p className="text-sm text-muted-foreground">Receive a score and constructive advice on your answers in real-time.</p>
                              </div>
                          </li>
                          <li className="flex items-start gap-4">
                              <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg"><Sparkles className="text-primary w-5 h-5"/></div>
                              <div>
                                  <h4 className="font-semibold">Build Confidence</h4>
                                  <p className="text-sm text-muted-foreground">Walk into your interview knowing you're prepared for the toughest questions.</p>
                              </div>
                          </li>
                      </ul>
                  </CardContent>
              </Card>
            </div>
          )}

          {stage === 'interview' && questions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <Card>
                <CardHeader>
                  {isClient && <Progress value={interviewProgress} className="w-full mb-4 h-2" />}
                  <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                  <CardTitle className="text-2xl pt-2">{questions[currentQuestionIndex].question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {e.preventDefault(); handleSubmitAnswer();}}>
                    <Textarea
                      placeholder="Your answer..."
                      className="min-h-[200px] text-base"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                    />
                  </form>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSubmitAnswer} disabled={isPending} className="w-full text-lg py-6 rounded-md">
                    {isPending ? <LoaderCircle className="animate-spin" /> : "Submit Answer"}
                  </Button>
                </CardFooter>
              </Card>
              <Card className="bg-card/50">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl font-bold"><Lightbulb className="text-primary"/> Tips for a Great Answer</CardTitle>
                      <CardDescription>Recruiters look for clear, structured, and impactful answers. Here's a simple guide to follow:</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold flex items-center gap-2 mb-2"><Star className="w-5 h-5 text-yellow-400"/> Use the S.T.A.R. Method</h4>
                          <p className="text-sm text-muted-foreground">
                              <span className="font-bold text-foreground/90">S</span>ituation (Set the scene) • <span className="font-bold text-foreground/90">T</span>ask (Describe your role) • <span className="font-bold text-foreground/90">A</span>ction (Explain what you did) • <span className="font-bold text-foreground/90">R</span>esult (Share the outcome).
                          </p>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">Quantify Your Impact</h4>
                          <p className="text-sm text-muted-foreground">Don't just say what you did, show how well you did it. Use numbers (e.g., "improved speed by 15%," "managed 50+ clients").</p>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">Stay on Topic</h4>
                          <p className="text-sm text-muted-foreground">Make sure your answer directly addresses the question. It's easy to go off-topic—stay focused!</p>
                      </div>
                  </CardContent>
              </Card>
            </div>
          )}

          {stage === 'feedback' && evaluations[currentQuestionIndex] && (
             <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                      <CardTitle className="text-2xl">Feedback on Your Answer</CardTitle>
                      <CardDescription>Your score for this question is <span className="font-bold text-primary text-lg">{evaluations[currentQuestionIndex].score}/10</span></CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><ThumbsUp className="text-green-400"/> What you did well:</h3>
                          <p className="text-muted-foreground pl-8">{evaluations[currentQuestionIndex].whatYouDidWell}</p>
                      </div>
                      <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Lightbulb className="text-yellow-400"/> How to improve:</h3>
                          <p className="text-muted-foreground pl-8">{evaluations[currentQuestionIndex].howToImprove}</p>
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Button onClick={handleNextQuestion} className="w-full text-lg py-6 rounded-md">
                          {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish & View Summary"}
                          <ChevronRight/>
                      </Button>
                  </CardFooter>
                </Card>
             </div>
          )}

          {stage === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Column 1: At-a-Glance Summary */}
              <div className="flex flex-col gap-8">
                  <Card>
                      <CardHeader className="items-center text-center">
                          <CardTitle className="text-2xl">Overall Score</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center">
                          <div className="w-40 h-40 rounded-full bg-primary/10 border-4 border-primary flex flex-col items-center justify-center">
                              <span className="text-5xl font-bold text-primary">{overallPercentage}<span className="text-2xl">%</span></span>
                          </div>
                          <p className="text-lg font-semibold mt-4">{scoreDescription}</p>
                      </CardContent>
                  </Card>
                  <Card>
                       <CardHeader>
                          <CardTitle>Your Performance Summary</CardTitle>
                          <CardDescription>A quick look at your strengths and areas for improvement.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Strengths</h4>
                              <ul className="space-y-2">
                                  {strengths.map((s, i) => (
                                      <li key={`s-${i}`} className="flex items-start gap-2">
                                          <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0"/>
                                          <span className="text-sm text-muted-foreground">{s}</span>
                                      </li>
                                  ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                              <ul className="space-y-2">
                                  {improvements.map((imp, i) => (
                                      <li key={`i-${i}`} className="flex items-start gap-2">
                                          <X className="w-4 h-4 text-red-400 mt-1 flex-shrink-0"/>
                                          <span className="text-sm text-muted-foreground">{imp}</span>
                                      </li>
                                  ))}
                              </ul>
                            </div>
                      </CardContent>
                  </Card>
              </div>

              {/* Column 2: Detailed Feedback */}
              <Card>
                  <CardHeader>
                      <CardTitle>Detailed Question Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <ScrollArea className="h-[450px] pr-4">
                      <div className="space-y-4">
                          {questions.map((q, i) => {
                              const evaluation = evaluations[i];
                              if (!evaluation) return null;
                              
                              const score = evaluation.score;
                              const scoreColorClass = score >= 7
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-red-500/10 border-red-500/30';
                              const scoreTextColorClass = score >= 7 ? 'text-green-300' : 'text-red-300';

                              return (
                                <div key={i} className={cn("p-4 border rounded-lg", scoreColorClass)}>
                                    <h4 className="font-semibold">{i+1}. {q.question}</h4>
                                    <p className={cn("text-sm font-bold", scoreTextColorClass)}>Score: {evaluation.score}/10</p>
                                </div>
                              )
                          })}
                      </div>
                    </ScrollArea>
                    <div className="mt-6">
                         <Button onClick={() => { setStage('setup'); setEvaluations([]); setCurrentQuestionIndex(0); setResumeFile(null); setJobDescription('') }} variant="secondary" className="w-full text-lg py-6 rounded-md">
                          Start a New Interview
                      </Button>
                    </div>
                  </CardContent>
              </Card>
            </div>
          )}

        </motion.div>
      </main>
    </>
  );
}
