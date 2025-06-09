"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { markCheckIn, markCheckOut, getTodaysAttendanceForEmployee } from "@/lib/attendanceService";
import type { AttendanceRecord } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { LogIn, LogOut, CheckCircle, Clock } from "lucide-react";
import { format, parseISO } from 'date-fns';

export default function MarkAttendanceCard() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [todaysRecord, setTodaysRecord] = useState<AttendanceRecord | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const record = getTodaysAttendanceForEmployee(currentUser.id);
      setTodaysRecord(record);
    }
  }, [currentUser]);

  const handleCheckIn = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const record = markCheckIn(currentUser.id, currentUser.name);
      setTodaysRecord(record);
      toast({
        title: "Checked In",
        description: `Successfully checked in at ${record.checkInTime}. Status: ${record.status}.`,
        variant: "default",
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to check in.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const record = markCheckOut(currentUser.id);
      if (record) {
        setTodaysRecord(record);
        toast({
          title: "Checked Out",
          description: `Successfully checked out at ${record.checkOutTime}. Total hours: ${record.totalHours}.`,
          variant: "default",
        });
      } else {
        toast({ title: "Error", description: "No check-in record found for today.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to check out.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDisplayTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    // Assuming timeString is 'HH:mm:ss'
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, 'h:mm a');
  };


  const canCheckIn = !todaysRecord?.checkInTime;
  const canCheckOut = todaysRecord?.checkInTime && !todaysRecord?.checkOutTime;

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Mark Your Attendance</CardTitle>
        <CardDescription>Today is {format(new Date(), "MMMM d, yyyy")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {todaysRecord?.checkInTime && (
          <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
            <div className="flex items-center text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p className="font-medium">
                Checked In: {formatDisplayTime(todaysRecord.checkInTime)} (Status: {todaysRecord.status})
              </p>
            </div>
          </div>
        )}

        {todaysRecord?.checkOutTime && (
          <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
             <div className="flex items-center text-blue-700 dark:text-blue-300">
              <Clock className="h-5 w-5 mr-2" />
              <p className="font-medium">
                Checked Out: {formatDisplayTime(todaysRecord.checkOutTime)} (Total: {todaysRecord.totalHours || 'N/A'})
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <Button 
            onClick={handleCheckIn} 
            disabled={!canCheckIn || isLoading} 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <LogIn className="mr-2 h-4 w-4" /> Check In
          </Button>
          <Button 
            onClick={handleCheckOut} 
            disabled={!canCheckOut || isLoading} 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="mr-2 h-4 w-4" /> Check Out
          </Button>
        </div>
        {isLoading && <p className="text-sm text-center text-muted-foreground">Processing...</p>}
      </CardContent>
    </Card>
  );
}