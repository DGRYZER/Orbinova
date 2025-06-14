import type { AttendanceRecord } from '@/types';
import { getItem, setItem } from './localStorageUtils';
import { format, parse, differenceInMinutes, isAfter, setHours, setMinutes, setSeconds } from 'date-fns';

<<<<<<< HEAD
const ATTENDANCE_KEY = 'attendease-attendance';
=======
const ATTENDANCE_KEY = 'Orbinova-attendance';
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a

export function getAllAttendanceRecords(): AttendanceRecord[] {
  return getItem<AttendanceRecord[]>(ATTENDANCE_KEY) || [];
}

export function getAttendanceByEmployeeAndDate(employeeId: string, date: string): AttendanceRecord | undefined {
  const records = getAllAttendanceRecords();
  return records.find(record => record.employeeId === employeeId && record.date === date);
}

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  const records = getAllAttendanceRecords();
  return records.filter(record => record.date === date);
}

export function markCheckIn(employeeId: string, employeeName: string): AttendanceRecord {
  const now = new Date();
  const dateStr = format(now, 'yyyy-MM-dd');
  const timeStr = format(now, 'HH:mm:ss');

  let records = getAllAttendanceRecords();
  let record = records.find(r => r.employeeId === employeeId && r.date === dateStr);

  const twelvePM = setSeconds(setMinutes(setHours(now, 12), 0), 0);
  const isLate = isAfter(now, twelvePM);
  const status = isLate ? 'Late' : 'Present';

  if (record) {
    // Already checked in, perhaps update if needed or prevent re-check-in
    record.checkInTime = record.checkInTime || timeStr; // Don't overwrite if already set
    record.status = record.status === 'Absent' ? status : record.status; // Update status if was absent
  } else {
    record = {
      id: `${employeeId}-${dateStr}`,
      employeeId,
      employeeName,
      date: dateStr,
      checkInTime: timeStr,
      status,
    };
    records.push(record);
  }
  setItem<AttendanceRecord[]>(ATTENDANCE_KEY, records);
  return record;
}

function calculateTotalHours(checkInTimeStr?: string, checkOutTimeStr?: string, dateStr?: string): string | undefined {
  if (!checkInTimeStr || !checkOutTimeStr || !dateStr) return undefined;

  // Parse checkInTime and checkOutTime with the specific date to create Date objects
  const [ciHours, ciMinutes, ciSeconds] = checkInTimeStr.split(':').map(Number);
  const checkInDateTime = parse(`${dateStr} ${checkInTimeStr}`, 'yyyy-MM-dd HH:mm:ss', new Date());
  
  const [coHours, coMinutes, coSeconds] = checkOutTimeStr.split(':').map(Number);
  const checkOutDateTime = parse(`${dateStr} ${checkOutTimeStr}`, 'yyyy-MM-dd HH:mm:ss', new Date());

  if (isNaN(checkInDateTime.getTime()) || isNaN(checkOutDateTime.getTime()) || checkOutDateTime <= checkInDateTime) {
    return 'Invalid times';
  }

  const diffMins = differenceInMinutes(checkOutDateTime, checkInDateTime);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  return `${hours}h ${minutes}m`;
}


export function markCheckOut(employeeId: string): AttendanceRecord | undefined {
  const now = new Date();
  const dateStr = format(now, 'yyyy-MM-dd');
  const timeStr = format(now, 'HH:mm:ss');

  let records = getAllAttendanceRecords();
  const recordIndex = records.findIndex(r => r.employeeId === employeeId && r.date === dateStr);

  if (recordIndex !== -1) {
    records[recordIndex].checkOutTime = timeStr;
    records[recordIndex].totalHours = calculateTotalHours(
      records[recordIndex].checkInTime,
      timeStr,
      dateStr
    );
    setItem<AttendanceRecord[]>(ATTENDANCE_KEY, records);
    return records[recordIndex];
  }
  return undefined; // No check-in record found for today
}

export function upsertAttendanceRecord(updatedRecord: AttendanceRecord): void {
  let records = getAllAttendanceRecords();
  const index = records.findIndex(r => r.id === updatedRecord.id);

  // Recalculate total hours if check-in or check-out times are present
  if (updatedRecord.checkInTime && updatedRecord.checkOutTime && updatedRecord.date) {
    updatedRecord.totalHours = calculateTotalHours(updatedRecord.checkInTime, updatedRecord.checkOutTime, updatedRecord.date);
  }

  // Determine status if not explicitly 'On Leave' or 'Absent'
  if (updatedRecord.status !== 'On Leave' && updatedRecord.status !== 'Absent' && updatedRecord.checkInTime) {
      const checkInDate = parse(`${updatedRecord.date} ${updatedRecord.checkInTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());
      const twelvePM = setSeconds(setMinutes(setHours(checkInDate, 12), 0), 0);
      updatedRecord.status = isAfter(checkInDate, twelvePM) ? 'Late' : 'Present';
  }


  if (index !== -1) {
    records[index] = { ...records[index], ...updatedRecord };
  } else {
    records.push(updatedRecord);
  }
  setItem<AttendanceRecord[]>(ATTENDANCE_KEY, records);
}

export function getTodaysAttendanceForEmployee(employeeId: string): AttendanceRecord | undefined {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  return getAttendanceByEmployeeAndDate(employeeId, todayStr);
}