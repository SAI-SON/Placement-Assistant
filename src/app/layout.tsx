import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Inter } from 'next/font/google';
import { AppSidebar } from '@/components/app/sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Placement Assistant',
  description: 'AI-powered career assistance and feedback.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background text-foreground">
            <AppSidebar />
            <SidebarInset>
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
