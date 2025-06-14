<<<<<<< HEAD

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Building2, UserPlus } from "lucide-react";
// Removed: import { useRouter } from 'next/navigation';

export default function LandingPage() {
  // Removed: const router = useRouter();
  // Removed: const handleHrLoginClick = () => { router.push('/hr-login'); };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 transition-colors duration-300 bg-gradient-to-br from-green-400/20 via-teal-500/20 to-blue-600/20">
      <Card className="w-full max-w-md shadow-xl rounded-xl bg-card/80 backdrop-blur-sm">
=======
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Building2 } from "lucide-react"; // Or a different icon if desired, e.g. Fingerprint

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-br from-background via-primary/5 to-secondary/10 dark:from-slate-950 dark:via-primary/10 dark:to-slate-900 transition-colors duration-300">
      <Card className="w-full max-w-md shadow-xl rounded-xl">
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
        <CardHeader className="text-center p-6 sm:p-8">
          <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-full w-fit">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-headline text-primary tracking-tight">
            Orbinova
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-muted-foreground mt-2">
            Streamlined Office Attendance Management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 sm:px-8 pb-6 sm:pb-8">
          <p className="text-center text-muted-foreground">
<<<<<<< HEAD
            Welcome to Orbinova! Please select your action.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              asChild // Changed to asChild for HR Login
              variant="default"
              className="w-full h-12 text-base font-medium hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:scale-[1.02] focus:ring-2 focus:ring-ring focus:ring-offset-2"
              // onClick handler removed
            >
              <Link href="/hr-login">HR Login</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-12 text-base font-medium border-primary text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:scale-[1.02] focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <Link href="/employee-login">Employee Login</Link>
            </Button>
          </div>
          <div className="mt-4">
            <Button
              asChild
              variant="secondary"
              className="w-full h-12 text-base font-medium transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:scale-[1.02] focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <Link href="/hr-signup">
                <UserPlus className="mr-2 h-5 w-5" /> HR Sign Up
              </Link>
            </Button>
=======
            Welcome to Orbinova! Please select your login type.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/hr-login" passHref>
              <Button 
                variant="default" 
                className="w-full h-12 text-base font-medium hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:scale-[1.02] focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                HR Login
              </Button>
            </Link>
            <Link href="/employee-login" passHref>
              <Button 
                variant="outline" 
                className="w-full h-12 text-base font-medium border-primary text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:scale-[1.02] focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Employee Login
              </Button>
            </Link>
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 sm:mt-12 text-center text-sm text-muted-foreground/80">
        <p>&copy; {new Date().getFullYear()} Orbinova. All rights reserved.</p>
<<<<<<< HEAD
        <p>Created by Debajyoti</p>
=======
        <p className="font-code text-xs mt-1 text-muted-foreground/60">
          {/* Powered by Next.js & Shadcn/UI */}
          Created by Debajyoti
        </p>
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
      </footer>
    </main>
  );
}
<<<<<<< HEAD

    
=======
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
