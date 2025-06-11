"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getAllAttendanceRecords } from "@/lib/attendanceService";
import type { AttendanceRecord } from "@/types";
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MyAttendanceTable() {
  const { currentUser } = useAuth();
  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (currentUser) {
      const allRecords = getAllAttendanceRecords();
      const userRecords = allRecords
        .filter(record => record.employeeId === currentUser.id)
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()); // Sort by date descending
      setMyRecords(userRecords);
    }
  }, [currentUser]);

  const formatDisplayTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const date = new Date(); // Use a dummy date object just for formatting
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, 'h:mm a');
  };


  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">My Attendance History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableCaption>{myRecords.length === 0 ? "No attendance records found." : "A list of your recent attendance records."}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(parseISO(record.date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{formatDisplayTime(record.checkInTime)}</TableCell>
                  <TableCell>{formatDisplayTime(record.checkOutTime)}</TableCell>
                  <TableCell>{record.totalHours || 'N/A'}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        record.status === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                        record.status === 'Late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                        record.status === 'Absent' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                      }`}>
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell>{record.remarks || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}