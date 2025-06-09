import Link from 'next/link';
import LiveClock from './LiveClock';
import UserProfileDropdown from './UserProfileDropdown';
import { Building2 } from 'lucide-react';
// import ThemeToggle from '@/components/shared/ThemeToggle'; // If you want a theme toggle

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-screen-2xl">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Building2 className="h-7 w-7 text-primary" />
          <span className="font-headline text-lg sm:text-xl font-semibold text-primary">AttendEase</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <LiveClock />
          </div>
          {/* <ThemeToggle /> */}
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
}
