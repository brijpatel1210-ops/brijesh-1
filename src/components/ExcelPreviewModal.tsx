import React, { useState } from 'react';
import { X, Download, Copy, Check, FileSpreadsheet, Printer } from 'lucide-react';
import { Student, SchoolConfig, DayRecord } from '../types';
import { calculateSummary, exportDailyAttendanceToExcel, getStatusText } from '../utils/excelExport';
import { formatGujaratiDate } from '../utils/storage';

interface ExcelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  students: Student[];
  attendance: Record<string, DayRecord>;
  config: SchoolConfig;
}

export const ExcelPreviewModal: React.FC<ExcelPreviewModalProps> = ({
  isOpen,
  onClose,
  date,
  students,
  attendance,
  config
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const summary = calculateSummary(students, attendance);
  const formattedDate = formatGujaratiDate(date);

  const handleDownloadExcel = () => {
    const filename = exportDailyAttendanceToExcel(date, students, attendance, config);
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleCopyClipboard = () => {
    // Generate tab-separated values (TSV) for seamless paste into Excel or Google Sheets
    let tsv = `રોલ નં.\tજી.આર. નં.\tવિદ્યાર્થીનું નામ\tEnglish Name\tજાતિ\tહાજરી સ્થિતિ\tકોડ\tસમય\n`;
    students.forEach((s) => {
      const rec = attendance[s.id];
      const status = rec ? rec.status : 'P';
      const st = getStatusText(status);
      tsv += `${s.rollNo}\t${s.grNo}\t${s.name}\t${s.nameEn}\t${s.gender === 'M' ? 'કુમાર' : 'કન્યા'}\t${st.guj}\t${st.code}\t${rec?.timestamp || ''}\n`;
    });

    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700/80 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>Excel Sheet પ્રીવ્યૂ અને ડાઉનલોડ</span>
                <span className="text-xs bg-emerald-600 px-2 py-0.5 rounded text-emerald-100 font-normal">
                  .XLSX Format
                </span>
              </h2>
              <p className="text-xs text-emerald-200">
                {config.schoolName} · {config.className} ({config.division}) · {formattedDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">લાઈવ સ્ટેટસ:</span> કુલ {summary.total} | હાજર: <strong className="text-emerald-700">{summary.present}</strong> | ગેરહાજર: <strong className="text-rose-700">{summary.absent}</strong> | ટકાવારી: <strong>{summary.percentage}%</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">કોપી થઈ ગયું!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Excel માટે કોપી</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>પ્રિન્ટ</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ડાઉનલોડ એક્સેલ (.xlsx)</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-100 border-b border-emerald-300 px-5 py-2 text-xs text-emerald-900 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>ફાઇલ સફળતાપૂર્વક ડાઉનલોડ થઈ: <strong>{downloadSuccess}</strong> (તમારા ડાઉનલોડ્સ ફોલ્ડરમાં સેવ થઈ ગઈ છે)</span>
          </div>
        )}

        {/* Spreadsheet Table View */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100/50">
          <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
            {/* Sheet Title Bar Styled like Excel */}
            <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span>TABLE: Hajri_Patrak_Class_7 [Sheet 1: દૈનિક હાજરી પત્રક]</span>
              <span>Total Rows: {students.length}</span>
            </div>

            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="py-2 px-3 border-r border-slate-200 w-14 text-center">રોલ</th>
                  <th className="py-2 px-3 border-r border-slate-200 w-24">જી.આર. નં.</th>
                  <th className="py-2 px-3 border-r border-slate-200">વિદ્યાર્થીનું પૂરું નામ</th>
                  <th className="py-2 px-3 border-r border-slate-200 w-20 text-center">જાતિ</th>
                  <th className="py-2 px-3 border-r border-slate-200 w-28 text-center">હાજરી સ્થિતિ</th>
                  <th className="py-2 px-3 border-r border-slate-200 w-16 text-center">કોડ</th>
                  <th className="py-2 px-3 border-r border-slate-200 w-24 text-center">સમય</th>
                  <th className="py-2 px-3 text-slate-500">નોંધ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {students.map((s, idx) => {
                  const rec = attendance[s.id];
                  const status = rec ? rec.status : 'P';
                  const st = getStatusText(status);

                  const rowBg = status === 'A' 
                    ? 'bg-rose-50/70 text-rose-950' 
                    : status === 'L' 
                    ? 'bg-amber-50/70 text-amber-950' 
                    : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

                  return (
                    <tr key={s.id} className={`${rowBg} hover:bg-emerald-50/40 transition-colors`}>
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-center">
                        {s.rollNo}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                        {s.grNo}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium">
                        <div className="flex items-center gap-2">
                          <img
                            src={s.photo}
                            alt=""
                            className="w-6 h-6 rounded-full border border-slate-200 object-cover"
                          />
                          <div>
                            <span className="font-semibold text-slate-900">{s.name}</span>
                            <span className="text-[10px] text-slate-400 block">{s.nameEn}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center text-slate-600">
                        {s.gender === 'M' ? 'કુમાર' : 'કન્યા'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                            status === 'P'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'A'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {st.guj}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-bold font-mono">
                        {st.code}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center text-[11px] text-slate-500 font-mono">
                        {rec?.timestamp || '--:--'}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">
                        {rec?.note || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div>
            💡 <span className="font-medium">ઓટો-સેવ:</span> ફોટો ક્લિક કરતાની સાથે જ બધો ડેટા લોકલ અને એક્સેલ ફોર્મેટમાં તરત સેવ થઈ જાય છે.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            બંધ કરો (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
