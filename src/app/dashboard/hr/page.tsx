
"use client";

import AllAttendanceTable from "@/components/hr/AllAttendanceTable";
import EmployeeManagementTable from "@/components/hr/EmployeeManagementTable";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CalendarCheck } from "lucide-react";

export default function HrDashboardPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser && currentUser.designation !== 'HR') {
      // If an Employee user somehow lands here, redirect them
      router.replace('/dashboard/employee');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || currentUser.designation !== 'HR') {
    // Show loading or null if not an HR user or still loading
    return <div className="flex justify-center items-center h-full"><p>Loading HR dashboard...</p></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold">HR Dashboard</h1>
        <p className="text-muted-foreground">Manage employees and oversee attendance records.</p>
      </div>

      <Tabs defaultValue="employee-management" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:w-[450px]">
          <TabsTrigger value="employee-management">
            <Users className="mr-2 h-4 w-4" /> Employee Management
          </TabsTrigger>
          <TabsTrigger value="attendance-overview">
            <CalendarCheck className="mr-2 h-4 w-4" /> Attendance Overview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="employee-management" className="mt-6">
          <EmployeeManagementTable />
        </TabsContent>
        <TabsContent value="attendance-overview" className="mt-6">
          <AllAttendanceTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
