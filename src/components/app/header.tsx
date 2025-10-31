import { Rocket, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="py-4 px-4 md:px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      <div className="mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Link href="/" className="flex items-center gap-2 text-lg font-bold md:hidden">
                <Rocket className="size-6 text-primary" />
                <span className="text-xl">Placement Assistent</span>
            </Link>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-medium">Jane Doe</span>
            <UserCircle className="size-8 text-primary"/>
        </div>
      </div>
    </header>
  );
}
