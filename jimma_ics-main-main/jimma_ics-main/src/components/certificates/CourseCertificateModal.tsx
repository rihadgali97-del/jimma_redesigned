import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import {
  Download,
  Printer,
  Award,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Palette,
  FileText,
  User,
  BookOpen,
  Calendar,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
} from 'lucide-react';
import { Student } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import {
  CertificateTemplate,
  CertificateData,
  CertificateTheme,
} from './CertificateTemplate';
import {
  drawCertificateOnCanvas,
  downloadCanvasAsPdf,
  downloadCanvasAsPng,
} from '../../utils/canvasCertificateDrawer';

interface CourseCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

// Accredited course preset definitions
const COURSE_PRESETS = [
  {
    id: 'khatm_quran',
    title: 'Holy Quran Full Memorization (Khatm Sanad)',
    arabicTitle: 'إِجَازَةُ خَتْمِ وَحِفْظِ الْقُرْآنِ الْكَرِيمِ',
    category: 'Tahfeez al-Quran',
    defaultMilestone: '30 Juz Complete with Sanad Recitation',
    arabicStudentTitle: 'حَافِظُ كِتَابِ اللَّهِ',
    honorsNote: 'In recognition of mastering the recitation of Hafs from Asim via Shatibiyyah with flawless tajweed and steadfast dedication.',
    defaultGrade: 'Distinction with Highest Honors (Mumtaz)',
    defaultPercentage: 98,
  },
  {
    id: 'tajweed_mastery',
    title: 'Applied Tajweed & Makharij Rules',
    arabicTitle: 'شَهَادَةُ إِتْقَانِ التَّجْوِيدِ وَمَخَارِجِ الْحُرُوفِ',
    category: 'Tajweed Studies',
    defaultMilestone: 'Matn Tuhfat al-Atfal & Al-Jazariyyah',
    arabicStudentTitle: 'مُتْقِنُ أَحْكَامِ التَّجْوِيدِ',
    honorsNote: 'Certified in precise phonetic articulation, theoretical madd rules, and sifaat characteristics.',
    defaultGrade: 'Excellent (Mumtaz)',
    defaultPercentage: 95,
  },
  {
    id: 'fiqh_ibadat',
    title: 'Islamic Jurisprudence (Fiqh al-Ibadat)',
    arabicTitle: 'شَهَادَةُ إِتْمَامِ دِرَاسَةِ فِقْهِ الْعِبَادَاتِ',
    category: 'Shariah Studies',
    defaultMilestone: 'Matn Abi Shuja / Safinat an-Naja',
    arabicStudentTitle: 'طَالِبُ الْعِلْمِ الشَّرْعِيِّ',
    honorsNote: 'Comprehensive comprehension of Taharah, Salah, Zakah, Sawm, and Hajj ordinances.',
    defaultGrade: 'Very Good (Jayyid Jiddan)',
    defaultPercentage: 90,
  },
  {
    id: 'hadith_studies',
    title: 'Hadith Studies (Arba\'in an-Nawawiyyah)',
    arabicTitle: 'شَهَادَةُ حِفْظِ وَفَهْمِ الْأَرْبَعِينَ النَّوَوِيَّةِ',
    category: 'Hadith Sciences',
    defaultMilestone: '42 Prophetic Hadiths with Isnad & Commentary',
    arabicStudentTitle: 'رَاوِي وَحَافِظُ الْحَدِيثِ',
    honorsNote: 'Commendable memorization and theological application of the foundational Prophetic traditions.',
    defaultGrade: 'Distinction with Honors',
    defaultPercentage: 94,
  },
  {
    id: 'arabic_grammar',
    title: 'Arabic Morphology & Grammar (Nahw & Sarf)',
    arabicTitle: 'شَهَادَةُ قَوَاعِدِ اللُّغَةِ الْعَرَبِيَّةِ وَالْآجُرُّومِيَّةِ',
    category: 'Arabic Linguistics',
    defaultMilestone: 'Al-Ajrumiyyah & Tasreef Foundation',
    arabicStudentTitle: 'مُجِيدُ اللُّغَةِ الْعَرَبِيَّةِ',
    honorsNote: 'Mastery of foundational syntax, inflection cases, and verb morphological patterns.',
    defaultGrade: 'Very Good (Jayyid Jiddan)',
    defaultPercentage: 88,
  },
  {
    id: 'ethics_seerah',
    title: 'Islamic Ethics, Adab & Prophetic Seerah',
    arabicTitle: 'شَهَادَةُ الْآدَابِ الْإِسْلَامِيَّةِ وَالسِّيرَةِ النَّبَوِيَّةِ',
    category: 'Islamic Character',
    defaultMilestone: 'Makkan & Madinan Chronology & Adab al-Mufrad',
    arabicStudentTitle: 'طَالِبُ الْآدَابِ وَالسِّيرَةِ',
    honorsNote: 'Exemplary conduct, Islamic etiquette, and deep understanding of the Prophetic biography.',
    defaultGrade: 'Distinction (Mumtaz)',
    defaultPercentage: 96,
  },
];

