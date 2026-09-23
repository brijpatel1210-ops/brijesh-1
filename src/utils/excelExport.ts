import * as XLSX from 'xlsx';
import { Student, SchoolConfig, DayRecord, AttendanceStatus } from '../types';
import { formatGujaratiDate, AllAttendanceData } from './storage';

export function getStatusText(status: AttendanceStatus): { guj: string; eng: string; code: string } {
  switch (status) {
    case 'P':
      return { guj: 'હાજર', eng: 'Present', code: 'P' };
    case 'A':
      return { guj: 'ગેરહાજર', eng: 'Absent', code: 'A' };
    case 'L':
      return { guj: 'રજા', eng: 'Leave', code: 'L' };
    case 'H':
      return { guj: 'અડધો દિવસ', eng: 'Half Day', code: 'H' };
    default:
      return { guj: 'અજ્ઞાત', eng: 'Unknown', code: '-' };
  }
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  leave: number;
  halfDay: number;
  boysTotal: number;
  boysPresent: number;
  girlsTotal: number;
  girlsPresent: number;
  percentage: number;
}

export function calculateSummary(
  students: Student[],
  attendance: Record<string, DayRecord>
): AttendanceSummary {
  let present = 0;
  let absent = 0;
  let leave = 0;
  let halfDay = 0;
  let boysTotal = 0;
  let boysPresent = 0;
  let girlsTotal = 0;
  let girlsPresent = 0;

  students.forEach((s) => {
    if (s.gender === 'M') boysTotal++;
    else girlsTotal++;

    const record = attendance[s.id];
    const status = record ? record.status : 'P';

    if (status === 'P') {
      present++;
      if (s.gender === 'M') boysPresent++;
      else girlsPresent++;
    } else if (status === 'A') {
      absent++;
    } else if (status === 'L') {
      leave++;
    } else if (status === 'H') {
      halfDay++;
      present += 0.5;
      if (s.gender === 'M') boysPresent += 0.5;
      else girlsPresent += 0.5;
    }
  });

  const total = students.length;
  const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

  return {
    total,
    present,
    absent,
    leave,
    halfDay,
    boysTotal,
    boysPresent,
    girlsTotal,
    girlsPresent,
    percentage
  };
}

/**
 * Generates and downloads an Excel file (.xlsx) for the selected date.
 */
