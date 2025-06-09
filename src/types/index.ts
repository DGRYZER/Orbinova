
export interface Employee {
  id: string; // Employee ID
  name: string;
  designation: 'HR' | 'Employee';
  password?: string; // Password will be set by HR or for initial HR
  email?: string;
  phone?: string;
  isPhoneVerified?: boolean; // New field for phone verification status
}

export interface AttendanceRecord {
  id: string; // Unique ID for the record (e.g., employeeId-date)
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  totalHours?: string; // e.g., "8h 30m"
  status: 'Present' | 'Late' | 'Absent' | 'On Leave'; // Added 'On Leave'
  remarks?: string; // Optional remarks by HR
}

export interface User { // Logged-in user
  id: string;
  name: string;
  designation: 'HR' | 'Employee';
  email?: string;
  phone?: string;
  isPhoneVerified?: boolean; // New field for phone verification status
}
