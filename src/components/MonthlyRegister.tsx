import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight, FileSpreadsheet, Check } from 'lucide-react';
import { Student, SchoolConfig } from '../types';
import { AllAttendanceData } from '../utils/storage';
import { exportMonthlyRegisterToExcel } from '../utils/excelExport';

interface MonthlyRegisterProps {
  students: Student[];
  allAttendance: AllAttendanceData;
  config: SchoolConfig;
}

export const MonthlyRegister: React.FC<MonthlyRegisterProps> = ({
  students,
  allAttendance,
  config
}) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-12
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const gujaratiMonths = [
    'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
    'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'
  ];

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const yearMonthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleExportMonthExcel = () => {
    const filename = exportMonthlyRegisterToExcel(
      yearMonthKey,
      students,
      allAttendance,
      config
    );
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Month Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
            title="અગાઉનો મહિનો"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-slate-900 text-sm sm:text-base px-2">
            {gujaratiMonths[selectedMonth - 1]} {selectedYear} (માસિક પત્રક)
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
            title="આગામી મહિનો"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMonthExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>આખો મહિનો એક્સેલમાં ડાઉનલોડ (.xlsx)</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-100 border-b border-emerald-300 px-4 py-2 text-xs text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>માસિક પત્રક એક્સેલમાં ડાઉનલોડ થઈ ગયું: <strong>{downloadSuccess}</strong></span>
        </div>
      )}

      {/* Legend & Guide */}
      <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200 text-xs text-slate-600 flex flex-wrap items-center gap-4">
        <span className="font-semibold text-slate-800">સંકેતો:</span>
        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> P = હાજર</span>
        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span> A = ગેરહાજર</span>
        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> L = રજા</span>
        <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> - = નોંધાયેલ નથી</span>
      </div>

      {/* Scrollable Matrix Table */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full border-collapse text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 shadow-xs">
            <tr className="border-b border-slate-300">
              <th className="py-2.5 px-2 border-r border-slate-200 text-center w-10 bg-slate-100">રોલ</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-[180px] bg-slate-100">વિદ્યાર્થીનું નામ</th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dayDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                const isSunday = dateObj.getDay() === 0;

                return (
                  <th
                    key={day}
                    className={`py-2 px-1.5 border-r border-slate-200 text-center w-8 ${
                      isSunday ? 'bg-rose-100 text-rose-800 font-black' : 'bg-slate-100'
                    }`}
                    title={`${day}/${selectedMonth}/${selectedYear} (${isSunday ? 'રવિવાર' : ''})`}
                  >
                    <div>{day}</div>
                    <div className="text-[9px] font-normal text-slate-500">
                      {['ર', 'સો', 'મં', 'બુ', 'ગુ', 'શુ', 'શ'][dateObj.getDay()]}
                    </div>
                  </th>
                );
              })}
              <th className="py-2 px-2 border-r border-slate-200 text-center bg-emerald-100 text-emerald-900 w-14">હાજર</th>
              <th className="py-2 px-2 border-r border-slate-200 text-center bg-rose-100 text-rose-900 w-14">ગેરહાજર</th>
              <th className="py-2 px-2 text-center bg-slate-200 text-slate-900 w-16">ટકા %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((s, idx) => {
              let presentCount = 0;
              let absentCount = 0;

              return (
                <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-800">
                    {s.rollNo}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium truncate">
                    <div className="font-semibold text-slate-900 truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.gender === 'M' ? 'કુમાર' : 'કન્યા'} · {s.grNo}</div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dayDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const rec = allAttendance[dayDate]?.[s.id];
                    const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                    const isSunday = dateObj.getDay() === 0;

                    let statusText = '-';
                    let cellBg = '';

                    if (isSunday) {
                      cellBg = 'bg-rose-50/40 text-slate-300';
                    }

                    if (rec) {
                      statusText = rec.status;
                      if (rec.status === 'P') {
                        presentCount++;
                        cellBg = 'bg-emerald-50 text-emerald-800 font-bold';
                      } else if (rec.status === 'A') {
                        absentCount++;
                        cellBg = 'bg-rose-100 text-rose-800 font-bold';
                      } else if (rec.status === 'L') {
                        cellBg = 'bg-amber-100 text-amber-800 font-bold';
                      }
                    }

                    return (
                      <td
                        key={day}
                        className={`py-1.5 px-1 border-r border-slate-200 text-center font-mono text-[11px] ${cellBg}`}
                      >
                        {statusText}
                      </td>
                    );
                  })}
                  {/* Totals */}
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-emerald-700 bg-emerald-50/60 font-mono">
                    {presentCount}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-rose-700 bg-rose-50/60 font-mono">
                    {absentCount}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-slate-800 bg-slate-50 font-mono">
                    {presentCount + absentCount > 0
                      ? `${Math.round((presentCount / (presentCount + absentCount)) * 100)}%`
                      : '100%'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