export const CourseCertificateModal: React.FC<CourseCertificateModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  // Active configuration states
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    student.quranJuzCompleted >= 30 ? 'khatm_quran' : 'tajweed_mastery'
  );
  const [theme, setTheme] = useState<CertificateTheme>('emerald-gold');
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Form Fields
  const [courseTitle, setCourseTitle] = useState('');
  const [arabicCourseTitle, setArabicCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [juzOrMilestone, setJuzOrMilestone] = useState('');
  const [grade, setGrade] = useState('Distinction with Highest Honors (Mumtaz)');
  const [gradePercentage, setGradePercentage] = useState<number>(96);
  const [instructorName, setInstructorName] = useState(student.teacherName || 'Ustadh Yusuf Ali');
  const [instructorTitle, setInstructorTitle] = useState('Senior Quran Recitation Instructor');
  const [principalName, setPrincipalName] = useState('Sheikh Abdulqadir Jimma');
  const [boardPresident, setBoardPresident] = useState('Sheikh Muhammad Nur Kedir');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [hijriDate, setHijriDate] = useState('15 Safar 1448 AH');
  const [honorsNote, setHonorsNote] = useState('');

  // Auto-fill from preset
  useEffect(() => {
    const preset = COURSE_PRESETS.find((p) => p.id === selectedPresetId) || COURSE_PRESETS[0];
    setCourseTitle(preset.title);
    setArabicCourseTitle(preset.arabicTitle);
    setCourseCategory(preset.category);
    setJuzOrMilestone(
      selectedPresetId === 'khatm_quran'
        ? `${student.quranJuzCompleted >= 30 ? '30 Juz Full Quran' : `${student.quranJuzCompleted} Juz Tahfeez`} with verified Tajweed`
        : preset.defaultMilestone
    );
    setGrade(preset.defaultGrade);
    setGradePercentage(student.examScoreAvg || preset.defaultPercentage);
    setHonorsNote(preset.honorsNote);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setCertificateNumber(`JIC-${preset.category.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${student.id.toUpperCase()}-${randomSuffix}`);

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setIssueDate(today);
  }, [selectedPresetId, student]);

  const certificateData: CertificateData = {
    studentName: student.name,
    arabicStudentName: student.arabicName,
    studentId: student.id,
    madrasaName: student.madrasaName || 'Madrasa Al-Hikmah, Jimma',
    courseTitle,
    arabicCourseTitle,
    courseCategory,
    juzOrMilestone,
    grade,
    gradePercentage,
    issueDate,
    hijriDate,
    certificateNumber,
    instructorName,
    instructorTitle,
    principalName,
    boardPresident,
    accreditationBody: 'SUPREME ISLAMIC AFFAIRS BOARD OF JIMMA ZONE',
    verificationUrl: `https://jimma-islamic-affairs.et/verify/${certificateNumber}`,
    honorsNote,
  };

  // Direct Native Canvas-based PDF Generation Engine (0 external DOM dependency, 0 oklch error)
  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress('Rendering high-resolution vector canvas...');

      const canvas = document.createElement('canvas');
      drawCertificateOnCanvas(canvas, certificateData, theme);

      setGenerationProgress('Assembling printable Landscape A4 PDF document...');
      const safeStudentName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
      const safeCourse = courseTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Certificate_${safeStudentName}_${safeCourse}.pdf`;

      downloadCanvasAsPdf(canvas, fileName);
    } catch (err) {
      console.error('Failed to generate PDF certificate:', err);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  // Direct Native Canvas-based PNG Image Download
  const handleDownloadPng = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress('Rendering high-definition raster image...');

      const canvas = document.createElement('canvas');
      drawCertificateOnCanvas(canvas, certificateData, theme);

      const safeStudentName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Certificate_${safeStudentName}_HighRes.png`;

      downloadCanvasAsPng(canvas, fileName);
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  // Direct Browser Print using High-Res Canvas
  const handleDirectPrint = () => {
    try {
      const canvas = document.createElement('canvas');
      drawCertificateOnCanvas(canvas, certificateData, theme);
      const imgUrl = canvas.toDataURL('image/png');

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Certificate - ${student.name}</title>
              <style>
                @page { size: landscape; margin: 0; }
                body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; }
                img { width: 100vw; height: 100vh; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${imgUrl}" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  const handleCopyVerification = () => {
    navigator.clipboard.writeText(certificateData.verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-7xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  Course Completion & Sanad Certificate Studio
                </h2>
                <Badge variant="gold">Canvas PDF Engine</Badge>
              </div>
              <p className="text-xs text-stone-500">
                Official accreditation certificate generator for {student.name} • {student.madrasaName}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handleDirectPrint}
            >
              Print
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownloadPng}
              disabled={isGenerating}
            >
              PNG Image
            </Button>
            <Button
              variant="gold"
              size="sm"
              icon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              onClick={handleDownloadPdf}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Main Body: 2-Column Split (Left: Customizer Panel, Right: Live Canvas Preview) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Customizer Sidebar (4 cols) */}
          <div className="lg:col-span-4 p-5 border-r border-stone-200 dark:border-stone-800 overflow-y-auto space-y-5 bg-stone-50/30 dark:bg-stone-900/30">
            {/* Step 1: Select Course Preset */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                1. Select Course / Track
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {COURSE_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-600 text-stone-900 dark:text-stone-100 font-bold shadow-xs'
                          : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{preset.title}</div>
                        <span className="text-[10px] text-stone-400 font-serif block">
                          {preset.arabicTitle}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Aesthetic Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                2. Visual Theme & Border Palette
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('emerald-gold')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    theme === 'emerald-gold'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-700 border border-amber-400" />
                    <span>Imperial Emerald</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Classic Gold Seal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('navy-gold')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    theme === 'navy-gold'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 font-bold text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-950 border border-amber-400" />
                    <span>Midnight Navy</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Royal Gold Foil</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('parchment-maroon')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    theme === 'parchment-maroon'
                      ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/40 font-bold text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-800" />
                    <span>Ottoman Parchment</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Warm Sepia & Ochre</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('slate-bronze')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    theme === 'slate-bronze'
                      ? 'border-stone-600 bg-stone-100 dark:bg-stone-800 font-bold text-stone-900 dark:text-stone-100 ring-2 ring-stone-500/20'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-stone-900 border border-amber-500" />
                    <span>Executive Slate</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Minimalist Bronze</span>
                </button>
              </div>
            </div>

            {/* Step 3: Editable Particulars & Signatures */}
            <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                3. Certificate Parameters
              </label>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                    Course / Milestone Description
                  </label>
                  <input
                    type="text"
                    value={juzOrMilestone}
                    onChange={(e) => setJuzOrMilestone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                      Distinction Level
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    >
                      <option value="Distinction with Highest Honors (Mumtaz)">Distinction (Mumtaz)</option>
                      <option value="Excellent (Mumtaz)">Excellent (Mumtaz)</option>
                      <option value="Very Good (Jayyid Jiddan)">Very Good (Jayyid Jiddan)</option>
                      <option value="Good (Jayyid)">Good (Jayyid)</option>
                      <option value="Successfully Completed">Passed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                      Score Percentage (%)
                    </label>
                    <input
                      type="number"
                      min={60}
                      max={100}
                      value={gradePercentage}
                      onChange={(e) => setGradePercentage(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                      Lead Ustadh / Teacher
                    </label>
                    <input
                      type="text"
                      value={instructorName}
                      onChange={(e) => setInstructorName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                      Board President
                    </label>
                    <input
                      type="text"
                      value={boardPresident}
                      onChange={(e) => setBoardPresident(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                      Hijri Date
                    </label>
                    <input
                      type="text"
                      value={hijriDate}
                      onChange={(e) => setHijriDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                      Reference Code
                    </label>
                    <input
                      type="text"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Link Card */}
            <div className="p-3 bg-stone-100 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs space-y-2">
              <div className="flex items-center justify-between text-stone-700 dark:text-stone-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Digital Verification URL
                </span>
                <button
                  type="button"
                  onClick={handleCopyVerification}
                  className="text-[11px] text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 font-bold"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="text-[10px] text-stone-500 font-mono break-all bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200 dark:border-stone-800">
                {certificateData.verificationUrl}
              </div>
            </div>
          </div>

          {/* Right Live Canvas Preview Panel (8 cols) */}
          <div className="lg:col-span-8 p-6 flex flex-col items-center justify-between bg-stone-950/90 overflow-auto relative">
            {/* Generation Overlay / Spinner */}
            {isGenerating && (
              <div className="absolute inset-0 z-30 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-amber-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <div className="text-sm font-bold font-serif">{generationProgress}</div>
                <div className="text-xs text-stone-400 font-mono">Applying high-DPI canvas buffer...</div>
              </div>
            )}

            {/* Zoom Controls Bar */}
            <div className="w-full flex items-center justify-between pb-3 text-xs text-stone-400 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-200">A4 Landscape Canvas Preview</span>
                <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                  297 × 210 mm
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.1))}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs text-stone-300 w-12 text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.1))}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(0.85)}
                  className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[11px] text-stone-300"
                >
                  Reset Fit
                </button>
              </div>
            </div>

            {/* Printable Certificate Template (Target Element for html2canvas & Print) */}
            <div className="flex-1 w-full flex items-center justify-center py-4 overflow-auto">
              <div
                ref={certificateRef}
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="shadow-2xl"
              >
                <CertificateTemplate data={certificateData} theme={theme} previewMode={false} />
              </div>
            </div>

            {/* Bottom Actions Confirmation */}
            <div className="w-full pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Vector fonts, crisp geometry & golden seals ready for print</span>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={onClose} className="text-stone-300">
                  Close
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  icon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  onClick={handleDownloadPdf}
                  disabled={isGenerating}
                >
                  Download Printable PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
