export type AttendanceStatus = 'P' | 'A' | 'L' | 'H';

export interface Student {
  id: string;
  rollNo: number;
  grNo: string;
  name: string; // Gujarati Name
  nameEn: string; // English Name
  gender: 'M' | 'F'; // M = કુમાર (Boy), F = કન્યા (Girl)
  photo: string;
  phone?: string;
}

export interface DayRecord {
  status: AttendanceStatus;
  timestamp: string;
  note?: string;
}

export type DailyAttendanceMap = Record<string, DayRecord>; // studentId -> DayRecord

export interface SchoolConfig {
  schoolName: string;
  schoolCode?: string;
  className: string;
  division: string;
  teacherName: string;
  academicYear: string;
  district: string;
  taluka: string;
}

export type ViewTab = 'daily' | 'monthly' | 'students' | 'report';
