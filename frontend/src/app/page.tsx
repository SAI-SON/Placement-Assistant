'use client';

import { Header } from '@/components/app/header';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText,
  Bot,
  Mic,
  Compass,
  Newspaper,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  Radar,
  Calendar,
  Layers,
  Clock,
  ExternalLink,
  Database,
  AlertCircle,
  Briefcase,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DashboardTelemetry {
  user: {
    name: string;
    email: string;
    target_role: string;
    location: string;
  } | null;
  metrics: {
    atsScore: number | null;
    resumeFileName: string | null;
    resumeScanDate: string | null;
    totalResumesAnalyzed: number;
    totalMockInterviews: number;
    totalSavedResumes: number;
    totalCoachMessages: number;
  };
  latestResumeAnalysis: {
    id: number;
    file_name: string;
    score: number;
    summary: string;
    what_we_loved: string[];
    whats_holding_you_back: string[];
    improvements: Array<{ title: string; whatsWrong: string; howToFix: string }>;
    created_at: string;
  } | null;
  recentInterviews: Array<{
    id: number;
    session_id: string;
    job_description: string;
    overall_score: number;
    status: string;
    created_at: string;
  }>;
  recentSavedResumes: Array<{
    id: number;
    name: string;
    role: string;
    created_at: string;
  }>;
  recentNews: Array<{
    title: string;
    source: string;
    url: string;
    publishedAt: string;
  }>;
}

