import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Camera, Upload, Check, UserPlus, Image } from 'lucide-react';
import { Student } from '../types';
import { getStudentAvatarUrl } from '../utils/initialStudents';

interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSaveStudents: (newStudents: Student[]) => void;
  selectedStudentForPhoto?: Student | null;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  isOpen,
  onClose,
  students,
  onSaveStudents,
  selectedStudentForPhoto
}) => {
  const [list, setList] = useState<Student[]>(students);
  const [editingId, setEditingId] = useState<string | null>(selectedStudentForPhoto?.id || null);

  // Form for new/edited student
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [rollNo, setRollNo] = useState<number>(students.length + 1);
  const [grNo, setGrNo] = useState(`GR-${3100 + students.length + 1}`);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [photo, setPhoto] = useState('');

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingId('NEW');
    setName('');
    setNameEn('');
    const nextRoll = list.length > 0 ? Math.max(...list.map(s => s.rollNo)) + 1 : 1;
    setRollNo(nextRoll);
    setGrNo(`GR-${3100 + nextRoll}`);
    setGender('M');
    setPhoto(getStudentAvatarUrl('નવો વિદ્યાર્થી', 'M', nextRoll));
  };

  const handleStartEdit = (s: Student) => {
    setEditingId(s.id);
    setName(s.name);
    setNameEn(s.nameEn);
    setRollNo(s.rollNo);
    setGrNo(s.grNo);
    setGender(s.gender);
    setPhoto(s.photo);
  };

  const handleSaveItem = () => {
    if (!name.trim()) return;

    if (editingId === 'NEW') {
      const newStudent: Student = {
        id: `std_${Date.now()}`,
        rollNo: Number(rollNo),
        grNo: grNo.trim() || `GR-${rollNo}`,
        name: name.trim(),
        nameEn: nameEn.trim() || name.trim(),
        gender,
        photo: photo || getStudentAvatarUrl(name, gender, rollNo)
      };
      const updated = [...list, newStudent].sort((a, b) => a.rollNo - b.rollNo);
      setList(updated);
      onSaveStudents(updated);
    } else if (editingId) {
      const updated = list.map(s => {
        if (s.id === editingId) {
          return {
            ...s,
            rollNo: Number(rollNo),
            grNo: grNo.trim(),
            name: name.trim(),
            nameEn: nameEn.trim() || name.trim(),
            gender,
            photo: photo || s.photo
          };
        }
        return s;
      }).sort((a, b) => a.rollNo - b.rollNo);
      setList(updated);
      onSaveStudents(updated);
    }
    stopCamera();
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('શું તમે ખરેખર આ વિદ્યાર્થીને યાદીમાંથી કાઢી નાખવા માંગો છો?')) {
      const updated = list.filter(s => s.id !== id);
      setList(updated);
      onSaveStudents(updated);
      if (editingId === id) {
        setEditingId(null);
        stopCamera();
      }
    }
  };

  // Photo upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setPhoto(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera start
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 400 }, height: { ideal: 400 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('કેમેરો શરૂ કરવામાં સમસ્યા આવી. કૃપા કરીને બ્રાઉઝરમાં કેમેરા પરમિશન આપો.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 240, 240);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>વિદ્યાર્થી સંચાલન (Class 7 Student Roster)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              કુલ સંખ્યા: {list.length} વિદ્યાર્થીઓ · નવો વિદ્યાર્થી ઉમેરો અથવા ફોટો બદલો
            </p>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Add / Edit Form Panel */}
          {editingId ? (
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-bold text-slate-800 text-sm">
                  {editingId === 'NEW' ? '➕ નવો વિદ્યાર્થી ઉમેરો' : '✏️ વિદ્યાર્થી વિગત / ફોટો અપડેટ'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setEditingId(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  રદ કરો (Cancel)
                </button>
              </div>

              {/* Photo & Camera Section */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  {isCameraActive ? (
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-black border-2 border-emerald-500">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="absolute bottom-1 inset-x-2 bg-emerald-600 text-white text-[10px] font-bold py-1 rounded shadow"
                      >
                        ક્લિક કરો
                      </button>
                    </div>
                  ) : (
                    <img
                      src={photo || getStudentAvatarUrl(name || 'વિદ્યાર્થી', gender, rollNo)}
                      alt="Student"
                      className="w-24 h-24 rounded-xl border-2 border-slate-300 object-cover bg-white shadow-xs"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">વિદ્યાર્થીનો ફોટો:</div>
                  <div className="flex flex-wrap gap-2">
                    {!isCameraActive ? (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>કેમેરાથી ફોટો લો</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
                      >
                        કેમેરો બંધ કરો
                      </button>
                    )}

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ગેલેરીમાંથી અપલોડ</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>

                    <button
                      type="button"
                      onClick={() => setPhoto(getStudentAvatarUrl(name, gender, rollNo))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300"
                    >
                      <Image className="w-3.5 h-3.5" />
                      <span>ડિફોલ્ટ અવતાર</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    વિદ્યાર્થીનું નામ (ગુજરાતીમાં) *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="દા.ત. પટેલ આરવ જીગ્નેશભાઈ"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name (English)
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Patel Aarav Jigneshbhai"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      રોલ નં. (Roll No)
                    </label>
                    <input
                      type="number"
                      value={rollNo}
                      onChange={(e) => setRollNo(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      જી.આર. નં. (GR No)
                    </label>
                    <input
                      type="text"
                      value={grNo}
                      onChange={(e) => setGrNo(e.target.value)}
                      placeholder="GR-3101"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    જાતિ (Gender)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('M')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        gender === 'M'
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      કુમાર (Boy)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('F')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        gender === 'F'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      કન્યા (Girl)
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setEditingId(null);
                  }}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  રદ કરો
                </button>
                <button
                  type="button"
                  onClick={handleSaveItem}
                  disabled={!name.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>સેવ કરો (Save Student)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-600">
                નવા વિદ્યાર્થીને યાદીમાં ઉમેરવા માટે નીચેનું બટન દબાવો:
              </span>
              <button
                type="button"
                onClick={handleStartAdd}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>નવો વિદ્યાર્થી ઉમેરો</span>
              </button>
            </div>
          )}

          {/* Student List */}
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {list.map((s) => (
              <div key={s.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    {s.rollNo}
                  </span>
                  <img
                    src={s.photo}
                    alt={s.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                    <p className="text-xs text-slate-400">
                      {s.nameEn} · {s.gender === 'M' ? 'કુમાર' : 'કન્યા'} · {s.grNo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(s)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                  >
                    સુધારો
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="કાઢી નાખો"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
          >
            પૂર્ણ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
