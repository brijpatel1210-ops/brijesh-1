import React from 'react';
import { 
  FileSpreadsheet, 
  Users, 
  Calendar, 
  Volume2, 
  VolumeX, 
  Settings, 
  Share2, 
  Download,
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SchoolConfig, ViewTab } from '../types';
import { formatGujaratiDate, getTodayDateString } from '../utils/storage';

interface NavbarProps {
  config: SchoolConfig;
  currentDate: string;
  onDateChange: (newDate: string) => void;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenExcelPreview: () => void;
  onDirectExcelDownload: () => void;
  onOpenSettings: () => void;
  onOpenWhatsApp: () => void;
  onOpenStudents: () => void;
  lastSavedNotice: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  currentDate,
  onDateChange,
  activeTab,
  onTabChange,
  soundEnabled,
  onToggleSound,
  onOpenExcelPreview,
  onDirectExcelDownload,
  onOpenSettings,
  onOpenWhatsApp,
  onOpenStudents,
  lastSavedNotice
}) => {
  const today = getTodayDateString();
  const isToday = currentDate === today;

  const handlePrevDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    const formatted = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
    onDateChange(formatted);
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    const formatted = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
    onDateChange(formatted);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Bar with School Name and Primary Excel Action */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & School Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-sm font-black text-lg">
            ૭
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">
                ધોરણ ૭ ફોટો હાજરી પત્રક
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                {config.division}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>{config.schoolName}</span>
              <span className="text-slate-300">·</span>
              <span className="text-emerald-700 font-medium">{config.teacherName}</span>
            </p>
          </div>
        </div>

        {/* Live Auto-Save Pill & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Real-time Save Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-medium">{lastSavedNotice}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title={soundEnabled ? 'અવાજ બંધ કરો' : 'અવાજ ચાલુ કરો'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={onOpenWhatsApp}
            className="p-2 sm:px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            title="WhatsApp રિપોર્ટ"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Excel Preview Modal */}
          <button
            onClick={onOpenExcelPreview}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Excel Sheet પ્રીવ્યૂ"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Excel પ્રીવ્યૂ</span>
          </button>

          {/* Direct Excel Download (.xlsx) */}
          <button
            onClick={onDirectExcelDownload}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95"
            title="આજની હાજરી એક્સેલમાં ડાઉનલોડ કરો"
          >
            <Download className="w-4 h-4" />
            <span>Excel ડાઉનલોડ</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="સેટિંગ્સ"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Bar & Sub Navigation */}
      <div className="bg-slate-50/80 border-t border-slate-200/60 px-3 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Date Picker Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600"
              title="અગાઉનો દિવસ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600"
              title="આગામી દિવસ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday ? (
              <button
                onClick={() => onDateChange(today)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                આજની તારીખ
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                આજે
              </span>
            )}

            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              · {formatGujaratiDate(currentDate)}
            </span>
          </div>

          {/* View Segmented Tabs */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl gap-1">
            <button
              onClick={() => onTabChange('daily')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'daily'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>ફોટો હાજરી</span>
            </button>

            <button
              onClick={() => onTabChange('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'monthly'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>માસિક પત્રક</span>
            </button>

            <button
              onClick={onOpenStudents}
              className="px-3 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>વિદ્યાર્થી યાદી</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
