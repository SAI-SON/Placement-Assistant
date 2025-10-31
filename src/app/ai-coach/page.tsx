'use client';
import { Header } from '@/components/app/header';
import { AppSidebar } from '@/components/app/sidebar';
import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderCircle, Sparkles, Bot, Send, Lightbulb, Zap } from 'lucide-react';
import { getResumeFeedback } from '@/ai/ai-feedback-chat';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const suggestedPrompts = [
    "Can you check my summary?",
    "What words should I use for a Software Engineer resume?",
    "How do I talk about a gap in my work history?",
    "Make this bullet point sound better: 'Handled customer calls'"
];

const quickTips = [
    { title: "Action Verbs", description: "Start bullet points with strong words (e.g., 'Led,' 'Achieved').", icon: Zap},
    { title: "Numbers are Key", description: "Use numbers to show your impact (e.g., 'Increased sales by 15%').", icon: Zap},
    { title: "Tailor for Jobs", description: "Change your resume slightly for each job you apply for.", icon: Zap},
    { title: "Proofread Twice", description: "Always check for typos!", icon: Zap}
]

export default function AiCoachPage() {
  const [isClient, setIsClient] = useState(false);
  const [isChatPending, startChatTransition] = useTransition();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setMessages([
        { role: 'assistant', content: "Hi Jane! I'm your AI Coach. Think of me as a friend who's great with resumes. Ask me anything, and I'll help you improve your resume, step-by-step." }
    ]);
  }, []);

  const handleChatSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = query.trim();
    if (!question) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    setQuery('');

    startChatTransition(async () => {
      try {
        const result = await getResumeFeedback({ query: question });
        setMessages([...newMessages, { role: 'assistant', content: result.feedback }]);
      } catch (e: any) {
        toast({ title: 'An Error Occurred', description: e.message, variant: 'destructive' });
        // Optionally add an error message to the chat
        setMessages([...newMessages, { role: 'assistant', content: "Sorry, I couldn't process that request. Please try again." }]);
      }
    });
  };
  
  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
  }

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
              className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
          >
              <div className="lg:col-span-2">
                  <GlassmorphismCard>
                      <CardHeader className="text-center">
                          <CardTitle className="flex items-center justify-center gap-3 text-2xl"><Bot className="text-primary"/> AI Resume Coach</CardTitle>
                          <CardDescription className="text-base">Your friendly AI assistant for resume questions.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-6 max-h-[400px] overflow-y-auto p-4 rounded-lg bg-background/30">
                              <AnimatePresence initial={false}>
                                  {messages.map((message, index) => (
                                      <motion.div
                                          key={index}
                                          layout
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          transition={{ duration: 0.3 }}
                                          className={cn(
                                              "flex items-start gap-3",
                                              message.role === 'user' ? 'justify-end' : 'justify-start'
                                          )}
                                      >
                                          {message.role === 'assistant' && <Bot className="text-primary flex-shrink-0 mt-1" />}
                                          <div className={cn(
                                              "p-3 rounded-2xl max-w-lg",
                                              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                          )}>
                                              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                          </div>
                                      </motion.div>
                                  ))}
                                  {isChatPending && (
                                      <motion.div
                                      key="pending"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex items-start gap-3 justify-start"
                                  >
                                      <Bot className="text-primary flex-shrink-0 mt-1" />
                                      <div className="p-3 rounded-2xl bg-muted flex items-center gap-2">
                                          <LoaderCircle className="w-4 h-4 animate-spin"/>
                                          <span>Thinking...</span>
                                      </div>
                                  </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>
                      
                          <form onSubmit={handleChatSubmit} className="relative">
                              <Textarea 
                                  id="chat-question" 
                                  name="question" 
                                  placeholder="Ask me anything about your resume..." 
                                  className="bg-background/50 border-white/10 rounded-lg min-h-[80px] text-base pr-20"
                                  value={query}
                                  onChange={(e) => setQuery(e.target.value)}
                                  onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleChatSubmit(e as any);
                                      }
                                  }}
                              />
                              <Button type="submit" variant="secondary" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg" disabled={isChatPending || !query.trim()}>
                                  {isChatPending ? <LoaderCircle className="animate-spin" /> : <Send />}
                              </Button>
                          </form>

                      </CardContent>
                      <CardFooter className="flex flex-col items-start gap-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                              <Lightbulb className="w-5 h-5"/>
                              <h3 className="font-semibold">Not sure where to start? Try asking:</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {suggestedPrompts.map((prompt, i) => (
                                  <Button key={i} variant="outline" size="sm" className="rounded-full" onClick={() => handlePromptClick(prompt)}>
                                      {prompt}
                                  </Button>
                              ))}
                          </div>
                      </CardFooter>
                  </GlassmorphismCard>
              </div>
              <div className="hidden lg:block">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                      <GlassmorphismCard>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-3"><Lightbulb className="text-primary"/> Quick Resume Tips</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <ul className="space-y-4">
                                  {quickTips.map((tip, i) => (
                                      <li key={i} className="flex items-start gap-3">
                                          <tip.icon className="w-5 h-5 text-accent flex-shrink-0 mt-1"/>
                                          <div>
                                              <h4 className="font-semibold text-foreground/90">{tip.title}</h4>
                                              <p className="text-muted-foreground text-sm">{tip.description}</p>
                                          </div>
                                      </li>
                                  ))}
                              </ul>
                          </CardContent>
                      </GlassmorphismCard>
                  </motion.div>
              </div>
          </motion.div>
      </main>
    </>
  );
}
