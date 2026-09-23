import { Student, SchoolConfig, AttendanceStatus, DayRecord } from '../types';
import { INITIAL_STUDENTS, DEFAULT_SCHOOL_CONFIG } from './initialStudents';

const STORAGE_KEYS = {
  STUDENTS: 'hajri_patrak_dhoran7_students',
  CONFIG: 'hajri_patrak_dhoran7_config',
  ATTENDANCE: 'hajri_patrak_dhoran7_records', // key format: YYYY-MM-DD -> { [studentId]: DayRecord }
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatGujaratiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  
  const gujaratiDays = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર'];
  const gujaratiMonths = [
    'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 
    'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'
  ];

  const dayName = gujaratiDays[dateObj.getDay()];
  const monthName = gujaratiMonths[dateObj.getMonth()];

  return `${d} ${monthName} ${y} (${dayName})`;
}

// Load Students
export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load students', e);
  }
  // Store default
  saveStudents(INITIAL_STUDENTS);
  return INITIAL_STUDENTS;
}

// Save Students
export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students', e);
  }
}

// Load School Config
export function loadSchoolConfig(): SchoolConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      return { ...DEFAULT_SCHOOL_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load config', e);
  }
  return DEFAULT_SCHOOL_CONFIG;
}

// Save School Config
export function saveSchoolConfig(config: SchoolConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config', e);
  }
}

// All Attendance Records (date -> { [studentId]: DayRecord })
export type AllAttendanceData = Record<string, Record<string, DayRecord>>;

export function loadAllAttendance(): AllAttendanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load attendance records', e);
  }
  return {};
}

export function saveAllAttendance(data: AllAttendanceData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save attendance records', e);
  }
}

// Get Attendance for a specific date (defaulting each student to 'P' if not yet initialized)
export function getDailyAttendance(date: string, students: Student[]): Record<string, DayRecord> {
  const all = loadAllAttendance();
  const dayRecords = all[date] || {};

  // If date not recorded yet, prepare default present record for every student
  let modified = false;
  const result: Record<string, DayRecord> = { ...dayRecords };

  students.forEach((s) => {
    if (!result[s.id]) {
      result[s.id] = {
        status: 'P',
        timestamp: new Date().toLocaleTimeString('gu-IN', { hour: '2-digit', minute: '2-digit' })
      };
      modified = true;
    }
  });

  if (modified) {
    all[date] = result;
    saveAllAttendance(all);
  }

  return result;
}

// Update single student attendance status immediately
export function updateStudentStatus(
  date: string,
  studentId: string,
  status: AttendanceStatus,
  note?: string
): Record<string, DayRecord> {
  const all = loadAllAttendance();
  const currentDay = all[date] || {};

  currentDay[studentId] = {
    status,
    timestamp: new Date().toLocaleTimeString('gu-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    note: note !== undefined ? note : currentDay[studentId]?.note
  };

  all[date] = currentDay;
  saveAllAttendance(all);
  return currentDay;
}

// Batch update status for multiple students
export function batchUpdateStatus(
  date: string,
  updates: Record<string, AttendanceStatus>
): Record<string, DayRecord> {
  const all = loadAllAttendance();
  const currentDay = all[date] || {};
  const time = new Date().toLocaleTimeString('gu-IN', { hour: '2-digit', minute: '2-digit' });

  Object.entries(updates).forEach(([studentId, status]) => {
    currentDay[studentId] = {
      status,
      timestamp: time,
      note: currentDay[studentId]?.note
    };
  });

  all[date] = currentDay;
  saveAllAttendance(all);
  return currentDay;
}
