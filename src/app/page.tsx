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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [copiedTip, setCopiedTip] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const applications = [
    {
      company: 'Stripe',
      logo: 'S',
      logoColor: 'bg-[#635BFF]/20 border-[#635BFF]/40 text-[#635BFF]',
      domain: 'Fintech Infrastructure',
      role: 'Backend Infrastructure Intern',
      match: '94%',
      applied: '2 days ago',
      status: 'Interview Scheduled',
      statusType: 'success',
      action: 'Prep Interview',
      href: '/ai-interview-coach',
    },
    {
      company: 'OpenAI',
      logo: 'AI',
      logoColor: 'bg-[#10A37F]/20 border-[#10A37F]/40 text-[#10A37F]',
      domain: 'Generative AI Platform',
      role: 'Solutions Engineer',
      match: '89%',
      applied: '4 days ago',
      status: 'Under Review',
      statusType: 'primary',
      action: 'Track',
      href: '/upload-resume',
    },
    {
      company: 'Linear',
      logo: 'L',
      logoColor: 'bg-[#5E6AD2]/20 border-[#5E6AD2]/40 text-[#5E6AD2]',
      domain: 'Engineering Tools',
      role: 'Product Designer & Frontend',
      match: '86%',
      applied: '1 week ago',
      status: 'Take-Home Assigned',
      statusType: 'secondary',
      action: 'View Task',
      href: '/career-pathway',
    },
    {
      company: 'Datadog',
      logo: 'DD',
      logoColor: 'bg-[#632CA6]/20 border-[#632CA6]/40 text-[#632CA6]',
      domain: 'Cloud Observability',
      role: 'Distributed Systems Resident',
      match: '91%',
      applied: 'Yesterday',
      status: 'Application Sent',
      statusType: 'neutral',
      action: 'Details',
      href: '/job-news',
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full overflow-y-auto">
        {/* Hero Greeting & Performance Banner */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-white/[0.08]"
        >
          {/* Subtle decorative background gradient */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-mono uppercase tracking-wider font-semibold">
                <ShieldCheck className="size-3.5 text-secondary" />
                Candidate Tier: Elite 12%
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                Welcome back, Alex! 👋
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                You are currently pacing in the top 12% candidate tier for{' '}
                <span className="text-secondary font-medium">Full-Stack &amp; AI Roles</span>. System reports{' '}
                <strong className="text-foreground">3 immediate interview preparations</strong> ready for launch.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.1] text-foreground text-xs font-medium gap-2"
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.reload();
                }}
              >
                <RefreshCw className="size-3.5 text-muted-foreground" />
                Sync Telemetry
              </Button>
              <Button
                asChild
                size="sm"
                className="primary-glow-btn h-10 px-5 rounded-xl text-white text-xs font-semibold gap-2"
              >
                <Link href="/upload-resume">
                  <Zap className="size-3.5 fill-current" />
                  Run Full Audit
                </Link>
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Analytics Performance HUD Pods (4 Grid Telemetry Modules) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Circular ATS Score Gauge */}
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
                    strokeDasharray="84, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-mono font-bold text-foreground">84</span>
                  <span className="text-[9px] text-muted-foreground font-mono -mt-1">/100</span>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1 text-tertiary text-xs font-mono font-bold">
                  <TrendingUp className="size-3.5" />
                  +6 pts from scan
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  High keyword density in Distributed Systems.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-muted-foreground">
              <span>Target: 90+</span>
              <Link href="/upload-resume" className="text-secondary hover:underline font-medium">
                Breakdown →
              </Link>
            </div>
          </motion.div>

          {/* Metric 2: AI Interview Readiness Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass-card-interactive rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Interview Readiness
              </span>
              <Bot className="size-4 text-primary" />
            </div>

            <div className="my-2">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-mono font-bold text-primary">92%</span>
                <span className="text-[10px] font-mono text-tertiary font-bold tracking-wider">
                  CONFIDENCE RATING
                </span>
              </div>
              <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full w-[92%] shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
              </div>
              <p className="text-xs text-muted-foreground mt-2.5">
                Next simulation: <span className="text-foreground font-medium">System Architecture Mock</span> in 2 hrs.
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-muted-foreground">
              <span>Status: Calibrated</span>
              <Link href="/ai-interview-coach" className="text-primary hover:underline font-medium">
                Launch Room →
              </Link>
            </div>
          </motion.div>

          {/* Metric 3: Profile Verification */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card-interactive rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Profile Verification
              </span>
              <ShieldCheck className="size-4 text-tertiary" />
            </div>

            <div className="my-2">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-mono font-bold text-tertiary">96%</span>
                <span className="text-[10px] font-mono text-muted-foreground font-semibold">4/4 VERIFIED</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-secondary flex items-center gap-1">
                  <Check className="size-2.5" /> LeetCode
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-secondary flex items-center gap-1">
                  <Check className="size-2.5" /> GitHub
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-secondary flex items-center gap-1">
                  <Check className="size-2.5" /> LinkedIn
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2.5">
                All external credentials synced &amp; verified.
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-muted-foreground">
              <span>Last Sync: 12m ago</span>
              <Link href="/career-pathway" className="text-tertiary hover:underline font-medium">
                Skills Graph →
              </Link>
            </div>
          </motion.div>

          {/* Metric 4: Live Market Match Index */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="glass-card-interactive rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Live Market Match
              </span>
              <Radar className="size-4 text-secondary" />
            </div>

            <div className="my-2">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-2xl font-mono font-bold text-secondary">142</span>
                <span className="text-[10px] font-mono text-tertiary font-bold">&gt;85% ATS MATCH</span>
              </div>
              <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden mt-1.5">
                <div className="bg-gradient-to-r from-secondary to-tertiary h-full rounded-full w-[78%]" />
              </div>
              <p className="text-xs text-muted-foreground mt-2.5">
                Active postings aligned to your exact tech stack.
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-tertiary font-medium">+18 today</span>
              <Link href="/job-news" className="text-secondary hover:underline font-medium">
                Inspect Pool →
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Access Matrix (Interactive Bento Cards with Neon Borders) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Feature 1: Instant Resume Scanner */}
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
                v4.2 Analysis: 3 high-impact keywords missing for Google &amp; Stripe engineering roles.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl bg-white/[0.03] hover:bg-primary/20 hover:text-primary hover:border-primary/40 text-xs font-mono justify-between">
              <Link href="/upload-resume">
                <span>Scan New Version</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </motion.div>

          {/* Feature 2: Mock Interview Coach */}
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
                AI Behavioral &amp; Technical practice with live audio, STAR evaluation, and real-time feedback.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl bg-white/[0.03] hover:bg-secondary/20 hover:text-secondary hover:border-secondary/40 text-xs font-mono justify-between">
              <Link href="/ai-interview-coach">
                <span>Start 15-min Session</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </motion.div>

          {/* Feature 3: Career Pathway Roadmap */}
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
              <h2 className="text-base font-semibold text-foreground mb-1">Career Pathway Roadmap</h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Level 4 of 6: Master Distributed Caching, Redis cluster tuning, and System Architecture.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl bg-white/[0.03] hover:bg-tertiary/20 hover:text-tertiary hover:border-tertiary/40 text-xs font-mono justify-between">
              <Link href="/career-pathway">
                <span>View Milestones</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </motion.div>

          {/* Feature 4: Real-time Job Radar */}
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
              <h2 className="text-base font-semibold text-foreground mb-1">Real-time Job Radar</h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                18 new high-match tech postings scraped in the last 4 hours across Tier-1 companies.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl bg-white/[0.03] hover:bg-[#A078FF]/20 hover:text-[#A078FF] hover:border-[#A078FF]/40 text-xs font-mono justify-between">
              <Link href="/job-news">
                <span>Explore Radar</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Main Content Split View: Pipeline Tracker + AI Copilot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center Panel (8 Cols): Application Activity Pipeline */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="lg:col-span-8 glass-panel rounded-2xl p-5 sm:p-6 border border-white/[0.08]"
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-foreground">Application Activity Pipeline</h2>
                <p className="text-xs text-muted-foreground">Live telemetry tracking across verified career pipelines</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-muted-foreground text-[11px] font-mono border border-white/[0.08]">
                  Total Active: 14
                </span>
                <Button asChild variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs gap-1 border-white/[0.08]">
                  <Link href="/upload-resume">
                    + New Application
                  </Link>
                </Button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-3">Company</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">ATS Match</th>
                    <th className="py-3 px-3">Applied</th>
                    <th className="py-3 px-3">Stage Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-xs">
                  {applications.map((app) => (
                    <tr key={app.company} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-3.5 px-3 flex items-center gap-2.5">
                        <div className={cn("size-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0", app.logoColor)}>
                          {app.logo}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{app.company}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{app.domain}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-foreground font-medium">{app.role}</td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary font-mono text-[11px] font-semibold">
                          <span className="size-1.5 rounded-full bg-secondary" />
                          {app.match}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-muted-foreground font-mono text-[11px]">{app.applied}</td>
                      <td className="py-3.5 px-3">
                        {app.statusType === 'success' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary border border-tertiary/30 font-mono text-[10px] uppercase font-bold tracking-wide">
                            <span className="size-1.5 rounded-full bg-tertiary animate-ping" />
                            {app.status}
                          </span>
                        )}
                        {app.statusType === 'primary' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 font-mono text-[10px] uppercase font-semibold">
                            {app.status}
                          </span>
                        )}
                        {app.statusType === 'secondary' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-mono text-[10px] uppercase font-semibold">
                            {app.status}
                          </span>
                        )}
                        {app.statusType === 'neutral' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] text-muted-foreground border border-white/[0.08] font-mono text-[10px] uppercase font-semibold">
                            {app.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-7 px-3 rounded-lg text-xs font-medium border-white/[0.08]",
                            app.statusType === 'success' 
                              ? "bg-secondary/10 hover:bg-secondary text-secondary hover:text-black border-secondary/40 font-semibold"
                              : "hover:bg-white/[0.08]"
                          )}
                        >
                          <Link href={app.href}>
                            {app.action}
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Right Panel (4 Cols): AI Career Copilot & Recommendations */}
          <motion.aside
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="lg:col-span-4 space-y-4"
          >
            {/* AI Insights & High Impact Tip */}
            <div className="glass-panel rounded-2xl p-5 sm:p-6 border-t-2 border-t-primary border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <h2 className="text-base font-bold text-foreground">AI Career Copilot</h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                  REAL-TIME
                </span>
              </div>

              {/* High Impact Tip Box */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-primary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-mono font-bold uppercase">
                    High Impact Tip
                  </span>
                  <span className="text-[11px] text-tertiary font-mono font-bold">+14% Odds</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  Add <span className="text-secondary font-mono font-semibold">"Kafka event streaming"</span> to your project bullets to boost Datadog interview probability by <strong className="text-tertiary">+14%</strong>.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white border-primary/40 text-xs font-mono font-semibold"
                  onClick={() => {
                    navigator.clipboard?.writeText("Architected resilient pub-sub event pipelines with Apache Kafka handling 10k+ events/sec.");
                    setCopiedTip(true);
                    setTimeout(() => setCopiedTip(false), 2000);
                  }}
                >
                  {copiedTip ? '✓ Copied Suggestion!' : 'Copy Bullet Suggestion'}
                </Button>
              </div>

              {/* Scheduled Practice Reminder */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                <Calendar className="size-4 text-secondary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-foreground">Behavioral Drill Scheduled</div>
                  <div className="text-[11px] text-muted-foreground">
                    STAR method for conflict resolution today at 4:30 PM.
                  </div>
                  <Link href="/ai-interview-coach" className="text-secondary text-[11px] font-medium hover:underline inline-block mt-1">
                    Join Session Room →
                  </Link>
                </div>
              </div>

              {/* Skill Gap Alert */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                <Layers className="size-4 text-tertiary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-foreground">Skill Gap Alert</div>
                  <div className="text-[11px] text-muted-foreground">
                    System Design: Microservices patterns trending in 78% of your target postings.
                  </div>
                  <Link href="/career-pathway" className="text-tertiary text-[11px] font-medium hover:underline inline-block mt-1">
                    Take 5-min Skill Quiz →
                  </Link>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </main>
    </>
  );
}
