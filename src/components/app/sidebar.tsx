
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Bot, LayoutDashboard, Mic, Rocket, UploadCloud, Newspaper, Compass, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

export function AppSidebar() {
  const { open } = useSidebar();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const menuItems = [
    { href: '/', id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/upload-resume', id: 'upload-resume', icon: UploadCloud, label: 'Upload Resume' },
    { href: '/resume-templates', id: 'resume-templates', icon: FileText, label: 'Resume Templates' },
    { href: '/ai-coach', id: 'ai-coach', icon: Bot, label: 'AI Resume Coach' },
    { href: '/ai-interview-coach', id: 'ai-interview-coach', icon: Mic, label: 'Interview Coach' },
    { href: '/career-pathway', id: 'career-pathway', icon: Compass, label: 'Career Pathway' },
    { href: '/job-news', id: 'job-news', icon: Newspaper, label: 'Local Job News' },
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
    <Sidebar>
      <SidebarHeader>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn("flex items-center gap-2")}
        >
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Rocket className="size-7 text-primary" />
            <span className={cn("text-xl", !open && "hidden")}>Placement Assistant</span>
          </Link>
        </motion.div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isClient ? activeSection === item.id : false}
                  tooltip={item.label}
                  className="relative"
                >
                  <Link href={item.href} className="flex items-center gap-3 w-full">
                    {isClient && activeSection === item.id && (
                      <motion.div
                        layoutId="active-tab-indicator"
                        className="absolute inset-y-1 left-1 w-1 bg-primary rounded-full"
                        style={{ borderRadius: '9999px' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className="z-10 shrink-0" />
                    <span className={cn("z-10", !open && "hidden")}>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </motion.div>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
