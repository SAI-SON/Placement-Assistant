'use client';
import { Header } from '@/components/app/header';
import { useState, useEffect, useTransition, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, LoaderCircle, Sparkles, User, Brain, Code, Briefcase, Award, Download } from 'lucide-react';
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
        "bg-card/50 backdrop-blur-xl border-white/10 rounded-2xl shadow-lg transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );

const initialFormData = {
    name: "Sai",
    role: "Full Stack Developer | AI Enthusiast",
    email: "sai@email.com",
    phone: "+91-9876543210",
    location: "Chennai, India",
    linkedin: "linkedin.com/in/sai",
    portfolio: "sai.dev",
    degree: "B.Tech in Computer Science and Engineering",
    institution: "XYZ University",
    educationYear: "2022–2026",
    cgpa: "8.7",
    skills: "C, C++, Java, Python, React.js, Node.js, MongoDB, Express.js, Git, Figma",
    project1Title: "AI-Based Traffic Sign Detection",
    project1Description: "Developed an ML model using OpenCV and TensorFlow to classify traffic signs and control vehicle speed via Arduino integration.",
    project1Impact: "Achieved 95% detection accuracy.",
    project1Tech: "Python, TensorFlow, OpenCV, Arduino",
    project2Title: "E-commerce Website (MERN)",
    project2Description: "Built a responsive e-commerce platform with admin dashboard, Stripe payments, and real-time order tracking.",
    project2Impact: "Handled 500+ simulated transactions with <2s latency.",
    project2Tech: "React, Node, MongoDB, Express, JWT",
    achievements: "Winner, Smart India Hackathon 2024\nPublished Research on AI Mobility Systems",
};

export default function ResumeTemplatesPage() {
  const [isClient, setIsClient] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState(initialFormData);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsClient(true);
    if (!generatedResume && !isPending) {
        handleGenerateResume(initialFormData);
    }
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
  }

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleGenerateResume(formData);
  }

  const handleDownloadPdf = async () => {
    const contentToCapture = resumeRef.current;
    if (!contentToCapture) return;

    // Create a clone of the node
    const clone = contentToCapture.cloneNode(true) as HTMLElement;

    // Style the clone for PDF generation (light theme)
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.height = 'auto';
    clone.style.width = `${contentToCapture.offsetWidth}px`;
    clone.style.backgroundColor = 'white';
    clone.classList.remove('prose-invert'); // Use light prose styles
    clone.classList.add('prose');
    clone.style.color = 'black'; // Ensure text is black

    // Apply styles to all children
    const allChildren = clone.querySelectorAll('*');
    allChildren.forEach((child) => {
        if (child instanceof HTMLElement) {
            child.style.color = 'black';
        }
    });


    document.body.appendChild(clone);
    
    try {
        const canvas = await html2canvas(clone, {
            backgroundColor: '#ffffff', // Explicitly set white background
            scale: 2,
            useCORS: true,
            height: clone.scrollHeight, // Capture full scroll height
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

        pdf.save('resume.pdf');

    } catch (error) {
        console.error("Failed to generate PDF", error);
    } finally {
        // Clean up by removing the clone
        document.body.removeChild(clone);
    }
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
                <Sparkles /> AI Resume Builder
              </h1>
              <p className="text-lg text-muted-foreground">Enter your details and watch our AI craft a professional resume for you.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <GlassmorphismCard>
                <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[70vh] overflow-y-auto pr-6">
                    <form onSubmit={onFormSubmit} className="space-y-4">
                        
                        <h3 className="text-lg font-semibold border-b pb-2">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <Label htmlFor="name">Full Name</Label>
                               <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role / Title</Label>
                                <Input id="role" name="role" value={formData.role} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                               <Label htmlFor="email">Email</Label>
                               <Input id="email" name="email" value={formData.email} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                               <Label htmlFor="phone">Phone</Label>
                               <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                               <Label htmlFor="location">Location</Label>
                               <Input id="location" name="location" value={formData.location} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                               <Label htmlFor="linkedin">LinkedIn</Label>
                               <Input id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2 md:col-span-2">
                               <Label htmlFor="portfolio">Portfolio</Label>
                               <Input id="portfolio" name="portfolio" value={formData.portfolio} onChange={handleInputChange} />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Education</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                               <Label htmlFor="institution">Institution</Label>
                               <Input id="institution" name="institution" value={formData.institution} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                               <Label htmlFor="degree">Degree</Label>
                               <Input id="degree" name="degree" value={formData.degree} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                               <Label htmlFor="educationYear">Year</Label>
                               <Input id="educationYear" name="educationYear" value={formData.educationYear} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                               <Label htmlFor="cgpa">CGPA</Label>
                               <Input id="cgpa" name="cgpa" value={formData.cgpa} onChange={handleInputChange} />
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Skills & Achievements</h3>
                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills (comma-separated)</Label>
                            <Textarea id="skills" name="skills" value={formData.skills} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="achievements">Achievements (one per line)</Label>
                            <Textarea id="achievements" name="achievements" value={formData.achievements} onChange={handleInputChange} />
                        </div>

                        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Project 1</h3>
                        <div className="space-y-2">
                            <Label htmlFor="project1Title">Title</Label>
                            <Input id="project1Title" name="project1Title" value={formData.project1Title} onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="project1Description">Description</Label>
                            <Textarea id="project1Description" name="project1Description" value={formData.project1Description} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="project1Impact">Impact</Label>
                                <Input id="project1Impact" name="project1Impact" value={formData.project1Impact} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="project1Tech">Tech Used (comma-separated)</Label>
                                <Input id="project1Tech" name="project1Tech" value={formData.project1Tech} onChange={handleInputChange} />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Project 2</h3>
                         <div className="space-y-2">
                            <Label htmlFor="project2Title">Title</Label>
                            <Input id="project2Title" name="project2Title" value={formData.project2Title} onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="project2Description">Description</Label>
                            <Textarea id="project2Description" name="project2Description" value={formData.project2Description} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="project2Impact">Impact</Label>
                                <Input id="project2Impact" name="project2Impact" value={formData.project2Impact} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="project2Tech">Tech Used (comma-separated)</Label>
                                <Input id="project2Tech" name="project2Tech" value={formData.project2Tech} onChange={handleInputChange} />
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? <LoaderCircle className="animate-spin" /> : "Generate Resume"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </GlassmorphismCard>
            <GlassmorphismCard>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Generated Resume</CardTitle>
                    <Button onClick={handleDownloadPdf} variant="secondary" size="sm" disabled={!generatedResume || isPending}>
                       <Download className="mr-2 h-4 w-4"/> Download PDF
                    </Button>
                </CardHeader>
                <CardContent>
                    {isPending ? (
                        <div className="flex items-center justify-center h-96">
                            <LoaderCircle className="w-8 h-8 animate-spin text-primary"/>
                        </div>
                    ) : generatedResume ? (
                        <div ref={resumeRef} className="prose prose-sm prose-invert max-w-none p-4 border rounded-lg h-[70vh] overflow-y-auto bg-background/50">
                           <ReactMarkdown>{generatedResume}</ReactMarkdown>
                        </div>
                    ) : null}
                </CardContent>
            </GlassmorphismCard>
          </div>
        </motion.div>
      </main>
    </>
  );
}
