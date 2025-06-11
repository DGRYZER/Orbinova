
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAllAttendanceRecords, upsertAttendanceRecord } from "@/lib/attendanceService";
import type { AttendanceRecord } from "@/types";
import { format, parseISO, isValid } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, Edit3, Save, XCircle, CalendarDays } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';


interface EditableCellProps {
  value: string | undefined;
  onChange: (value: string) => void;
  type?: 'time' | 'text' | 'select';
  options?: string[]; // For select type
  recordId: string;
  field: keyof AttendanceRecord;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onChange, type = 'text', options, recordId, field }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleSave = () => {
    onChange(inputValue);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div onClick={() => setIsEditing(true)} className="cursor-pointer min-h-[24px]">
        {type === 'time' ? (value ? format(parseISO(`2000-01-01T${value}`), 'h:mm a') : 'N/A') : (value || 'N/A')}
      </div>
    );
  }

  if (type === 'select' && options) {
    return (
      <Select value={inputValue} onValueChange={(val) => { onChange(val); setIsEditing(false); }}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type={type === 'time' ? 'time' : 'text'}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className="h-8 text-xs"
        autoFocus
      />
    </div>
  );
};


export default function AllAttendanceTable() {
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const fetchRecords = () => {
    const records = getAllAttendanceRecords().sort((a, b) => {
      const dateComparison = parseISO(b.date).getTime() - parseISO(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      return (a.employeeName || "").localeCompare(b.employeeName || "");
    });
    setAllRecords(records);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    let recordsToFilter = allRecords;
    if (searchTerm) {
      recordsToFilter = recordsToFilter.filter(record =>
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (dateFilter) {
      const formattedDateFilter = format(dateFilter, 'yyyy-MM-dd');
      recordsToFilter = recordsToFilter.filter(record => record.date === formattedDateFilter);
    }
    setFilteredRecords(recordsToFilter);
  }, [searchTerm, dateFilter, allRecords]);

  const formatDisplayTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    try {
      // Check if timeString is a valid time format (e.g., HH:mm or HH:mm:ss)
      const [hours, minutes] = timeString.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return 'Invalid Time';
      }
      const date = new Date(); // Use a dummy date object just for formatting
      date.setHours(hours);
      date.setMinutes(minutes);
      return format(date, 'h:mm a');
    } catch (error) {
      return 'Invalid Time';
    }
  };
  
  const handleCellChange = (recordId: string, field: keyof AttendanceRecord, value: string) => {
    const recordToUpdate = allRecords.find(r => r.id === recordId);
    if (recordToUpdate) {
      let updatedValue: string | undefined = value;
      
      if (field === 'checkInTime' || field === 'checkOutTime') {
        // Validate time format HH:mm
        if (value && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
            toast({ variant: "destructive", title: "Invalid Time", description: "Please use HH:mm format (e.g., 09:30 or 17:00)." });
            // Re-fetch to revert optimistic update or keep old value
            fetchRecords(); 
            return;
        }
         // Append :00 if only HH:mm is provided
        if (value && value.match(/^\d{2}:\d{2}$/)) {
          updatedValue = `${value}:00`;
        } else if (!value) { // If value is cleared, set to undefined
          updatedValue = undefined;
        }
      }


      const updatedRecord: AttendanceRecord = { ...recordToUpdate, [field]: updatedValue };
      
      // If status is changed to "Absent" or "On Leave", clear times
      if (field === 'status' && (value === 'Absent' || value === 'On Leave')) {
        updatedRecord.checkInTime = undefined;
        updatedRecord.checkOutTime = undefined;
        updatedRecord.totalHours = undefined;
        if (value === 'Absent') updatedRecord.status = 'Absent';
        if (value === 'On Leave') updatedRecord.status = 'On Leave';
      } else if (field === 'status' && value !== 'Absent' && value !== 'On Leave' && !updatedRecord.checkInTime) {
        // If status is changed to Present/Late but no check-in time, it's inconsistent
        // For simplicity, we won't auto-fill time here but rely on HR to add it.
        // Status will be re-evaluated by upsertAttendanceRecord based on times.
      }


      upsertAttendanceRecord(updatedRecord);
      fetchRecords(); // Refresh data from source
      toast({ title: "Success", description: "Record updated successfully." });
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRecords.map(r => ({
      "Employee ID": r.employeeId,
      "Employee Name": r.employeeName,
      "Date": r.date,
      "Check-In": formatDisplayTime(r.checkInTime),
      "Check-Out": formatDisplayTime(r.checkOutTime),
      "Total Hours": r.totalHours || 'N/A',
      "Status": r.status,
      "Remarks": r.remarks || 'N/A',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Records");
    XLSX.writeFile(wb, "attendance_records.xlsx");
     toast({ title: "Exported", description: "Attendance records exported to Excel."});
  };

  const exportToPDF = () => {
    const input = document.getElementById('attendanceTableToExport');
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth - 20; // With margin
        const height = width / ratio;
        
        // If height exceeds pdfHeight, we might need to split pages or scale down further
        // For simplicity, this example fits to one page width-wise.
        pdf.addImage(imgData, 'PNG', 10, 10, width, height);
        pdf.save("attendance_records.pdf");
        toast({ title: "Exported", description: "Attendance records exported to PDF."});
      });
    } else {
       toast({ variant: "destructive", title: "Error", description: "Could not find table to export."});
    }
  };


  const statusOptions = ['Present', 'Late', 'Absent', 'On Leave'];


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-headline">All Employee Attendance</CardTitle>
            <CardDescription>View and manage attendance records for all employees.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel} className="text-sm">
              <Download className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF} className="text-sm">
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm text-sm"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto text-sm">
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={(date) => {setDateFilter(date);}}
                initialFocus
              />
            </PopoverContent>
          </Popover>
           { (searchTerm || dateFilter) && (
            <Button variant="ghost" onClick={() => { setSearchTerm(''); setDateFilter(undefined); }} className="text-sm">
              <XCircle className="mr-2 h-4 w-4" /> Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <div id="attendanceTableToExport">
            <Table>
              <TableCaption>{filteredRecords.length === 0 ? "No records found." : "List of all attendance records."}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Employee Name</TableHead>
                  <TableHead className="w-[100px]">Emp. ID</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[120px]">Check-In</TableHead>
                  <TableHead className="w-[120px]">Check-Out</TableHead>
                  <TableHead className="w-[100px]">Total Hours</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{record.employeeId}</TableCell>
                    <TableCell>{format(parseISO(record.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <EditableCell 
                        value={record.checkInTime} 
                        onChange={(val) => handleCellChange(record.id, 'checkInTime', val)}
                        type="time"
                        recordId={record.id}
                        field="checkInTime"
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell 
                        value={record.checkOutTime} 
                        onChange={(val) => handleCellChange(record.id, 'checkOutTime', val)}
                        type="time"
                        recordId={record.id}
                        field="checkOutTime"
                      />
                    </TableCell>
                    <TableCell>{record.totalHours || 'N/A'}</TableCell>
                    <TableCell>
                       <EditableCell 
                        value={record.status} 
                        onChange={(val) => handleCellChange(record.id, 'status', val)}
                        type="select"
                        options={statusOptions}
                        recordId={record.id}
                        field="status"
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell 
                        value={record.remarks} 
                        onChange={(val) => handleCellChange(record.id, 'remarks', val)}
                        type="text"
                        recordId={record.id}
                        field="remarks"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

