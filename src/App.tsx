import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCheck, 
  XCircle, 
  Search, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Sparkles,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { Student, AttendanceStatus, SchoolConfig, ViewTab } from './types';
import { 
  loadStudents, 
  saveStudents, 
  loadSchoolConfig, 
  saveSchoolConfig, 
  getTodayDateString, 
  getDailyAttendance, 
  updateStudentStatus, 
  batchUpdateStatus,
  loadAllAttendance,
  formatGujaratiDate
} from './utils/storage';
import { playSound } from './utils/audio';
import { calculateSummary, exportDailyAttendanceToExcel } from './utils/excelExport';

import { Navbar } from './components/Navbar';
import { QuickStats } from './components/QuickStats';
import { StudentCard } from './components/StudentCard';
import { MonthlyRegister } from './components/MonthlyRegister';
import { ExcelPreviewModal } from './components/ExcelPreviewModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { StudentManagerModal } from './components/StudentManagerModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Primary States
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [config, setConfig] = useState<SchoolConfig>(() => loadSchoolConfig());
  const [allAttendance, setAllAttendance] = useState(() => loadAllAttendance());
  const [activeTab, setActiveTab] = useState<ViewTab>('daily');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'P' | 'A' | 'L' | 'M' | 'F'>('all');

  // Modals
  const [isExcelPreviewOpen, setIsExcelPreviewOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isStudentManagerOpen, setIsStudentManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studentForPhotoEdit, setStudentForPhotoEdit] = useState<Student | null>(null);

  // Instant Feedback notification
  const [instantSaveToast, setInstantSaveToast] = useState<{ show: boolean; text: string }>({
    show: false,
    text: 'Excel માં સેવ થઈ ગયું!'
  });
  const [lastSavedTime, setLastSavedTime] = useState<string>('હમણાં જ');

  // Load attendance for selected date
  const dayAttendance = useMemo(() => {
    return getDailyAttendance(currentDate, students);
  }, [currentDate, students, allAttendance]);

  // Summary statistics
  const summary = useMemo(() => {
    return calculateSummary(students, dayAttendance);
  }, [students, dayAttendance]);

  // Absent student roll numbers
  const absentRolls = useMemo(() => {
    return students
      .filter((s) => dayAttendance[s.id]?.status === 'A')
      .map((s) => s.rollNo);
  }, [students, dayAttendance]);

  const triggerToast = (text: string) => {
    setInstantSaveToast({ show: true, text });
    setLastSavedTime(new Date().toLocaleTimeString('gu-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => {
      setInstantSaveToast(prev => ({ ...prev, show: false }));
    }, 2200);
  };

  // Toggle student status (P -> A -> L -> P) on photo/card click
  const handleToggleStatus = (studentId: string) => {
    const current = dayAttendance[studentId]?.status || 'P';
    let next: AttendanceStatus = 'P';
    if (current === 'P') next = 'A';
    else if (current === 'A') next = 'L';
    else if (current === 'L') next = 'P';

    handleSetStatus(studentId, next);
  };

  // Direct set status
  const handleSetStatus = (studentId: string, nextStatus: AttendanceStatus) => {
    updateStudentStatus(currentDate, studentId, nextStatus);
    setAllAttendance(loadAllAttendance());

    if (soundEnabled) {
      if (nextStatus === 'P') playSound('present');
      else if (nextStatus === 'A') playSound('absent');
      else playSound('leave');
    }

    const stGuj = nextStatus === 'P' ? 'હાજર' : nextStatus === 'A' ? 'ગેરહાજર' : 'રજા';
    triggerToast(`રોલ નં. ${students.find(s => s.id === studentId)?.rollNo || ''} (${stGuj}) - Excel માં સેવ!`);
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updates: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updates[s.id] = 'P';
    });
    batchUpdateStatus(currentDate, updates);
    setAllAttendance(loadAllAttendance());

    if (soundEnabled) playSound('allPresent');

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    triggerToast('બધા વિદ્યાર્થીઓ હાજર નોંધાયા - Excel માં સેવ!');
  };

  // Mark all absent
  const handleMarkAllAbsent = () => {
    if (window.confirm('શું તમે ખરેખર બધા વિદ્યાર્થીઓને ગેરહાજર કરવા માંગો છો?')) {
      const updates: Record<string, AttendanceStatus> = {};
      students.forEach((s) => {
        updates[s.id] = 'A';
      });
      batchUpdateStatus(currentDate, updates);
      setAllAttendance(loadAllAttendance());
      if (soundEnabled) playSound('absent');
      triggerToast('બધા ગેરહાજર નોંધાયા - Excel માં સેવ!');
    }
  };

  // Direct instant Excel download
  const handleDirectExcelDownload = () => {
    exportDailyAttendanceToExcel(currentDate, students, dayAttendance, config);
    if (soundEnabled) playSound('save');
    triggerToast('Excel Sheet (.xlsx) સફળતાપૂર્વક ડાઉનલોડ થઈ!');
  };

  // Save updated student roster
  const handleSaveStudents = (newStudents: Student[]) => {
    saveStudents(newStudents);
    setStudents(newStudents);
    setAllAttendance(loadAllAttendance());
    triggerToast('વિદ્યાર્થી યાદી અપડેટ થઈ!');
  };

  // Save school config
  const handleSaveConfig = (newConfig: SchoolConfig) => {
    saveSchoolConfig(newConfig);
    setConfig(newConfig);
    triggerToast('શાળા સેટિંગ્સ અપડેટ થઈ!');
  };

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.rollNo.toString() === q ||
        s.grNo.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Status / Gender Filter
      const rec = dayAttendance[s.id];
      const status = rec ? rec.status : 'P';

      if (filterType === 'all') return true;
      if (filterType === 'P') return status === 'P';
      if (filterType === 'A') return status === 'A';
      if (filterType === 'L') return status === 'L';
      if (filterType === 'M') return s.gender === 'M';
      if (filterType === 'F') return s.gender === 'F';

      return true;
    });
  }, [students, dayAttendance, searchQuery, filterType]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Navbar */}
      <Navbar
        config={config}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenExcelPreview={() => setIsExcelPreviewOpen(true)}
        onDirectExcelDownload={handleDirectExcelDownload}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onOpenStudents={() => setIsStudentManagerOpen(true)}
        lastSavedNotice={`સેવ: ${lastSavedTime}`}
      />

      {/* Floating Instant Toast */}
      {instantSaveToast.show && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{instantSaveToast.text}</span>
          <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded text-white ml-1">
            Auto-Saved
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-4">
        {/* Quick Stats Banner */}
        <QuickStats summary={summary} absentRolls={absentRolls} />

        {activeTab === 'daily' ? (
          <div className="space-y-4">
            {/* Action Bar & Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[220px] max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="નામ અથવા રોલ નંબરથી શોધો..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Bulk Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleMarkAllPresent}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>બધાને હાજર કરો</span>
                  </button>

                  <button
                    onClick={handleMarkAllAbsent}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>બધા ગેરહાજર</span>
                  </button>

                  <button
                    onClick={handleDirectExcelDownload}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    title="આજની હાજરી એક્સેલમાં સેવ અને ડાઉનલોડ કરો"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Excel માં સેવ / ડાઉનલોડ</span>
                    <span className="sm:hidden">Excel</span>
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>ફિલ્ટર:</span>
                  </span>

                  {[
                    { id: 'all', label: `બધા (${students.length})` },
                    { id: 'P', label: `હાજર (${summary.present})`, color: 'text-emerald-700' },
                    { id: 'A', label: `ગેરહાજર (${summary.absent})`, color: 'text-rose-700' },
                    { id: 'L', label: `રજા (${summary.leave})`, color: 'text-amber-700' },
                    { id: 'M', label: `કુમાર (${summary.boysTotal})` },
                    { id: 'F', label: `કન્યા (${summary.girlsTotal})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterType(f.id as typeof filterType)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                        filterType === f.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span className={filterType === f.id ? 'text-white' : f.color}>
                        {f.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500">
                  બતાવવામાં આવેલ: <strong>{filteredStudents.length}</strong> વિદ્યાર્થીઓ
                </div>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>ફોટો પર ક્લિક કરો:</strong> વિદ્યાર્થીના કાર્ડ અથવા ફોટો પર ક્લિક કરવાથી હાજરી (હાજર ➔ ગેરહાજર ➔ રજા) બદલાશે અને <strong>તરત જ એક્સેલમાં સેવ થશે</strong>.
                </span>
              </div>
              <span className="font-semibold text-emerald-700 shrink-0 hidden md:inline">
                ⚡ Real-time Excel Sync
              </span>
            </div>

            {/* Student Photo Grid */}
            {filteredStudents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    record={dayAttendance[student.id]}
                    onToggleStatus={handleToggleStatus}
                    onSetStatus={handleSetStatus}
                    onEditPhoto={(s) => {
                      setStudentForPhotoEdit(s);
                      setIsStudentManagerOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">કોઈ વિદ્યાર્થી મળ્યા નથી</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  શોધ શબ્દ અથવા ફિલ્ટર બદલીને ફરી તપાસો.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                >
                  ફિલ્ટર હટાવો
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Monthly Register Tab */
          <MonthlyRegister
            students={students}
            allAttendance={allAttendance}
            config={config}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 space-y-1 no-print">
        <p className="font-medium text-slate-700">
          ધોરણ ૭ દૈનિક અને માસિક ફોટો હાજરી પત્રક પ્રણાલી · {config.schoolName}
        </p>
        <p className="text-[11px] text-slate-400">
          ક્લિક દ્વારા ત્વરિત હાજરી નોંધણી અને એક્સેલ શીટ (.xlsx) ઓટો-સેવ પ્રક્રિયા
        </p>
      </footer>

      {/* Modals */}
      <ExcelPreviewModal
        isOpen={isExcelPreviewOpen}
        onClose={() => setIsExcelPreviewOpen(false)}
        date={currentDate}
        students={students}
        attendance={dayAttendance}
        config={config}
      />

      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        date={currentDate}
        students={students}
        attendance={dayAttendance}
        config={config}
      />

      <StudentManagerModal
        isOpen={isStudentManagerOpen}
        onClose={() => {
          setIsStudentManagerOpen(false);
          setStudentForPhotoEdit(null);
        }}
        students={students}
        onSaveStudents={handleSaveStudents}
        selectedStudentForPhoto={studentForPhotoEdit}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
