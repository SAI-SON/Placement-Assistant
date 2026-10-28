'use client';
import { Header } from '@/components/app/header';
import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Sparkles, Bot, Send, Lightbulb, Zap, User, ArrowRight } from 'lucide-react';
import { getResumeFeedback } from '@/ai/ai-feedback-chat';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const suggestedPrompts = [
  "Can you review my professional summary for a Full-Stack role?",
  "What high-impact keywords should I include for AWS and Docker?",
  "How should I explain a 6-month career or education gap?",
  "Rewrite this bullet point to sound metric-driven: 'Built backend APIs in Express'"
];

const quickTips = [
  { title: "Power Action Verbs", description: "Lead bullet points with high-impact words: Engineered, Spearheaded, Optimized.", icon: Zap },
  { title: "Quantify Every Impact", description: "Attach clear metrics: 'Reduced latency by 35%' or 'Handled 10k+ daily queries'.", icon: Zap },
  { title: "Target ATS Frameworks", description: "Mirror technical requirements and libraries mentioned in job postings.", icon: Zap },
  { title: "Single Column Clean Layout", description: "Avoid complex multi-column tables that trip automated ATS parsers.", icon: Zap }
];

export default function AiCoachPage() {
  const [isClient, setIsClient] = useState(false);
  const [isChatPending, startChatTransition] = useTransition();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setMessages([
      { 
        role: 'assistant', 
        content: "Hi Alex! I'm your AI Resume & Placement Coach. I can critique your bullet points, recommend targeted technical keywords, and help you craft ATS-beating resumes for top tier tech roles. What would you like to refine today?" 
      }
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
        const msg = e?.message || '';
        let cleanMsg = 'Unable to reach AI Coach right now. Please try again.';
        if (msg.includes('503') || msg.includes('high demand') || msg.includes('Service Unavailable')) {
          cleanMsg = 'AI servers are temporarily under high demand. Please try asking again in a moment.';
        } else if (msg.includes('429') || msg.includes('Quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          cleanMsg = 'Rate limit reached. Please wait a moment before sending another query.';
        } else if (msg) {
          cleanMsg = msg.replace(/https?:\/\/[^\s]+/g, '').replace(/\[.*?\]/g, '').trim();
        }
        toast({ title: 'AI Coach Notice', description: cleanMsg, variant: 'destructive' });
        setMessages([...newMessages, { role: 'assistant', content: "⚠️ " + cleanMsg }]);
      }
    });
  };
  
  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* Main Chat Interface (8 cols) */}
          <div className="lg:col-span-8">
            <Card className="glass-panel border-white/[0.08] rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <CardHeader className="border-b border-white/[0.06] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <Bot className="size-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">AI Career Coach Session</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground font-mono">
                        Powered by Google Gemini AI • Real-time ATS Guidance
                      </CardDescription>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary text-[10px] font-mono uppercase font-bold">
                    <span className="size-1.5 rounded-full bg-tertiary animate-pulse" />
                    Coach Active
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-4 sm:p-6 flex-1">
                {/* Chat History Container */}
                <div className="space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto p-4 rounded-xl bg-black/30 border border-white/[0.04]">
                  <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className={cn(
                          "flex items-start gap-3",
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="size-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="size-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "p-3.5 sm:p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed",
                            message.role === 'user'
                              ? "primary-glow-btn text-white rounded-tr-none font-medium whitespace-pre-wrap"
                              : "bg-white/[0.05] border border-white/[0.08] text-foreground rounded-tl-none font-sans"
                          )}
                        >
                          {message.role === 'user' ? (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          ) : (
                            <div className="space-y-2 text-foreground/95">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                  ul: ({ children }) => <ul className="my-2 space-y-1.5 list-disc pl-5 text-muted-foreground">{children}</ul>,
                                  ol: ({ children }) => <ol className="my-2 space-y-1.5 list-decimal pl-5 text-muted-foreground">{children}</ol>,
                                  li: ({ children }) => <li className="leading-relaxed"><span className="text-foreground">{children}</span></li>,
                                  strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                                  em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-2 border-primary/60 pl-3 my-2 text-xs text-muted-foreground italic bg-primary/5 py-1.5 rounded-r-lg">
                                      {children}
                                    </blockquote>
                                  ),
                                  pre: ({ children }) => (
                                    <pre className="bg-black/70 border border-white/10 p-3.5 rounded-xl overflow-x-auto text-xs font-mono text-cyan-300 my-2.5">
                                      {children}
                                    </pre>
                                  ),
                                  code: ({ children, className }: any) => {
                                    const isMultiline = String(children).includes('\n');
                                    if (isMultiline) {
                                      return <code className="font-mono text-cyan-300 text-xs leading-relaxed">{children}</code>;
                                    }
                                    return (
                                      <code className="bg-black/50 border border-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono text-cyan-300">
                                        {children}
                                      </code>
                                    );
                                  },
                                  h1: ({ children }) => <h1 className="text-base font-bold text-foreground mt-3 mb-1.5">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-sm font-bold text-foreground mt-2.5 mb-1">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-xs font-bold text-foreground mt-2 mb-1">{children}</h3>,
                                  hr: () => <hr className="my-3 border-white/10" />,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                        {message.role === 'user' && (
                          <div className="size-8 rounded-lg bg-secondary/20 border border-secondary/40 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="size-4 text-secondary" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {isChatPending && (
                      <motion.div
                        key="pending"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 justify-start"
                      >
                        <div className="size-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="size-4 text-primary" />
                        </div>
                        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 text-xs text-muted-foreground font-mono">
                          <LoaderCircle className="size-3.5 animate-spin text-primary" />
                          <span>Synthesizing coaching advice...</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              
                {/* Input Form */}
                <form onSubmit={handleChatSubmit} className="relative mt-2">
                  <Textarea 
                    id="chat-question" 
                    name="question" 
                    placeholder="Ask about bullet points, ATS keywords, summary pitch..." 
                    className="bg-black/40 border-white/[0.08] rounded-xl min-h-[80px] text-xs sm:text-sm pr-14 text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:ring-1 focus:ring-primary/60 transition-all resize-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit(e as any);
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="primary-glow-btn text-white absolute right-2.5 bottom-2.5 size-9 rounded-xl disabled:opacity-40" 
                    disabled={isChatPending || !query.trim()}
                  >
                    {isChatPending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </form>
              </CardContent>

              {/* Prompt Suggestions Footer */}
              <CardFooter className="flex flex-col items-start gap-2.5 bg-black/20 border-t border-white/[0.06] p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Lightbulb className="size-3.5 text-primary" />
                  <span>Quick Starter Queries:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      className="px-3 py-1.5 rounded-full text-xs font-sans bg-white/[0.03] hover:bg-primary/20 hover:text-primary hover:border-primary/40 border border-white/[0.08] text-muted-foreground transition-all duration-200 text-left"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Resume Tips Side Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="glass-panel border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-4">
              <CardHeader className="p-0 pb-3 border-b border-white/[0.06]">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Sparkles className="size-4 text-secondary" />
                  Recruiter Golden Rules
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Key rules that elevate your profile into the top 10 percentile.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {quickTips.map((tip, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-secondary/15 border border-secondary/30 shrink-0 mt-0.5">
                      <tip.icon className="size-3.5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">{tip.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </>
  );
}
