import React from 'react';
import { Users, UserCheck, UserX, Clock, Utensils } from 'lucide-react';
import { AttendanceSummary } from '../utils/excelExport';

interface QuickStatsProps {
  summary: AttendanceSummary;
  absentRolls: number[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ summary, absentRolls }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* 1. Total Students */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold">કુલ સંખ્યા (Total)</span>
          <Users className="w-4 h-4 text-slate-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{summary.total}</span>
          <span className="text-[11px] text-slate-500">
            (કુમાર: {summary.boysTotal}, કન્યા: {summary.girlsTotal})
          </span>
        </div>
      </div>

      {/* 2. Present Students */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-emerald-800 mb-1">
          <span className="text-xs font-bold">હાજર (Present)</span>
          <UserCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black text-emerald-700">{summary.present}</span>
          <span className="text-xs font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-full">
            {summary.percentage}%
          </span>
        </div>
        <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${summary.percentage}%` }}
          />
        </div>
      </div>

      {/* 3. Absent Students */}
      <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-rose-800 mb-1">
          <span className="text-xs font-bold">ગેરહાજર (Absent)</span>
          <UserX className="w-4 h-4 text-rose-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-rose-700">{summary.absent}</span>
          {absentRolls.length > 0 && (
            <span className="text-[11px] text-rose-600 font-medium truncate max-w-[110px]" title={`ગેરહાજર રોલ નં: ${absentRolls.join(', ')}`}>
              રોલ: {absentRolls.join(', ')}
            </span>
          )}
        </div>
        <div className="text-[10px] text-rose-600/90 mt-1.5 font-medium">
          {summary.absent === 0 ? 'બધા વિદ્યાર્થી હાજર છે! 🎉' : `${summary.absent} વિદ્યાર્થી ગેરહાજર`}
        </div>
      </div>

      {/* 4. Leave */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-amber-800 mb-1">
          <span className="text-xs font-bold">રજા (Leave)</span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-700">{summary.leave}</span>
          <span className="text-[11px] text-amber-600 font-medium">અરજી સાથે</span>
        </div>
        <div className="text-[10px] text-amber-700/80 mt-1.5 font-medium">
          મંજૂર રજા પર
        </div>
      </div>

      {/* 5. MDM (મધ્યાહ્ન ભોજન) Count */}
      <div className="col-span-2 md:col-span-1 bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-indigo-800 mb-1">
          <span className="text-xs font-bold">MDM ભોજન સંખ્યા</span>
          <Utensils className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-indigo-700">{summary.present}</span>
          <span className="text-[11px] text-indigo-600 font-medium">હાજર થાળી</span>
        </div>
        <div className="text-[10px] text-indigo-700/80 mt-1.5 font-medium">
          કુમાર: {summary.boysPresent} | કન્યા: {summary.girlsPresent}
        </div>
      </div>
    </div>
  );
};
