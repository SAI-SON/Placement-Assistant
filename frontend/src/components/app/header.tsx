'use client';

import { useState } from 'react';
import { Sparkles, Bell, Search, UploadCloud, Rocket, LogIn, UserPlus, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

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

          {/* Global Quick Search */}
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
          {/* Live System Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-mono font-semibold tracking-wide uppercase">
              Database Active
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

          {/* User Profile Mini Capsule or Auth Links */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 border-l border-white/[0.08] hover:opacity-85 transition-opacity focus:outline-none">
                  <Avatar className="size-8 rounded-xl border border-primary/40 bg-primary/20">
                    <AvatarFallback className="text-xs font-bold text-primary bg-primary/20">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-medium leading-none text-foreground">{user.name}</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-white/[0.08]">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-semibold text-foreground leading-none">{user.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground leading-none">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/[0.08]" />
                <DropdownMenuItem asChild className="text-xs text-muted-foreground cursor-pointer focus:text-foreground">
                  <Link href="/settings" className="flex items-center w-full">
                    <User className="mr-2 size-3.5" />
                    Account Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-xs text-muted-foreground cursor-pointer focus:text-foreground">
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 size-3.5" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.08]" />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-xs text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 size-3.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/[0.08]">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] rounded-xl px-2.5"
              >
                <Link href="/login">
                  <LogIn className="size-3.5 mr-1" />
                  <span>Sign In</span>
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="h-8 text-xs font-medium bg-white/[0.08] hover:bg-white/[0.12] text-foreground border border-white/[0.08] rounded-xl px-3"
              >
                <Link href="/signup">
                  <UserPlus className="size-3.5 mr-1 text-primary" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
