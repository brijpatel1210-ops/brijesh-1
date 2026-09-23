import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { Student, SchoolConfig, DayRecord } from '../types';
import { calculateSummary } from '../utils/excelExport';
import { formatGujaratiDate } from '../utils/storage';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  students: Student[];
  attendance: Record<string, DayRecord>;
  config: SchoolConfig;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  date,
  students,
  attendance,
  config
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const summary = calculateSummary(students, attendance);
  const formattedDate = formatGujaratiDate(date);

  const absentList = students.filter(s => attendance[s.id]?.status === 'A');
  const leaveList = students.filter(s => attendance[s.id]?.status === 'L');

  const absentRollsText = absentList.length > 0 
    ? absentList.map(s => `${s.rollNo} (${s.name.split(' ')[0]})`).join(', ') 
    : 'કોઈ નહીં (બધા હાજર)';

  const leaveRollsText = leaveList.length > 0
    ? leaveList.map(s => `${s.rollNo} (${s.name.split(' ')[0]})`).join(', ')
    : 'નિલ';

  const shareText = `*📋 દૈનિક હાજરી રિપોર્ટ - ધોરણ ૭*
🏫 *શાળા:* ${config.schoolName}
📅 *તારીખ:* ${formattedDate}
👨‍🏫 *વર્ગશિક્ષક:* ${config.teacherName}

━━━━━━━━━━━━━━━━━━━
👥 *કુલ વિદ્યાર્થી સંખ્યા:* ${summary.total} (કુમાર: ${summary.boysTotal}, કન્યા: ${summary.girlsTotal})
✅ *હાજર સંખ્યા:* ${summary.present} (${summary.percentage}%)
   ↳ કુમાર હાજર: ${summary.boysPresent}
   ↳ કન્યા હાજર: ${summary.girlsPresent}
❌ *ગેરહાજર સંખ્યા:* ${summary.absent}
   ↳ રોલ નં.: ${absentRollsText}
🟡 *રજા પર:* ${summary.leave} ${leaveList.length > 0 ? `(રોલ: ${leaveRollsText})` : ''}

🍱 *MDM (મધ્યાહ્ન ભોજન) સંખ્યા:* ${summary.present}
━━━━━━━━━━━━━━━━━━━
_ધોરણ ૭ ફોટો હાજરી પત્રક દ્વારા પ્રસારિત_`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-emerald-200" />
            <h2 className="font-bold text-base sm:text-lg">
              WhatsApp હાજરી રિપોર્ટ શેર
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-600">
            આ મેસેજ સ્કૂલ ગૃપ, CRC અથવા આચાર્યશ્રીને મોકલવા માટે તૈયાર છે:
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
            {shareText}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>મેસેજ કોપી થઈ ગયો!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>મેસેજ કોપી કરો (Copy)</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>WhatsApp પર મોકલો</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            બંધ કરો
          </button>
        </div>
      </div>
    </div>
  );
};
