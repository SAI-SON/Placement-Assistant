import { Rocket, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="py-3 px-3 sm:py-4 sm:px-4 md:px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      <div className="mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger />
          {/* Mobile: icon only on xs, icon + short name on sm, full name on md (hidden on md+ since sidebar shows it) */}
          <Link href="/" className="flex items-center gap-1.5 font-bold md:hidden">
            <Rocket className="size-5 sm:size-6 text-primary shrink-0" />
            <span className="hidden sm:inline text-base sm:text-lg">Placement Assistant</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:inline text-sm text-muted-foreground font-medium">Jane Doe</span>
          <UserCircle className="size-7 sm:size-8 text-primary" />
        </div>
      </div>
    </header>
  );
}
