'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  Bot,
  Mic,
  Compass,
  Newspaper,
  Rocket,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function AppSidebar() {
  const { open } = useSidebar();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const menuItems = [
    { href: '/', id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', tag: 'Live' },
    { href: '/upload-resume', id: 'upload-resume', icon: UploadCloud, label: 'Resume Scanner', tag: 'AI' },
    { href: '/ai-coach', id: 'ai-coach', icon: Bot, label: 'AI Resume Coach' },
    { href: '/ai-interview-coach', id: 'ai-interview-coach', icon: Mic, label: 'Interview Coach', tag: 'Sim' },
    { href: '/resume-templates', id: 'resume-templates', icon: FileText, label: 'Resume Builder' },
    { href: '/career-pathway', id: 'career-pathway', icon: Compass, label: 'Career Pathway' },
    { href: '/job-news', id: 'job-news', icon: Newspaper, label: 'Job Market Radar' },
  ];

  const activeSection = useMemo(() => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/upload-resume')) return 'upload-resume';
    if (pathname.startsWith('/resume-templates')) return 'resume-templates';
    if (pathname.startsWith('/ai-coach')) return 'ai-coach';
    if (pathname.startsWith('/ai-interview-coach')) return 'ai-interview-coach';
    if (pathname.startsWith('/career-pathway')) return 'career-pathway';
    if (pathname.startsWith('/job-news')) return 'job-news';
    return '';
  }, [pathname]);

  return (
    <Sidebar className="border-r border-white/[0.08] bg-[#0A0E18]/95 backdrop-blur-xl">
      {/* Brand Header */}
      <SidebarHeader className="p-4 border-b border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="size-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
            <Rocket className="size-5 text-white" />
          </div>
          {open && (
            <div className="overflow-hidden">
              <span className="text-base font-bold tracking-tight text-foreground block truncate">
                Placement Assistant
              </span>
              <span className="text-[10px] font-mono text-secondary tracking-widest uppercase block">
                AI Career Launchpad
              </span>
            </div>
          )}
        </motion.div>
      </SidebarHeader>

      {/* Navigation Links */}
      <SidebarContent className="p-3">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = isClient ? activeSection === item.id : false;
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "relative h-10 px-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-white/[0.08] text-secondary font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  <Link href={item.href} className="flex items-center gap-3 w-full">
                    {/* Active glowing indicator pill */}
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-glow"
                        className="absolute inset-y-1.5 left-1 w-1 rounded-full bg-secondary shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn(
                      "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                      isActive ? "text-secondary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    {open && (
                      <div className="flex items-center justify-between flex-1 overflow-hidden">
                        <span className="text-xs font-medium truncate">{item.label}</span>
                        {item.tag && (
                          <span className={cn(
                            "text-[9px] font-mono px-1.5 py-0.5 rounded-full border",
                            isActive 
                              ? "bg-secondary/20 text-secondary border-secondary/40 font-semibold"
                              : "bg-white/[0.04] text-muted-foreground border-white/[0.08]"
                          )}>
                            {item.tag}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer with Student Profile & Status */}
      {open && (
        <SidebarFooter className="p-3 border-t border-white/[0.06]">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="size-8 rounded-lg border border-primary/30 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  AM
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-foreground truncate">Alex Morgan</div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">CS Grad '25</div>
              </div>
            </div>
            <div className="size-2 rounded-full bg-tertiary animate-pulse shrink-0" title="Online & Telemetry Synced" />
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
