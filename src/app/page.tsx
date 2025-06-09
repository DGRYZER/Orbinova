import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Building2 } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-background to-blue-100 dark:from-background dark:to-slate-900">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/20 rounded-full w-fit">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-4xl font-headline text-primary">AttendEase</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Streamlined Office Attendance Management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-foreground">
            Welcome to AttendEase! Please select your login type.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href="/hr-login" passHref>
              <Button variant="default" className="w-full text-base py-6 bg-primary hover:bg-primary/90">
                HR Login
              </Button>
            </Link>
            <Link href="/employee-login" passHref>
              <Button variant="outline" className="w-full text-base py-6 border-primary text-primary hover:bg-primary/10">
                Employee Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AttendEase. All rights reserved.</p>
        <p className="font-code text-xs mt-1">Powered by Next.js & Shadcn/UI</p>
      </footer>
    </main>
  );
}