'use client';
import { Header } from '@/components/app/header';
import { useState, useEffect, useTransition, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, LoaderCircle, Sparkles, User, Brain, Code, Briefcase, Award, Download, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateResumeAction } from '@/lib/actions';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

const initialFormData = {
  name: "Alex Morgan",
  role: "Full Stack Engineer | AI Systems",
  email: "alex.morgan@email.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexmorgan",
  portfolio: "alexmorgan.dev",
  degree: "B.S. in Computer Science & Engineering",
  institution: "State University of Technology",
  educationYear: "2021–2025",
  cgpa: "3.85 / 4.0",
  skills: "TypeScript, Python, React, Next.js, Node.js, Go, PostgreSQL, Redis, Docker, Kubernetes, AWS",
  project1Title: "Distributed Microservices Event Engine",
  project1Description: "Architected a high-throughput event processing platform utilizing Apache Kafka and Go, handling concurrent streaming analytics.",
  project1Impact: "Processed 15M+ daily event logs with sub-50ms latency.",
  project1Tech: "Go, Apache Kafka, Docker, Redis, gRPC",
  project2Title: "AI Copilot Resume Telemetry Platform",
  project2Description: "Engineered a Next.js full-stack platform leveraging Gemini GenAI models for automated resume parsing, ATS scoring, and recruiter matching.",
  project2Impact: "Benchmarked 95%+ precision against actual corporate ATS parsers.",
  project2Tech: "Next.js, TypeScript, Tailwind CSS, Gemini AI, PostgreSQL",
  achievements: "Winner, National Collegiate Hackathon 2024 (Top 1% of 3,000 teams)\nDean's Honor List for 6 Consecutive Semesters",
};