export function exportDailyAttendanceToExcel(
  date: string,
  students: Student[],
  attendance: Record<string, DayRecord>,
  config: SchoolConfig
): string {
  const summary = calculateSummary(students, attendance);
  const formattedDate = formatGujaratiDate(date);

  // 1. Daily Sheet Rows
  const dailyRows: (string | number)[][] = [
    ['પ્રાથમિક શાળા દૈનિક હાજરી પત્રક - ધોરણ ૭ (DAILY ATTENDANCE REGISTER)'],
    [`શાળાનું નામ: ${config.schoolName}`, '', `શાળા ડાયસ કોડ: ${config.schoolCode || '---'}`],
    [`ધોરણ: ${config.className} (${config.division})`, '', `શિક્ષકનું નામ: ${config.teacherName}`, '', `શૈક્ષણિક વર્ષ: ${config.academicYear}`],
    [`તારીખ: ${formattedDate}`, '', `કુલ સંખ્યા: ${summary.total}`, `હાજર: ${summary.present}`, `ગેરહાજર: ${summary.absent}`, `ટકાવારી: ${summary.percentage}%`],
    [`MDM (મધ્યાહ્ન ભોજન) સંખ્યા: કુમાર: ${summary.boysPresent}/${summary.boysTotal}, કન્યા: ${summary.girlsPresent}/${summary.girlsTotal} = કુલ: ${summary.present}`],
    [], // Blank line
    // Table Header
    [
      'ક્રમ (રોલ નં.)',
      'જી.આર. નં.',
      'વિદ્યાર્થીનું નામ (ગુજરાતી)',
      'વિદ્યાર્થીનું નામ (English)',
      'જાતિ (કુમાર/કન્યા)',
      'હાજરી સ્થિતિ',
      'સ્થિતિ કોડ (P/A/L)',
      'નોંધાયેલ સમય',
      'વિશેષ નોંધ'
    ]
  ];

  students.forEach((s) => {
    const rec = attendance[s.id];
    const status = rec ? rec.status : 'P';
    const statusInfo = getStatusText(status);

    dailyRows.push([
      s.rollNo,
      s.grNo,
      s.name,
      s.nameEn,
      s.gender === 'M' ? 'કુમાર (Boy)' : 'કન્યા (Girl)',
      statusInfo.guj,
      statusInfo.code,
      rec?.timestamp || '',
      rec?.note || ''
    ]);
  });

  // Summary footer in sheet
  dailyRows.push([]);
  dailyRows.push(['હાજરી વિશ્લેષણ સારાંશ (SUMMARY):']);
  dailyRows.push(['કુલ વિદ્યાર્થીઓ', summary.total]);
  dailyRows.push(['હાજર સંખ્યા (P)', summary.present]);
  dailyRows.push(['ગેરહાજર સંખ્યા (A)', summary.absent]);
  dailyRows.push(['રજા (L)', summary.leave]);
  dailyRows.push(['હાજરી ટકાવારી', `${summary.percentage}%`]);
  dailyRows.push(['વર્ગશિક્ષકની સહી:', '___________________', '', 'મુખ્ય શિક્ષકની સહી:', '___________________']);

  // Convert array of arrays to Worksheet
  const wsDaily = XLSX.utils.aoa_to_sheet(dailyRows);

  // Set column widths for clean readability
  wsDaily['!cols'] = [
    { wch: 14 }, // Roll No
    { wch: 14 }, // GR No
    { wch: 32 }, // Guj Name
    { wch: 30 }, // Eng Name
    { wch: 18 }, // Gender
    { wch: 16 }, // Status Guj
    { wch: 16 }, // Status Code
    { wch: 16 }, // Timestamp
    { wch: 25 }, // Note
  ];

  // 2. Student Master Sheet
  const masterRows: (string | number)[][] = [
    [`${config.schoolName} - ધોરણ ૭ વિદ્યાર્થી યાદી`],
    [],
    ['રોલ નં.', 'જી.આર. નં.', 'નામ (ગુજરાતી)', 'નામ (English)', 'જાતિ']
  ];
  students.forEach((s) => {
    masterRows.push([
      s.rollNo,
      s.grNo,
      s.name,
      s.nameEn,
      s.gender === 'M' ? 'કુમાર' : 'કન્યા'
    ]);
  });
  const wsMaster = XLSX.utils.aoa_to_sheet(masterRows);
  wsMaster['!cols'] = [{ wch: 10 }, { wch: 14 }, { wch: 30 }, { wch: 30 }, { wch: 14 }];

  // Create Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsDaily, 'દૈનિક હાજરી પત્રક');
  XLSX.utils.book_append_sheet(wb, wsMaster, 'વિદ્યાર્થી યાદી');

  const fileName = `ધોરણ-૭_હાજરી_પત્રક_${date}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}

/**
 * Generates and downloads full Monthly Register Excel (.xlsx)
 */
export function exportMonthlyRegisterToExcel(
  yearMonth: string, // YYYY-MM
  students: Student[],
  allAttendance: AllAttendanceData,
  config: SchoolConfig
): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const daysInMonth = new Date(year, month, 0).getDate();

  // Create headers: Roll No, GR, Name, 1..daysInMonth, Total Present, Total Absent, %
  const headerRow: (string | number)[] = ['રોલ નં.', 'જી.આર. નં.', 'વિદ્યાર્થીનું નામ', 'જાતિ'];
  for (let d = 1; d <= daysInMonth; d++) {
    headerRow.push(d);
  }
  headerRow.push('કુલ હાજર');
  headerRow.push('કુલ ગેરહાજર');
  headerRow.push('ટકાવારી (%)');

  const monthRows: (string | number)[][] = [
    [`${config.schoolName} - ધોરણ ૭ માસિક હાજરી પત્રક (${monthStr}/${yearStr})`],
    [`વર્ગશિક્ષક: ${config.teacherName} | વર્ગ: ${config.className} (${config.division})`],
    [],
    headerRow
  ];

  students.forEach((s) => {
    const row: (string | number)[] = [
      s.rollNo,
      s.grNo,
      s.name,
      s.gender === 'M' ? 'કુમાર' : 'કન્યા'
    ];

    let presentDays = 0;
    let absentDays = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = `${yearStr}-${monthStr}-${String(d).padStart(2, '0')}`;
      const dayData = allAttendance[dayDate];
      if (dayData && dayData[s.id]) {
        const st = dayData[s.id].status;
        row.push(st);
        if (st === 'P') presentDays++;
        else if (st === 'A') absentDays++;
        else if (st === 'H') presentDays += 0.5;
      } else {
        // If not recorded yet, show dash
        row.push('-');
      }
    }

    const recordedDays = presentDays + absentDays;
    const pct = recordedDays > 0 ? Number(((presentDays / recordedDays) * 100).toFixed(1)) : 100;

    row.push(presentDays);
    row.push(absentDays);
    row.push(`${pct}%`);

    monthRows.push(row);
  });

  const wsMonth = XLSX.utils.aoa_to_sheet(monthRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsMonth, `માસિક_${monthStr}_${yearStr}`);

  const fileName = `ધોરણ-૭_માસિક_હાજરી_${yearStr}_${monthStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}