export default function Home() {
  const { user, token, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedTip, setCopiedTip] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let res;
      try {
        res = await fetch(`${backendBase}/api/dashboard`, { headers });
      } catch {
        res = await fetch('/api/backend/dashboard', { headers });
      }

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || 'Failed to retrieve database telemetry');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Unable to connect to backend telemetry server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const candidateName = user?.name || data?.user?.name || 'Candidate';
  const targetRole = user?.target_role || data?.user?.target_role || 'Software Engineer';
  const atsScore = data?.metrics?.atsScore;
  const latestAnalysis = data?.latestResumeAnalysis;

  return (
    <>
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full overflow-y-auto">
        {/* Hero Greeting & Real Performance Banner */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-white/[0.08]"
        >
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-mono uppercase tracking-wider font-semibold">
                <Database className="size-3.5 text-secondary" />
                Live PostgreSQL Telemetry
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                {user?.name ? `Welcome back, ${user.name}!` : 'Welcome to Placement Assistant AI'}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                {user?.target_role ? (
                  <>Target Role: <span className="text-secondary font-medium">{user.target_role}</span></>
                ) : (
                  <span className="text-secondary font-medium">Candidate AI Copilot</span>
                )}
                {atsScore !== null && atsScore !== undefined ? (
                  <>
                    {' '}• Latest verified ATS audit scored{' '}
                    <strong className="text-foreground font-mono">{atsScore}/100</strong>.
                  </>
                ) : (
                  <>
                    {' '}• No resume scanned yet. Upload your resume to calculate your verified ATS score.
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                disabled={loading}
                className="h-10 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.1] text-foreground text-xs font-medium gap-2"
              >
                <RefreshCw className={`size-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
                Sync Telemetry
              </Button>
              <Button
                asChild
                size="sm"
                className="primary-glow-btn h-10 px-5 rounded-xl text-white text-xs font-semibold gap-2"
              >
                <Link href="/upload-resume">
                  <Zap className="size-3.5 fill-current" />
                  Scan Resume
                </Link>
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Real Analytics Performance HUD Pods */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pod 1: Real ATS Score */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card-interactive rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                ATS Score Index
              </span>
              <FileText className="size-4 text-secondary" />
            </div>

            <div className="flex items-center gap-4 my-2">
              {atsScore !== null && atsScore !== undefined ? (
                <>
                  <div className="relative size-20 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/[0.08] stroke-current"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-secondary stroke-current hud-gauge-glow"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeDasharray={`${atsScore}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-mono font-bold text-foreground">{atsScore}</span>
                      <span className="text-[9px] text-muted-foreground font-mono -mt-1">/100</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                      {data?.metrics?.resumeFileName || 'Uploaded Resume'}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      {data?.metrics?.resumeScanDate
                        ? new Date(data.metrics.resumeScanDate).toLocaleDateString()
                        : 'Saved in DB'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-2">
                  <span className="text-2xl font-mono font-bold text-muted-foreground">--</span>
                  <p className="text-xs text-muted-foreground mt-1">No resume scanned yet</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-muted-foreground">
              <span>{data?.metrics?.totalResumesAnalyzed || 0} scan(s) in DB</span>
              <Link href="/upload-resume" className="text-secondary hover:underline font-medium">
                Scan New →
              </Link>
            </div>
          </motion.div>

          {/* Pod 2: Real Mock Interview Telemetry */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass-card-interactive rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Mock Interview Drills
              </span>
              <Mic className="size-4 text-primary" />
            </div>

            <div className="my-2">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-mono font-bold text-primary">
                  {data?.metrics?.totalMockInterviews || 0}
                </span>
                <span className="text-[10px] font-mono text-tertiary font-bold tracking-wider">
                  SESSIONS RECORDED
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {data?.recentInterviews && data.recentInterviews.length > 0
                  ? `Latest drill: ${data.recentInterviews[0].job_description.slice(0, 45)}...`
                  : 'Practice behavioral & technical questions with AI STAR evaluation.'}
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-muted-foreground">
              <span>Status: Active</span>
              <Link href="/ai-interview-coach" className="text-primary hover:underline font-medium">
                Launch Simulator →
              </Link>
            </div>
          </motion.div>

          {/* Pod 3: Real Saved Resumes in Builder */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card-interactive rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Saved Resumes
              </span>
              <Briefcase className="size-4 text-tertiary" />
            </div>

            <div className="my-2">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-mono font-bold text-tertiary">
                  {data?.metrics?.totalSavedResumes || 0}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground font-semibold">IN POSTGRESQL</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {data?.recentSavedResumes && data.recentSavedResumes.length > 0
                  ? `Latest: ${data.recentSavedResumes[0].name} (${data.recentSavedResumes[0].role})`
                  : 'Generate ATS single-column resumes with instant PDF export.'}
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-muted-foreground">
              <span>Resume Builder</span>
              <Link href="/resume-templates" className="text-tertiary hover:underline font-medium">
                Open Builder →
              </Link>
            </div>
          </motion.div>

          {/* Pod 4: AI Career Coach Chat History */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="glass-card-interactive rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Career Coach Chats
              </span>
              <Bot className="size-4 text-secondary" />
            </div>

            <div className="my-2">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-2xl font-mono font-bold text-secondary">
                  {data?.metrics?.totalCoachMessages || 0}
                </span>
                <span className="text-[10px] font-mono text-tertiary font-bold">MESSAGES</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                Real-time AI mentorship for salary negotiation, project bullets, and career roadmaps.
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-muted-foreground">
              <span>Interactive Copilot</span>
              <Link href="/ai-coach" className="text-secondary hover:underline font-medium">
                Open Chat →
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Access Matrix */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass-card-interactive rounded-2xl p-5 relative group border-l-4 border-l-primary flex flex-col justify-between"
          >
            <div>
              <div className="size-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="size-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1">Instant Resume Scanner</h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Automated ATS scoring, keyword match analysis, and metric-driven rewrite suggestions.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl bg-white/[0.03] hover:bg-primary/20 hover:text-primary hover:border-primary/40 text-xs font-mono justify-between">
              <Link href="/upload-resume">
                <span>Scan New Resume</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="glass-card-interactive rounded-2xl p-5 relative group border-l-4 border-l-secondary flex flex-col justify-between"
          >
            <div>
              <div className="size-10 rounded-xl bg-secondary/20 border border-secondary/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Mic className="size-5 text-secondary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1">Mock Interview Coach</h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Adaptive question generation, STAR-method rubric scoring, and immediate improvement feedback.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl bg-white/[0.03] hover:bg-secondary/20 hover:text-secondary hover:border-secondary/40 text-xs font-mono justify-between">
              <Link href="/ai-interview-coach">
                <span>Start Practice Drill</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="glass-card-interactive rounded-2xl p-5 relative group border-l-4 border-l-tertiary flex flex-col justify-between"
          >
            <div>
              <div className="size-10 rounded-xl bg-tertiary/20 border border-tertiary/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Compass className="size-5 text-tertiary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1">Career Pathway & Videos</h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Curated technical roadmaps and embedded YouTube masterclasses based on your target skills.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl bg-white/[0.03] hover:bg-tertiary/20 hover:text-tertiary hover:border-tertiary/40 text-xs font-mono justify-between">
              <Link href="/career-pathway">
                <span>Explore Pathway</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="glass-card-interactive rounded-2xl p-5 relative group border-l-4 border-l-[#A078FF] flex flex-col justify-between"
          >
            <div>
              <div className="size-10 rounded-xl bg-[#A078FF]/20 border border-[#A078FF]/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Newspaper className="size-5 text-[#A078FF]" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1">Tech Job Market Radar</h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Verified regional placement and tech hiring news fetched directly from live industry APIs.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl bg-white/[0.03] hover:bg-[#A078FF]/20 hover:text-[#A078FF] hover:border-[#A078FF]/40 text-xs font-mono justify-between">
              <Link href="/job-news">
                <span>Open Job News</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Main Content Split View: Real Database Pipeline + Real AI Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel (8 Cols): Real Candidate Pipeline (Interviews & Saved Resumes) */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="lg:col-span-8 glass-panel rounded-2xl p-5 sm:p-6 border border-white/[0.08]"
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-foreground">Real Candidate Activity & Drills</h2>
                <p className="text-xs text-muted-foreground">
                  Actual mock interview sessions and generated resumes saved in PostgreSQL
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs gap-1 border-white/[0.08]">
                  <Link href="/ai-interview-coach">
                    <PlusCircle className="size-3.5" />
                    New Interview Drill
                  </Link>
                </Button>
              </div>
            </div>

            {/* Real Data Table */}
            {((data?.recentInterviews && data.recentInterviews.length > 0) ||
              (data?.recentSavedResumes && data.recentSavedResumes.length > 0)) ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Subject / Role</th>
                      <th className="py-3 px-3">Status / Score</th>
                      <th className="py-3 px-3">Recorded Date</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-xs">
                    {/* Render Real Mock Interviews */}
                    {data?.recentInterviews.map((session) => (
                      <tr key={session.session_id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-mono text-[10px] font-semibold">
                            <Mic className="size-3" />
                            Mock Interview
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-foreground line-clamp-1">
                            {session.job_description}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            ID: {session.session_id.slice(0, 16)}...
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary border border-tertiary/30 font-mono text-[10px] uppercase font-bold">
                            <span className="size-1.5 rounded-full bg-tertiary" />
                            {session.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground font-mono text-[11px]">
                          {new Date(session.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Button asChild variant="outline" size="sm" className="h-7 px-3 rounded-lg text-xs font-medium border-white/[0.08] hover:bg-white/[0.08]">
                            <Link href="/ai-interview-coach">
                              Launch
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {/* Render Real Saved Resumes */}
                    {data?.recentSavedResumes.map((resume) => (
                      <tr key={resume.id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-mono text-[10px] font-semibold">
                            <FileText className="size-3" />
                            Resume Builder
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-foreground">{resume.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{resume.role}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] text-muted-foreground border border-white/[0.08] font-mono text-[10px] uppercase font-semibold">
                            Saved in DB
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground font-mono text-[11px]">
                          {new Date(resume.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Button asChild variant="outline" size="sm" className="h-7 px-3 rounded-lg text-xs font-medium border-white/[0.08] hover:bg-white/[0.08]">
                            <Link href="/resume-templates">
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="size-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground">
                  <Database className="size-6" />
                </div>
                <div className="text-sm font-semibold text-foreground">No Recorded Drills or Resumes Yet</div>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Start your first AI mock interview session or generate a resume in the builder to see your real tracked pipeline here.
                </p>
                <div className="flex gap-2 pt-1">
                  <Button asChild size="sm" className="primary-glow-btn text-white text-xs rounded-xl h-8">
                    <Link href="/ai-interview-coach">
                      Start Interview Drill
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="text-xs rounded-xl h-8 border-white/[0.08]">
                    <Link href="/resume-templates">
                      Build Resume
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.section>

          {/* Right Panel (4 Cols): Real AI Career Insights from Latest Scan */}
          <motion.aside
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="lg:col-span-4 space-y-4"
          >
            {/* Real AI Insights from Database */}
            <div className="glass-panel rounded-2xl p-5 sm:p-6 border-t-2 border-t-primary border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <h2 className="text-base font-bold text-foreground">Verified AI Audit</h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                  POSTGRESQL
                </span>
              </div>

              {latestAnalysis ? (
                <>
                  {/* Real Summary */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[10px] font-mono font-bold uppercase">
                        Audit Summary
                      </span>
                      <span className="text-[11px] font-mono text-tertiary font-bold">
                        Score: {latestAnalysis.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed line-clamp-3">
                      {latestAnalysis.summary}
                    </p>
                  </div>

                  {/* Real Improvement Highlight */}
                  {latestAnalysis.improvements && latestAnalysis.improvements.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                      <div className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                        <TrendingUp className="size-3.5" />
                        <span>Recommended Fix</span>
                      </div>
                      <div className="text-xs font-medium text-foreground">
                        {latestAnalysis.improvements[0].title}
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-snug">
                        {latestAnalysis.improvements[0].howToFix}
                      </div>
                    </div>
                  )}

                  {/* Real Strength Highlight */}
                  {latestAnalysis.what_we_loved && latestAnalysis.what_we_loved.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                      <div className="text-xs font-semibold text-tertiary flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        <span>Key Strength</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-snug">
                        {latestAnalysis.what_we_loved[0]}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-2">
                  <FileText className="size-6 text-muted-foreground mx-auto" />
                  <p className="text-xs font-medium text-foreground">No Resume Audit On File</p>
                  <p className="text-[11px] text-muted-foreground">
                    Upload your resume in PDF/DOCX format to get your real AI evaluation, ATS score, and action plan.
                  </p>
                  <Button asChild size="sm" className="primary-glow-btn text-white text-xs rounded-xl h-8 mt-2 w-full">
                    <Link href="/upload-resume">
                      Scan Resume Now
                    </Link>
                  </Button>
                </div>
              )}

              {/* Real Tech Hiring Headlines */}
              {data?.recentNews && data.recentNews.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06] space-y-2.5">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Live Industry Pulse</span>
                    <Newspaper className="size-3.5 text-secondary" />
                  </div>
                  {data.recentNews.map((news, idx) => (
                    <a
                      key={idx}
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                    >
                      <div className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {news.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5 flex items-center justify-between">
                        <span>{news.source}</span>
                        <ExternalLink className="size-2.5" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </main>
    </>
  );
}