export default function ResumeTemplatesPage() {
  const [isClient, setIsClient] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState(initialFormData);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateResume = (data: typeof initialFormData) => {
    startTransition(async () => {
      try {
        const result = await generateResumeAction({
          name: data.name,
          role: data.role,
          contact: {
            email: data.email,
            phone: data.phone,
            location: data.location,
            linkedin: data.linkedin,
            portfolio: data.portfolio,
          },
          education: [{
            degree: data.degree,
            institution: data.institution,
            year: data.educationYear,
            cgpa: data.cgpa,
          }],
          skills: data.skills.split(',').map(s => s.trim()),
          projects: [
            { title: data.project1Title, description: data.project1Description, impact: data.project1Impact, tech: data.project1Tech.split(',').map(s => s.trim()) },
            { title: data.project2Title, description: data.project2Description, impact: data.project2Impact, tech: data.project2Tech.split(',').map(s => s.trim()) },
          ],
          achievements: data.achievements.split('\n'),
        });
        setGeneratedResume(result.formatted_resume_markdown);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleGenerateResume(formData);
  };

  const handleDownloadPdf = async () => {
    const contentToCapture = resumeRef.current;
    if (!contentToCapture) return;

    const clone = contentToCapture.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.height = 'auto';
    clone.style.width = `${contentToCapture.offsetWidth}px`;
    clone.style.backgroundColor = 'white';
    clone.classList.remove('prose-invert');
    clone.classList.add('prose');
    clone.style.color = 'black';

    const allChildren = clone.querySelectorAll('*');
    allChildren.forEach((child) => {
      if (child instanceof HTMLElement) {
        child.style.color = 'black';
      }
    });

    document.body.appendChild(clone);
    
    try {
      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        height: clone.scrollHeight,
        windowHeight: clone.scrollHeight,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      
      const imgHeight = pdfWidth / ratio;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('alex_morgan_resume.pdf');
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      document.body.removeChild(clone);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full overflow-y-auto">
        {/* Header Hero */}
        <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-xl">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-mono uppercase tracking-wider font-semibold w-fit mb-2">
            <Sparkles className="size-3.5" />
            ATS-Optimized Formatting
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            AI Automated Resume Generator
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Fill in your core credentials below. Our generative engine transforms your details into an industry-grade, single-column ATS resume ready for PDF export.
          </p>
        </section>

        {/* Dual Column Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column (6 cols) */}
          <GlassmorphismCard className="lg:col-span-6 p-5 sm:p-6">
            <CardHeader className="p-0 pb-4 border-b border-white/[0.06] mb-4">
              <CardTitle className="text-base font-bold text-foreground">Candidate Profile Data</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                All fields are automatically sanitized and metric-enhanced.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 max-h-[72vh] overflow-y-auto pr-2 space-y-5">
              <form onSubmit={onFormSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-secondary uppercase tracking-wider">
                  <User className="size-3.5" /> Personal Details
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-[11px] text-muted-foreground">Full Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="role" className="text-[11px] text-muted-foreground">Role / Headline</Label>
                    <Input id="role" name="role" value={formData.role} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-[11px] text-muted-foreground">Email</Label>
                    <Input id="email" name="email" value={formData.email} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-[11px] text-muted-foreground">Phone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="location" className="text-[11px] text-muted-foreground">Location</Label>
                    <Input id="location" name="location" value={formData.location} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="linkedin" className="text-[11px] text-muted-foreground">LinkedIn</Label>
                    <Input id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="portfolio" className="text-[11px] text-muted-foreground">Portfolio / GitHub</Label>
                    <Input id="portfolio" name="portfolio" value={formData.portfolio} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase tracking-wider pt-2 border-t border-white/[0.06]">
                  <Brain className="size-3.5" /> Education
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="institution" className="text-[11px] text-muted-foreground">Institution</Label>
                    <Input id="institution" name="institution" value={formData.institution} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="degree" className="text-[11px] text-muted-foreground">Degree</Label>
                    <Input id="degree" name="degree" value={formData.degree} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="educationYear" className="text-[11px] text-muted-foreground">Year Period</Label>
                    <Input id="educationYear" name="educationYear" value={formData.educationYear} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cgpa" className="text-[11px] text-muted-foreground">CGPA / GPA</Label>
                    <Input id="cgpa" name="cgpa" value={formData.cgpa} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-tertiary uppercase tracking-wider pt-2 border-t border-white/[0.06]">
                  <Code className="size-3.5" /> Technical Skills &amp; Honors
                </div>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <Label htmlFor="skills" className="text-[11px] text-muted-foreground">Skills (Comma-separated)</Label>
                    <Textarea id="skills" name="skills" value={formData.skills} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] text-xs resize-none" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="achievements" className="text-[11px] text-muted-foreground">Achievements / Honors (one per line)</Label>
                    <Textarea id="achievements" name="achievements" value={formData.achievements} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] text-xs resize-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider pt-2 border-t border-white/[0.06]">
                  <Briefcase className="size-3.5" /> High-Impact Projects
                </div>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <Label htmlFor="project1Title" className="text-[11px] text-muted-foreground">Project 1 Title</Label>
                    <Input id="project1Title" name="project1Title" value={formData.project1Title} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="project1Description" className="text-[11px] text-muted-foreground">Description &amp; Architecture</Label>
                    <Textarea id="project1Description" name="project1Description" value={formData.project1Description} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] text-xs resize-none" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="project1Impact" className="text-[11px] text-muted-foreground">Measurable Impact Metric</Label>
                    <Input id="project1Impact" name="project1Impact" value={formData.project1Impact} onChange={handleInputChange} className="bg-black/40 border-white/[0.08] h-9 text-xs" />
                  </div>
                </div>

                <div className="pt-3">
                  <Button type="submit" disabled={isPending} className="w-full primary-glow-btn rounded-xl text-xs font-semibold h-11 gap-2">
                    {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <><Sparkles className="size-4" /><span>Generate ATS Master Resume</span></>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </GlassmorphismCard>

          {/* Generated Preview Column (6 cols) */}
          <GlassmorphismCard className="lg:col-span-6 p-5 sm:p-6">
            <CardHeader className="p-0 pb-4 border-b border-white/[0.06] mb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">ATS Document Preview</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Live generated layout preview</CardDescription>
              </div>
              <Button 
                onClick={handleDownloadPdf} 
                variant="outline" 
                size="sm" 
                disabled={!generatedResume || isPending}
                className="h-8 rounded-lg text-xs font-mono border-white/15 hover:bg-white/[0.08] gap-1.5"
              >
                <Download className="size-3.5" /> Download PDF
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isPending ? (
                <div className="flex flex-col items-center justify-center h-96 gap-3 text-muted-foreground">
                  <LoaderCircle className="size-8 animate-spin text-primary" />
                  <span className="text-xs font-mono">Synthesizing ATS-compliant layout...</span>
                </div>
              ) : generatedResume ? (
                <div ref={resumeRef} className="prose prose-sm prose-invert max-w-none p-5 border border-white/[0.08] rounded-xl h-[72vh] overflow-y-auto bg-black/40 font-sans leading-relaxed text-xs">
                  <ReactMarkdown>{generatedResume}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-muted-foreground text-center p-6 space-y-2">
                  <FileText className="size-12 opacity-30 text-primary" />
                  <p className="text-sm font-semibold text-foreground">No Resume Generated Yet</p>
                  <p className="text-xs max-w-xs">Fill in your information on the left and click "Generate ATS Master Resume" to preview.</p>
                </div>
              )}
            </CardContent>
          </GlassmorphismCard>
        </div>
      </main>
    </>
  );
}
