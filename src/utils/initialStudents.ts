import { Student, SchoolConfig } from '../types';

// Deterministic high-quality student avatar generator
export function getStudentAvatarUrl(name: string, gender: 'M' | 'F', index: number): string {
  // Generates clean styled SVG avatars for student ID cards
  const boyPalettes = [
    { bg: '#0284c7', skin: '#fcd34d', shirt: '#0369a1', hair: '#1e293b' },
    { bg: '#0d9488', skin: '#fde047', shirt: '#0f766e', hair: '#0f172a' },
    { bg: '#4f46e5', skin: '#fed7aa', shirt: '#4338ca', hair: '#334155' },
    { bg: '#2563eb', skin: '#fcd34d', shirt: '#1d4ed8', hair: '#18181b' },
    { bg: '#059669', skin: '#ffedd5', shirt: '#047857', hair: '#292524' },
    { bg: '#ea580c', skin: '#fde047', shirt: '#c2410c', hair: '#1e293b' },
  ];

  const girlPalettes = [
    { bg: '#db2777', skin: '#fed7aa', shirt: '#be185d', hair: '#1e293b' },
    { bg: '#7c3aed', skin: '#fde047', shirt: '#6d28d9', hair: '#0f172a' },
    { bg: '#e11d48', skin: '#ffedd5', shirt: '#be123c', hair: '#27272a' },
    { bg: '#d97706', skin: '#fed7aa', shirt: '#b45309', hair: '#1c1917' },
    { bg: '#9333ea', skin: '#fde047', shirt: '#7e22ce', hair: '#18181b' },
    { bg: '#0891b2', skin: '#fed7aa', shirt: '#0e7490', hair: '#1e293b' },
  ];

  const palette = gender === 'F' 
    ? girlPalettes[index % girlPalettes.length] 
    : boyPalettes[index % boyPalettes.length];

  const initials = name.split(' ')[0]?.slice(0, 2) || (gender === 'F' ? 'ક' : 'કુ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <rect width="120" height="120" rx="60" fill="${palette.bg}"/>
    <g transform="translate(10, 8)">
      <!-- Shoulders & Uniform -->
      <path d="M 15 104 C 15 76, 85 76, 85 104 Z" fill="${palette.shirt}" />
      <!-- Collar -->
      <polygon points="40,82 50,96 60,82" fill="#ffffff" />
      <polygon points="35,80 43,92 50,82" fill="#e2e8f0" />
      <polygon points="65,80 57,92 50,82" fill="#e2e8f0" />
      
      <!-- Head / Face -->
      <circle cx="50" cy="52" r="26" fill="${palette.skin}" />
      
      <!-- Hair -->
      ${gender === 'F' ? `
        <!-- Girl Hair with Ponytails/braids style -->
        <path d="M 22 52 C 20 28, 80 28, 78 52 C 78 35, 22 35, 22 52" fill="${palette.hair}" />
        <circle cx="21" cy="54" r="6" fill="${palette.hair}" />
        <circle cx="79" cy="54" r="6" fill="${palette.hair}" />
        <!-- Ribbon -->
        <circle cx="22" cy="48" r="3.5" fill="#f43f5e" />
        <circle cx="78" cy="48" r="3.5" fill="#f43f5e" />
      ` : `
        <!-- Boy Neat Student Haircut -->
        <path d="M 24 50 C 22 28, 78 28, 76 50 C 74 34, 26 34, 24 50" fill="${palette.hair}" />
        <path d="M 24 42 Q 50 25 76 42 Q 50 32 24 42" fill="${palette.hair}" />
      `}
      
      <!-- Eyes & Smile -->
      <circle cx="41" cy="53" r="3" fill="#1e293b" />
      <circle cx="59" cy="53" r="3" fill="#1e293b" />
      <circle cx="42" cy="52" r="0.9" fill="#ffffff" />
      <circle cx="60" cy="52" r="0.9" fill="#ffffff" />
      <!-- Smile -->
      <path d="M 43 62 Q 50 69 57 62" stroke="#991b1b" stroke-width="2" stroke-linecap="round" fill="none" />
      <!-- Cheeks -->
      <circle cx="36" cy="59" r="3" fill="#f43f5e" opacity="0.35" />
      <circle cx="64" cy="59" r="3" fill="#f43f5e" opacity="0.35" />
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface RawStudent {
  id: string;
  rollNo: number;
  grNo: string;
  name: string;
  nameEn: string;
  gender: 'M' | 'F';
  photo: string;
}

const RAW_STUDENTS: RawStudent[] = [
  { id: 'std_01', rollNo: 1, grNo: 'GR-3101', name: 'પટેલ આરવ જીગ્નેશભાઈ', nameEn: 'Patel Aarav Jigneshbhai', gender: 'M', photo: '' },
  { id: 'std_02', rollNo: 2, grNo: 'GR-3102', name: 'ચૌહાણ પ્રિયા રમેશભાઈ', nameEn: 'Chauhan Priya Rameshbhai', gender: 'F', photo: '' },
  { id: 'std_03', rollNo: 3, grNo: 'GR-3103', name: 'પરમાર આયુષ મુકેશભાઈ', nameEn: 'Parmar Ayush Mukeshbhai', gender: 'M', photo: '' },
  { id: 'std_04', rollNo: 4, grNo: 'GR-3104', name: 'મકવાણા દિયા કમલેશભાઈ', nameEn: 'Makwana Diya Kamleshbhai', gender: 'F', photo: '' },
  { id: 'std_05', rollNo: 5, grNo: 'GR-3105', name: 'રાઠોડ હર્ષ સંજયભાઈ', nameEn: 'Rathod Harsh Sanjaybhai', gender: 'M', photo: '' },
  { id: 'std_06', rollNo: 6, grNo: 'GR-3106', name: 'વણકર નેહા દિનેશભાઈ', nameEn: 'Vankar Neha Dineshbhai', gender: 'F', photo: '' },
  { id: 'std_07', rollNo: 7, grNo: 'GR-3107', name: 'સોલંકી ક્રિશ નરેશભાઈ', nameEn: 'Solanki Krish Nareshbhai', gender: 'M', photo: '' },
  { id: 'std_08', rollNo: 8, grNo: 'GR-3108', name: 'વાઘેલા ખુશી પ્રવીણભાઈ', nameEn: 'Vaghela Khushi Pravinbhai', gender: 'F', photo: '' },
  { id: 'std_09', rollNo: 9, grNo: 'GR-3109', name: 'જાડેજા યુવરાજસિંહ હિતેન્દ્રસિંહ', nameEn: 'Jadeja Yuvrajsinh H.', gender: 'M', photo: '' },
  { id: 'std_10', rollNo: 10, grNo: 'GR-3110', name: 'શાહ ત્રિશા નિલેશભાઈ', nameEn: 'Shah Trisha Nileshbhai', gender: 'F', photo: '' },
  { id: 'std_11', rollNo: 11, grNo: 'GR-3111', name: 'ઠાકોર રાહુલ બાબુભાઈ', nameEn: 'Thakor Rahul Babubhai', gender: 'M', photo: '' },
  { id: 'std_12', rollNo: 12, grNo: 'GR-3112', name: 'પ્રજાપતિ હેત્વી મહેશભાઈ', nameEn: 'Prajapati Hetvi Maheshbhai', gender: 'F', photo: '' },
  { id: 'std_13', rollNo: 13, grNo: 'GR-3113', name: 'દેસાઈ કરણ ભરતભાઈ', nameEn: 'Desai Karan Bharatbhai', gender: 'M', photo: '' },
  { id: 'std_14', rollNo: 14, grNo: 'GR-3114', name: 'ગોહિલ ધ્વનિ કિશોરભાઈ', nameEn: 'Gohil Dhwani Kishorbhai', gender: 'F', photo: '' },
  { id: 'std_15', rollNo: 15, grNo: 'GR-3115', name: 'ચાવડા જયદીપ અરવિંદભાઈ', nameEn: 'Chavda Jaydeep Arvindbhai', gender: 'M', photo: '' },
  { id: 'std_16', rollNo: 16, grNo: 'GR-3116', name: 'રાવલ અનન્યા દર્શનભાઈ', nameEn: 'Raval Ananya Darshanbhai', gender: 'F', photo: '' },
  { id: 'std_17', rollNo: 17, grNo: 'GR-3117', name: 'પંડ્યા દક્ષ દિલીપભાઈ', nameEn: 'Pandya Daksh Dilipphai', gender: 'M', photo: '' },
  { id: 'std_18', rollNo: 18, grNo: 'GR-3118', name: 'બારિયા રીના સુરેશભાઈ', nameEn: 'Bariya Rina Sureshbhai', gender: 'F', photo: '' },
  { id: 'std_19', rollNo: 19, grNo: 'GR-3119', name: 'જોષી ઓમ વિપુલભાઈ', nameEn: 'Joshi Om Vipulbhai', gender: 'M', photo: '' },
  { id: 'std_20', rollNo: 20, grNo: 'GR-3120', name: 'દરજી કાવ્યા જગદીશભાઈ', nameEn: 'Darji Kavya Jagdishbhai', gender: 'F', photo: '' },
  { id: 'std_21', rollNo: 21, grNo: 'GR-3121', name: 'મેવાડા મનન અશ્વિનભાઈ', nameEn: 'Mewada Manan Ashwinbhai', gender: 'M', photo: '' },
  { id: 'std_22', rollNo: 22, grNo: 'GR-3122', name: 'સોની શ્રેયા ભાવેશભાઈ', nameEn: 'Soni Shreya Bhaveshbhai', gender: 'F', photo: '' },
  { id: 'std_23', rollNo: 23, grNo: 'GR-3123', name: 'મોરી આકાશ રાજેશભાઈ', nameEn: 'Mori Akash Rajeshbhai', gender: 'M', photo: '' },
  { id: 'std_24', rollNo: 24, grNo: 'GR-3124', name: 'તડવી પૂજા રમણભાઈ', nameEn: 'Tadvi Pooja Ramanbhai', gender: 'F', photo: '' }
];

export const INITIAL_STUDENTS: Student[] = RAW_STUDENTS.map((s, idx) => ({
  ...s,
  photo: getStudentAvatarUrl(s.name, s.gender, idx)
}));

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  schoolName: 'શ્રી પ્રાથમિક શાળા - ગાંધીનગર',
  className: 'ધોરણ ૭ (Class 7)',
  division: 'વર્ગ - અ (Div A)',
  teacherName: 'શ્રી આર. કે. પટેલ',
  academicYear: '૨૦૨૬ - ૨૦૨૭',
  district: 'ગાંધીનગર',
  taluka: 'ગાંધીનગર',
  schoolCode: '24070100101'
};
