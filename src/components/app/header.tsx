'use client';

import { Sparkles, Bell, Search, UploadCloud, Rocket } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/70 backdrop-blur-xl border-b border-white/[0.08] shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 gap-3">
        {/* Left Side: Sidebar Trigger + Search Bar */}
        <div className="flex items-center gap-3 md:gap-5 flex-1 max-w-md">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-white/[0.06] rounded-lg transition-colors" />
          
          {/* Mobile brand title */}
          <Link href="/" className="flex items-center gap-2 font-bold md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
              <Rocket className="size-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground sm:inline hidden">Placement Assistant</span>
          </Link>

          {/* Global Quick Search with Command shortcut */}
          <div className="relative w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search skills, companies, mock drills..."
              className="w-full bg-muted/40 border border-white/[0.08] rounded-xl pl-9 pr-12 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/60 transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-white/[0.06]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Side: Readiness Indicator, Notifications & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Readiness Pill Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
            </span>
            <span className="text-[11px] font-mono font-semibold tracking-wide uppercase">
              ⚡ 88% Placement Ready
            </span>
          </div>

          {/* Quick Notification Bell */}
          <button 
            type="button"
            aria-label="View notifications"
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
          </button>

          {/* Quick Upload Resume Button */}
          <Button
            asChild
            size="sm"
            className="primary-glow-btn text-white font-medium rounded-xl text-xs px-3 sm:px-4 py-1.5 h-8 flex items-center gap-1.5"
          >
            <Link href="/upload-resume">
              <UploadCloud className="size-3.5" />
              <span className="hidden sm:inline">Upload Resume</span>
            </Link>
          </Button>

          {/* User Profile Mini Capsule */}
          <div className="flex items-center gap-2 pl-1 border-l border-white/[0.08]">
            <Avatar className="size-8 rounded-xl border border-primary/40 bg-primary/20">
              <AvatarFallback className="text-xs font-bold text-primary bg-primary/20">
                AM
              </AvatarFallback>
            </Avatar>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-medium leading-none text-foreground">Alex Morgan</div>
              <div className="text-[10px] font-mono text-muted-foreground leading-tight mt-0.5">CS '25</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
