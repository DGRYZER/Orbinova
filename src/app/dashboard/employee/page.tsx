
"use client";

import MarkAttendanceCard from "@/components/employee/MarkAttendanceCard";
import MyAttendanceTable from "@/components/employee/MyAttendanceTable";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmployeeDashboardPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser && currentUser.designation !== 'Employee') {
      // If an HR user somehow lands here, redirect them to their dashboard
      router.replace('/dashboard/hr');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || currentUser.designation !== 'Employee') {
    // Show loading or null if not an employee or still loading
    return <div className="flex justify-center items-center h-full"><p>Loading employee dashboard...</p></div>;
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold">Welcome, {currentUser.name}!</h1>
        <p className="text-muted-foreground">Manage your attendance and view your records.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <MarkAttendanceCard />
        </div>
        <div className="lg:col-span-2">
          <MyAttendanceTable />
        </div>
      </div>
    </div>
  );
}
