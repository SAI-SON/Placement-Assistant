'use client';
import { Header } from '@/components/app/header';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Bot, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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


export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-8">
            <div className="text-center p-8 md:p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-card to-background border border-border">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4"
              >
                Welcome to Placement Assistant
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
              >
                Your AI copilot for crafting a job-winning resume. Get instant analysis, tailored suggestions, and expert advice to land your dream job faster.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-8"
              >
                <Button asChild size="lg" className="rounded-full font-bold text-lg py-7 px-10 bg-primary hover:bg-primary/90 transition-transform transform hover:scale-105">
                  <Link href="/upload-resume">
                    Get Started <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8, staggerChildren: 0.2 }}
            >
              <motion.div variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 20 } }}>
                <GlassmorphismCard className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl"><UploadCloud className="text-primary" /> Instant Resume Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Upload your resume to get an instant score. Our AI will provide detailed feedback on formatting, keywords, and areas for improvement, showing you how to stand out.
                    </p>
                    <Button asChild variant="secondary" className="rounded-lg">
                      <Link href="/upload-resume">Analyze Now</Link>
                    </Button>
                  </CardContent>
                </GlassmorphismCard>
              </motion.div>

              <motion.div variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 20 } }}>
                <GlassmorphismCard className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl"><Bot className="text-primary" /> AI Resume Coach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Have specific questions? Chat with our AI coach to get personalized advice. Ask anything from "How do I phrase this?" to "Is my resume good for a tech role?"
                    </p>
                    <Button asChild variant="secondary" className="rounded-lg">
                      <Link href="/ai-coach">Ask the Coach</Link>
                    </Button>
                  </CardContent>
                </GlassmorphismCard>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
