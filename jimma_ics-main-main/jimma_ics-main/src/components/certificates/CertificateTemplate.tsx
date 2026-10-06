import React from 'react';
import { Award, ShieldCheck, QrCode } from 'lucide-react';

export type CertificateTheme = 'emerald-gold' | 'navy-gold' | 'parchment-maroon' | 'slate-bronze';

export interface CertificateData {
  studentName: string;
  arabicStudentName?: string;
  studentId: string;
  madrasaName: string;
  courseTitle: string;
  arabicCourseTitle: string;
  courseCategory: string;
  juzOrMilestone: string;
  grade: string;
  gradePercentage?: number;
  issueDate: string;
  hijriDate: string;
  certificateNumber: string;
  instructorName: string;
  instructorTitle: string;
  principalName: string;
  boardPresident: string;
  accreditationBody: string;
  verificationUrl: string;
  honorsNote?: string;
}

interface CertificateTemplateProps {
  data: CertificateData;
  theme?: CertificateTheme;
  previewMode?: boolean;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  data,
  theme = 'emerald-gold',
  previewMode = false,
}) => {
  // Explicit Hex & RGB theme definitions to ensure 100% compatibility with canvas renderers
  const themeHex = {
    'emerald-gold': {
      bg: 'linear-gradient(135deg, #064e3b 0%, #043629 50%, #022c22 100%)',
      outerBorder: '#065f46',
      innerBorder: '#f59e0b',
      cornerAccent: '#fbbf24',
      headerAccent: '#fde047',
      primaryText: '#ffffff',
      secondaryText: '#a7f3d0',
      bodyText: '#e2e8f0',
      strongText: '#fde047',
      sealBg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
      sealText: '#1c1917',
      sealRing: '#fef08a',
      ribbonBg: '#b45309',
      accentPillBg: 'rgba(245, 158, 11, 0.2)',
      accentPillBorder: '#f59e0b',
      accentPillText: '#fde047',
      divider: 'rgba(245, 158, 11, 0.4)',
      watermark: 'rgba(255, 255, 255, 0.04)',
      dateText: '#94a3b8',
    },
    'navy-gold': {
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c0a09 100%)',
      outerBorder: '#1e3a8a',
      innerBorder: '#fbbf24',
      cornerAccent: '#fde047',
      headerAccent: '#fde047',
      primaryText: '#ffffff',
      secondaryText: '#bfdbfe',
      bodyText: '#e2e8f0',
      strongText: '#fde047',
      sealBg: 'linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #b45309 100%)',
      sealText: '#0f172a',
      sealRing: '#fef9c3',
      ribbonBg: '#1d4ed8',
      accentPillBg: 'rgba(59, 130, 246, 0.2)',
      accentPillBorder: '#3b82f6',
      accentPillText: '#93c5fd',
      divider: 'rgba(251, 191, 36, 0.4)',
      watermark: 'rgba(255, 255, 255, 0.04)',
      dateText: '#94a3b8',
    },
    'parchment-maroon': {
      bg: 'linear-gradient(135deg, #fdfbf7 0%, #f7f2e7 50%, #ede3d1 100%)',
      outerBorder: '#78350f',
      innerBorder: '#b45309',
      cornerAccent: '#b45309',
      headerAccent: '#78350f',
      primaryText: '#1c1917',
      secondaryText: '#44403c',
      bodyText: '#292524',
      strongText: '#78350f',
      sealBg: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #78350f 100%)',
      sealText: '#ffffff',
      sealRing: '#f59e0b',
      ribbonBg: '#881337',
      accentPillBg: 'rgba(180, 83, 9, 0.1)',
      accentPillBorder: '#b45309',
      accentPillText: '#78350f',
      divider: 'rgba(180, 83, 9, 0.3)',
      watermark: 'rgba(120, 53, 15, 0.04)',
      dateText: '#78716c',
    },
    'slate-bronze': {
      bg: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
      outerBorder: '#44403c',
      innerBorder: '#d97706',
      cornerAccent: '#f59e0b',
      headerAccent: '#fbbf24',
      primaryText: '#ffffff',
      secondaryText: '#d6d3d1',
      bodyText: '#e7e5e4',
      strongText: '#fbbf24',
      sealBg: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #c2410c 100%)',
      sealText: '#ffffff',
      sealRing: '#fbbf24',
      ribbonBg: '#b45309',
      accentPillBg: 'rgba(245, 158, 11, 0.2)',
      accentPillBorder: '#f59e0b',
      accentPillText: '#fde047',
      divider: 'rgba(217, 119, 6, 0.4)',
      watermark: 'rgba(255, 255, 255, 0.04)',
      dateText: '#a8a29e',
    },
  };

  const t = themeHex[theme] || themeHex['emerald-gold'];

  return (
    <div
      id="certificate-print-container"
      className="relative w-full max-w-[1100px] aspect-[1.414/1] mx-auto p-6 sm:p-8 select-none rounded-2xl shadow-2xl overflow-hidden font-sans"
      style={{
        background: t.bg,
        border: `4px solid ${t.outerBorder}`,
        boxSizing: 'border-box',
        minHeight: previewMode ? 'auto' : '680px',
        color: t.primaryText,
      }}
    >
      {/* Background Subtle Watermark & Islamic Geometry */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{ opacity: 0.05 }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 500 500" className="w-[560px] h-[560px]" style={{ color: t.primaryText }}>
          <circle cx="250" cy="250" r="230" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="250" cy="250" r="190" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
          <polygon points="250,50 420,250 250,450 80,250" fill="none" stroke="currentColor" strokeWidth="2" />
          <polygon points="250,70 400,250 250,430 100,250" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="110" y="110" width="280" height="280" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(45 250 250)" />
        </svg>
      </div>

      {/* Decorative Ornate Double Border & Corner Arabesques */}
      <div
        className="absolute inset-3.5 sm:inset-5 rounded-xl pointer-events-none"
        style={{
          border: `2px solid ${t.innerBorder}`,
        }}
      >
        {/* Top-Left Corner Piece */}
        <div
          className="absolute -top-2.5 -left-2.5 w-8 h-8 rounded-tl-lg"
          style={{ borderTop: `4px solid ${t.cornerAccent}`, borderLeft: `4px solid ${t.cornerAccent}` }}
        />
        <div
          className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: t.cornerAccent }}
        />

        {/* Top-Right Corner Piece */}
        <div
          className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-tr-lg"
          style={{ borderTop: `4px solid ${t.cornerAccent}`, borderRight: `4px solid ${t.cornerAccent}` }}
        />
        <div
          className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: t.cornerAccent }}
        />

        {/* Bottom-Left Corner Piece */}
        <div
          className="absolute -bottom-2.5 -left-2.5 w-8 h-8 rounded-bl-lg"
          style={{ borderBottom: `4px solid ${t.cornerAccent}`, borderLeft: `4px solid ${t.cornerAccent}` }}
        />
        <div
          className="absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: t.cornerAccent }}
        />

        {/* Bottom-Right Corner Piece */}
        <div
          className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-br-lg"
          style={{ borderBottom: `4px solid ${t.cornerAccent}`, borderRight: `4px solid ${t.cornerAccent}` }}
        />
        <div
          className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: t.cornerAccent }}
        />
      </div>

      {/* Main Certificate Content Layout */}
      <div className="relative z-10 flex flex-col justify-between h-full px-4 sm:px-8 py-2">
        {/* SECTION 1: Header with Calligraphy & Council Branding */}
        <div className="text-center space-y-1 sm:space-y-2">
          {/* Bismillah Calligraphy Heading */}
          <div
            className="font-serif text-sm sm:text-base tracking-widest font-bold"
            style={{ color: t.headerAccent }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          <div className="flex items-center justify-center gap-3">
            <div
              className="h-px w-12 sm:w-20"
              style={{ background: `linear-gradient(to right, transparent, ${t.innerBorder}, transparent)` }}
            />
            <span
              className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold font-mono"
              style={{ color: t.headerAccent }}
            >
              {data.accreditationBody}
            </span>
            <div
              className="h-px w-12 sm:w-20"
              style={{ background: `linear-gradient(to right, transparent, ${t.innerBorder}, transparent)` }}
            />
          </div>

          {/* Certificate Main Title (Arabic & English) */}
          <div className="space-y-0.5 pt-1">
            <h1
              className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide"
              style={{ color: t.headerAccent }}
            >
              {data.arabicCourseTitle || 'شَهَادَةُ إِتْمَامٍ وَإِجَازَةٍ عِلْمِيَّةٍ'}
            </h1>
            <h2
              className="font-serif text-base sm:text-lg lg:text-xl font-bold uppercase tracking-wider"
              style={{ color: t.headerAccent }}
            >
              Certificate of Academic Excellence & Course Completion
            </h2>
            <div className="text-[11px] sm:text-xs font-medium" style={{ color: t.secondaryText }}>
              Official Sanad & Accreditation issued under the auspices of the Jimma Islamic Affairs Board
            </div>
          </div>
        </div>

        {/* SECTION 2: Body / Student Award Statement */}
        <div className="text-center space-y-3 my-2 sm:my-3">
          <p className="text-xs sm:text-sm font-medium" style={{ color: t.secondaryText }}>
            This is to formally certify and attest that the student:
          </p>

          {/* Student Name Display */}
          <div className="space-y-1">
            <div className="inline-block relative">
              <h3
                className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-wide px-4 py-1"
                style={{ color: t.primaryText }}
              >
                {data.studentName}
              </h3>
              {data.arabicStudentName && (
                <span className="block font-serif text-sm sm:text-base font-medium" style={{ color: t.headerAccent }}>
                  {data.arabicStudentName}
                </span>
              )}
              <div
                className="h-0.5 w-full mt-1"
                style={{ background: `linear-gradient(to right, transparent, ${t.innerBorder}, transparent)` }}
              />
            </div>
          </div>

          {/* Achievement Description */}
          <div
            className="max-w-2xl mx-auto text-xs sm:text-[13px] leading-relaxed px-2"
            style={{ color: t.bodyText }}
          >
            <span>Has with distinction completed the prescribed syllabus for </span>
            <strong className="font-bold font-serif text-sm sm:text-base" style={{ color: t.strongText }}>
              {data.courseTitle}
            </strong>
            <span> at </span>
            <strong className="font-semibold" style={{ color: t.primaryText }}>{data.madrasaName}</strong>,
            <span> demonstrating commendable recitation fidelity, disciplined attendance, and mastery of </span>
            <strong className="font-semibold" style={{ color: t.strongText }}>{data.juzOrMilestone}</strong>
            <span> with an evaluation distinction of </span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ml-1"
              style={{
                backgroundColor: t.accentPillBg,
                border: `1px solid ${t.accentPillBorder}`,
                color: t.accentPillText,
              }}
            >
              {data.grade} {data.gradePercentage ? `(${data.gradePercentage}%)` : ''}
            </span>.
          </div>

          {data.honorsNote && (
            <p className="text-[11px] italic max-w-xl mx-auto" style={{ color: t.headerAccent }}>
              "{data.honorsNote}"
            </p>
          )}
        </div>

        {/* SECTION 3: Metadata, Golden Seal, & Signatures */}
        <div className="pt-2 sm:pt-3" style={{ borderTop: `1px solid ${t.divider}` }}>
          <div className="grid grid-cols-3 items-end gap-2 sm:gap-4 text-center">
            {/* Left Column: Lead Ustadh Signature */}
            <div className="space-y-1 text-left sm:text-center">
              <div
                className="font-serif italic text-xs sm:text-sm h-6 flex items-end justify-center"
                style={{ color: t.headerAccent }}
              >
                {data.instructorName}
              </div>
              <div className="h-px w-3/4 mx-auto" style={{ backgroundColor: t.innerBorder }} />
              <div className="text-[10px] sm:text-xs font-bold" style={{ color: t.primaryText }}>
                {data.instructorName}
              </div>
              <div className="text-[9px] sm:text-[10px]" style={{ color: t.secondaryText }}>
                {data.instructorTitle || 'Lead Tahfeez Instructor'}
              </div>
            </div>

            {/* Center Column: Official Golden Seal & Badge */}
            <div className="flex flex-col items-center justify-center -my-2 relative">
              <div className="relative flex items-center justify-center">
                {/* Ribbon tails */}
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-3/4 w-3 h-7 rotate-12 rounded-b-sm shadow-md"
                  style={{ backgroundColor: t.ribbonBg }}
                />
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/4 w-3 h-7 -rotate-12 rounded-b-sm shadow-md"
                  style={{ backgroundColor: t.ribbonBg }}
                />

                {/* Golden Medallion */}
                <div
                  className="relative z-10 w-14 h-14 sm:w-18 sm:h-18 rounded-full p-1 shadow-lg flex flex-col items-center justify-center text-center"
                  style={{
                    background: t.sealBg,
                    border: `2px solid ${t.sealRing}`,
                    color: t.sealText,
                  }}
                >
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: t.sealText }} />
                  <span
                    className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter leading-none font-mono mt-0.5"
                    style={{ color: t.sealText }}
                  >
                    OFFICIAL SEAL
                  </span>
                  <span
                    className="text-[6px] sm:text-[7px] font-bold leading-none"
                    style={{ color: t.sealText }}
                  >
                    ACCREDITED
                  </span>
                </div>
              </div>

              <div className="mt-2 text-[9px] sm:text-[10px] font-mono" style={{ color: t.headerAccent }}>
                {data.certificateNumber}
              </div>
            </div>

            {/* Right Column: Board President / Director Signature */}
            <div className="space-y-1 text-right sm:text-center">
              <div
                className="font-serif italic text-xs sm:text-sm h-6 flex items-end justify-center"
                style={{ color: t.headerAccent }}
              >
                {data.boardPresident}
              </div>
              <div className="h-px w-3/4 mx-auto" style={{ backgroundColor: t.innerBorder }} />
              <div className="text-[10px] sm:text-xs font-bold" style={{ color: t.primaryText }}>
                {data.boardPresident}
              </div>
              <div className="text-[9px] sm:text-[10px]" style={{ color: t.secondaryText }}>
                President, Jimma Islamic Affairs Board
              </div>
            </div>
          </div>

          {/* Bottom Security Strip with QR Representation & Issue Dates */}
          <div
            className="flex items-center justify-between mt-3 pt-2 text-[9px] sm:text-[10px] font-mono"
            style={{ borderTop: `1px solid ${t.divider}`, color: t.dateText }}
          >
            <div className="flex items-center gap-3">
              <span>Date: <strong style={{ color: t.primaryText }}>{data.issueDate}</strong></span>
              <span>•</span>
              <span>Hijri: <strong style={{ color: t.primaryText }}>{data.hijriDate}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: t.headerAccent }} />
              <span style={{ color: t.bodyText }}>Authenticity Verified via Jimma Majlis Portal</span>
            </div>

            <div className="flex items-center gap-1.5 font-bold" style={{ color: t.headerAccent }}>
              <QrCode className="w-3.5 h-3.5" />
              <span>Verify: {data.certificateNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
