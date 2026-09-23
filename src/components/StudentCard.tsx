import React, { useState } from 'react';
import { Check, X, Clock, Camera, Sparkles } from 'lucide-react';
import { Student, AttendanceStatus, DayRecord } from '../types';

interface StudentCardProps {
  student: Student;
  record?: DayRecord;
  onToggleStatus: (studentId: string) => void;
  onSetStatus: (studentId: string, status: AttendanceStatus) => void;
  onEditPhoto?: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  record,
  onToggleStatus,
  onSetStatus,
  onEditPhoto
}) => {
  const [justUpdated, setJustUpdated] = useState(false);
  const status: AttendanceStatus = record ? record.status : 'P';

  const handleClick = (e: React.MouseEvent) => {
    // Avoid double trigger if clicking internal mini buttons
    if ((e.target as HTMLElement).closest('.status-btn') || (e.target as HTMLElement).closest('.camera-btn')) {
      return;
    }
    triggerSaveAnimation();
    onToggleStatus(student.id);
  };

  const handleSelectStatus = (e: React.MouseEvent, newStatus: AttendanceStatus) => {
    e.stopPropagation();
    triggerSaveAnimation();
    onSetStatus(student.id, newStatus);
  };

  const triggerSaveAnimation = () => {
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 900);
  };

  // Status visual themes
  const statusConfig = {
    P: {
      border: 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-50/60',
      badge: 'bg-emerald-600 text-white shadow-sm',
      label: 'હાજર (Present)',
      short: 'P',
      icon: Check,
      tagBg: 'text-emerald-700 bg-emerald-100/80'
    },
    A: {
      border: 'border-rose-500 ring-2 ring-rose-400/40 bg-rose-50/70',
      badge: 'bg-rose-600 text-white shadow-sm',
      label: 'ગેરહાજર (Absent)',
      short: 'A',
      icon: X,
      tagBg: 'text-rose-700 bg-rose-100/80'
    },
    L: {
      border: 'border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/70',
      badge: 'bg-amber-600 text-white shadow-sm',
      label: 'રજા (Leave)',
      short: 'L',
      icon: Clock,
      tagBg: 'text-amber-700 bg-amber-100/80'
    },
    H: {
      border: 'border-sky-500 ring-2 ring-sky-400/40 bg-sky-50/70',
      badge: 'bg-sky-600 text-white shadow-sm',
      label: 'અડધો દિવસ (Half)',
      short: 'H',
      icon: Clock,
      tagBg: 'text-sky-700 bg-sky-100/80'
    }
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerSaveAnimation();
          onToggleStatus(student.id);
        }
      }}
      className={`relative group cursor-pointer select-none rounded-2xl border-2 p-3.5 transition-all duration-150 transform active:scale-95 shadow-sm hover:shadow-md ${statusConfig.border}`}
    >
      {/* Save Flash Indicator */}
      {justUpdated && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-slate-900 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow animate-bounce">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Excel માં સેવ!</span>
        </div>
      )}

      {/* Header with Roll No and Gender */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-xs">
            {student.rollNo}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {student.grNo}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <span>{student.gender === 'M' ? 'કુમાર' : 'કન્યા'}</span>
          {record?.timestamp && (
            <span className="text-slate-400 hidden sm:inline">· {record.timestamp}</span>
          )}
        </div>
      </div>

      {/* Photo and Primary Info */}
      <div className="flex items-center gap-3">
        {/* Photo with Camera Overlay */}
        <div className="relative shrink-0">
          <img
            src={student.photo}
            alt={student.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white shadow-xs bg-slate-100 transition-transform group-hover:scale-105"
            loading="lazy"
          />
          {onEditPhoto && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditPhoto(student);
              }}
              title="ફોટો બદલો (Change Photo)"
              className="camera-btn absolute -bottom-1 -right-1 p-1 bg-white/95 rounded-full shadow border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Status Icon Badge on Photo */}
          <div className={`absolute -top-1 -left-1 p-1 rounded-full ${statusConfig.badge}`}>
            <StatusIcon className="w-3 h-3 stroke-[3]" />
          </div>
        </div>

        {/* Student Name */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
            {student.name}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {student.nameEn}
          </p>

          {/* Current Status Pill */}
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${statusConfig.tagBg}`}>
              <StatusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{statusConfig.label}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Selector Strip (Direct Click for P / A / L) */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-1">
        <span className="text-[10px] text-slate-500 font-medium">ક્લિકથી બદલો:</span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => handleSelectStatus(e, 'P')}
            className={`status-btn px-2 py-1 text-[11px] font-bold rounded transition-colors ${
              status === 'P'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            હાજર (P)
          </button>

          <button
            type="button"
            onClick={(e) => handleSelectStatus(e, 'A')}
            className={`status-btn px-2 py-1 text-[11px] font-bold rounded transition-colors ${
              status === 'A'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            ગેરહાજર (A)
          </button>

          <button
            type="button"
            onClick={(e) => handleSelectStatus(e, 'L')}
            className={`status-btn px-2 py-1 text-[11px] font-bold rounded transition-colors ${
              status === 'L'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            રજા (L)
          </button>
        </div>
      </div>
    </div>
  );
};
