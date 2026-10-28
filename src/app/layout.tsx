import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { AppSidebar } from '@/components/app/sidebar';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Placement Assistant - AI Career Launchpad',
  description: 'AI-powered career acceleration, ATS resume scoring, mock interview simulations, and job market telemetry.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground min-h-screen relative overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground`}>
        {/* GPU-Accelerated Hardware Ambient Background Glows (Zero-lag rasterization) */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform-gpu" 
          aria-hidden="true"
          style={{
            background: `
              radial-gradient(circle 600px at 25% 10%, rgba(139, 92, 246, 0.10), transparent 70%),
              radial-gradient(circle 500px at 85% 40%, rgba(6, 182, 212, 0.08), transparent 70%),
              radial-gradient(circle 550px at 35% 85%, rgba(20, 184, 166, 0.07), transparent 70%)
            `
          }}
        />

        <SidebarProvider>
          <div className="flex min-h-screen bg-background text-foreground relative z-10 w-full">
            <AppSidebar />
            <SidebarInset className="bg-transparent flex-1 flex flex-col min-h-screen">
              <div className="flex flex-1 min-h-screen">
                <div className="flex-1 flex flex-col overflow-auto">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
