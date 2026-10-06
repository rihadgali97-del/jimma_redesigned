import jsPDF from 'jspdf';
import { CertificateData, CertificateTheme } from '../components/certificates/CertificateTemplate';

export interface ThemeColors {
  bgGradient: [string, string, string];
  outerBorder: string;
  innerBorder: string;
  cornerAccent: string;
  headerAccent: string;
  primaryText: string;
  secondaryText: string;
  bodyText: string;
  strongText: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  sealGradient: [string, string, string];
  sealRing: string;
  sealText: string;
  ribbon: string;
  divider: string;
  watermark: string;
  dateText: string;
}

export const THEME_PALETTES: Record<CertificateTheme, ThemeColors> = {
  'emerald-gold': {
    bgGradient: ['#064e3b', '#043629', '#022c22'],
    outerBorder: '#065f46',
    innerBorder: '#d97706',
    cornerAccent: '#fbbf24',
    headerAccent: '#fde047',
    primaryText: '#ffffff',
    secondaryText: '#a7f3d0',
    bodyText: '#f1f5f9',
    strongText: '#fde047',
    pillBg: 'rgba(245, 158, 11, 0.25)',
    pillBorder: '#f59e0b',
    pillText: '#fef08a',
    sealGradient: ['#fbbf24', '#f59e0b', '#b45309'],
    sealRing: '#fef08a',
    sealText: '#1c1917',
    ribbon: '#b45309',
    divider: 'rgba(245, 158, 11, 0.4)',
    watermark: 'rgba(255, 255, 255, 0.035)',
    dateText: '#94a3b8',
  },
  'navy-gold': {
    bgGradient: ['#0f172a', '#1e1b4b', '#0c0a09'],
    outerBorder: '#1e3a8a',
    innerBorder: '#f59e0b',
    cornerAccent: '#fde047',
    headerAccent: '#fde047',
    primaryText: '#ffffff',
    secondaryText: '#bfdbfe',
    bodyText: '#f1f5f9',
    strongText: '#fde047',
    pillBg: 'rgba(59, 130, 246, 0.25)',
    pillBorder: '#3b82f6',
    pillText: '#93c5fd',
    sealGradient: ['#fde047', '#f59e0b', '#b45309'],
    sealRing: '#fef9c3',
    sealText: '#0f172a',
    ribbon: '#1d4ed8',
    divider: 'rgba(251, 191, 36, 0.4)',
    watermark: 'rgba(255, 255, 255, 0.035)',
    dateText: '#94a3b8',
  },
  'parchment-maroon': {
    bgGradient: ['#fdfbf7', '#f7f2e7', '#ede3d1'],
    outerBorder: '#78350f',
    innerBorder: '#b45309',
    cornerAccent: '#b45309',
    headerAccent: '#78350f',
    primaryText: '#1c1917',
    secondaryText: '#44403c',
    bodyText: '#292524',
    strongText: '#78350f',
    pillBg: 'rgba(180, 83, 9, 0.12)',
    pillBorder: '#b45309',
    pillText: '#78350f',
    sealGradient: ['#b45309', '#d97706', '#78350f'],
    sealRing: '#f59e0b',
    sealText: '#ffffff',
    ribbon: '#881337',
    divider: 'rgba(180, 83, 9, 0.35)',
    watermark: 'rgba(120, 53, 15, 0.035)',
    dateText: '#78716c',
  },
  'slate-bronze': {
    bgGradient: ['#1c1917', '#292524', '#1c1917'],
    outerBorder: '#44403c',
    innerBorder: '#d97706',
    cornerAccent: '#f59e0b',
    headerAccent: '#fbbf24',
    primaryText: '#ffffff',
    secondaryText: '#d6d3d1',
    bodyText: '#e7e5e4',
    strongText: '#fbbf24',
    pillBg: 'rgba(245, 158, 11, 0.25)',
    pillBorder: '#f59e0b',
    pillText: '#fde047',
    sealGradient: ['#f59e0b', '#ea580c', '#c2410c'],
    sealRing: '#fbbf24',
    sealText: '#ffffff',
    ribbon: '#b45309',
    divider: 'rgba(217, 119, 6, 0.4)',
    watermark: 'rgba(255, 255, 255, 0.035)',
    dateText: '#a8a29e',
  },
};

/**
 * Helper to wrap and center multi-line text on canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY;
}

/**
 * Draws the entire high-resolution certificate on an HTML5 Canvas context
 * Resolution: 2000 x 1414 (standard landscape aspect 1.414)
 */
export function drawCertificateOnCanvas(
  canvas: HTMLCanvasElement,
  data: CertificateData,
  theme: CertificateTheme = 'emerald-gold'
): void {
  const width = 2000;
  const height = 1414;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const pal = THEME_PALETTES[theme] || THEME_PALETTES['emerald-gold'];

  ctx.save();

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, pal.bgGradient[0]);
  bgGrad.addColorStop(0.5, pal.bgGradient[1]);
  bgGrad.addColorStop(1, pal.bgGradient[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Outer Outer Border
  ctx.strokeStyle = pal.outerBorder;
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // 3. Subtle Islamic Watermark Geometry
  ctx.save();
  ctx.strokeStyle = pal.watermark;
  ctx.lineWidth = 4;
  const centerX = width / 2;
  const centerY = height / 2 + 30;

  ctx.beginPath();
  ctx.arc(centerX, centerY, 420, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 360, 0, Math.PI * 2);
  ctx.stroke();

  // Diamond overlay
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 380);
  ctx.lineTo(centerX + 380, centerY);
  ctx.lineTo(centerX, centerY + 380);
  ctx.lineTo(centerX - 380, centerY);
  ctx.closePath();
  ctx.stroke();

  // Rotated Diamond
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-270, -270, 540, 540);
  ctx.restore();

  ctx.restore();

  // 4. Inner Ornate Filigree Border
  const margin = 46;
  ctx.strokeStyle = pal.innerBorder;
  ctx.lineWidth = 4;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Thin secondary inner line
  ctx.strokeStyle = pal.innerBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(margin + 10, margin + 10, width - (margin + 10) * 2, height - (margin + 10) * 2);

  // 5. Corner Arabesque Ornaments
  const cornerSize = 48;
  const corners = [
    { x: margin, y: margin, dx: 1, dy: 1 },
    { x: width - margin, y: margin, dx: -1, dy: 1 },
    { x: margin, y: height - margin, dx: 1, dy: -1 },
    { x: width - margin, y: height - margin, dx: -1, dy: -1 },
  ];

  corners.forEach(({ x, y, dx, dy }) => {
    ctx.strokeStyle = pal.cornerAccent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y + dy * cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * cornerSize, y);
    ctx.stroke();

    // Small corner circle
    ctx.fillStyle = pal.cornerAccent;
    ctx.beginPath();
    ctx.arc(x + dx * 16, y + dy * 16, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 6. Header Arabic Calligraphy: Bismillah
  ctx.textAlign = 'center';
  ctx.fillStyle = pal.headerAccent;
  ctx.font = 'bold 36px "Traditional Arabic", "Amiri", "Scheherazade New", serif';
  ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, 130);

  // Header Accreditation Banner line
  ctx.font = '600 18px "Courier New", monospace, sans-serif';
  ctx.fillStyle = pal.headerAccent;
  ctx.fillText(`•  ${data.accreditationBody.toUpperCase()}  •`, width / 2, 172);

  // Divider under council name
  const lineGrad = ctx.createLinearGradient(centerX - 350, 0, centerX + 350, 0);
  lineGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
  lineGrad.addColorStop(0.5, pal.innerBorder);
  lineGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 350, 192);
  ctx.lineTo(centerX + 350, 192);
  ctx.stroke();

  // Arabic Certificate Title
  ctx.fillStyle = pal.headerAccent;
  ctx.font = 'bold 46px "Amiri", "Traditional Arabic", serif';
  ctx.fillText(data.arabicCourseTitle || 'شَهَادَةُ إِتْمَامٍ وَإِجَازَةٍ عِلْمِيَّةٍ', width / 2, 260);

  // English Certificate Title
  ctx.font = 'bold 30px "Times New Roman", Georgia, serif';
  ctx.fillStyle = pal.primaryText;
  ctx.fillText('CERTIFICATE OF ACADEMIC EXCELLENCE & COMPLETION', width / 2, 310);

  // Subtitle
  ctx.font = '18px sans-serif';
  ctx.fillStyle = pal.secondaryText;
  ctx.fillText('Official Sanad & Accreditation issued under the auspices of the Jimma Islamic Affairs Board', width / 2, 345);

  // 7. Statement intro
  ctx.font = '22px sans-serif';
  ctx.fillStyle = pal.secondaryText;
  ctx.fillText('This is to formally certify and attest that the student:', width / 2, 420);

  // 8. Student Name Block
  ctx.font = 'bold 54px "Times New Roman", Georgia, serif';
  ctx.fillStyle = pal.primaryText;
  ctx.fillText(data.studentName, width / 2, 490);

  if (data.arabicStudentName) {
    ctx.font = 'bold 32px "Amiri", serif';
    ctx.fillStyle = pal.headerAccent;
    ctx.fillText(data.arabicStudentName, width / 2, 540);
  }

  // Gold accent bar under student name
  const nameUnderline = ctx.createLinearGradient(centerX - 280, 0, centerX + 280, 0);
  nameUnderline.addColorStop(0, 'rgba(245, 158, 11, 0)');
  nameUnderline.addColorStop(0.5, pal.headerAccent);
  nameUnderline.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.strokeStyle = nameUnderline;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - 280, 565);
  ctx.lineTo(centerX + 280, 565);
  ctx.stroke();

  // 9. Course & Achievement Text
  ctx.font = '21px sans-serif';
  ctx.fillStyle = pal.bodyText;

  const descLine1 = `Has with distinction completed the prescribed syllabus for`;
  const descLine2 = `${data.courseTitle}`;
  const descLine3 = `at ${data.madrasaName}, demonstrating commendable recitation fidelity,`;
  const descLine4 = `disciplined attendance, and mastery of ${data.juzOrMilestone}`;
  const descLine5 = `with an evaluation distinction of ${data.grade} (${data.gradePercentage || 96}%).`;

  ctx.fillText(descLine1, width / 2, 630);

  ctx.font = 'bold 28px "Times New Roman", serif';
  ctx.fillStyle = pal.strongText;
  ctx.fillText(descLine2, width / 2, 675);

  ctx.font = '21px sans-serif';
  ctx.fillStyle = pal.bodyText;
  ctx.fillText(descLine3, width / 2, 720);
  ctx.fillText(descLine4, width / 2, 755);

  // Distinction Pill Badge
  ctx.save();
  ctx.font = 'bold 20px sans-serif';
  const pillText = `Distinction: ${data.grade} ${data.gradePercentage ? `(${data.gradePercentage}%)` : ''}`;
  const pillWidth = ctx.measureText(pillText).width + 40;
  const pillHeight = 38;
  const pillX = centerX - pillWidth / 2;
  const pillY = 785;

  ctx.fillStyle = pal.pillBg;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 10);
  ctx.fill();

  ctx.strokeStyle = pal.pillBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = pal.pillText;
  ctx.fillText(pillText, centerX, pillY + 26);
  ctx.restore();

  if (data.honorsNote) {
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillStyle = pal.headerAccent;
    ctx.fillText(`"${data.honorsNote}"`, width / 2, 860);
  }

  // 10. Horizontal separator before signatures & seal
  ctx.strokeStyle = pal.divider;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, 920);
  ctx.lineTo(width - 140, 920);
  ctx.stroke();

  // 11. Left Signatory (Lead Instructor)
  const leftX = 380;
  ctx.font = 'italic bold 28px "Brush Script MT", "Times New Roman", cursive';
  ctx.fillStyle = pal.headerAccent;
  ctx.fillText(data.instructorName, leftX, 1020);

  ctx.strokeStyle = pal.innerBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftX - 160, 1040);
  ctx.lineTo(leftX + 160, 1040);
  ctx.stroke();

  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = pal.primaryText;
  ctx.fillText(data.instructorName, leftX, 1070);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = pal.secondaryText;
  ctx.fillText(data.instructorTitle || 'Lead Tahfeez Instructor', leftX, 1095);

  // 12. Right Signatory (Board President)
  const rightX = width - 380;
  ctx.font = 'italic bold 28px "Brush Script MT", "Times New Roman", cursive';
  ctx.fillStyle = pal.headerAccent;
  ctx.fillText(data.boardPresident, rightX, 1020);

  ctx.strokeStyle = pal.innerBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rightX - 160, 1040);
  ctx.lineTo(rightX + 160, 1040);
  ctx.stroke();

  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = pal.primaryText;
  ctx.fillText(data.boardPresident, rightX, 1070);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = pal.secondaryText;
  ctx.fillText('President, Jimma Islamic Affairs Board', rightX, 1095);

  // 13. Center Official Gold Seal & Ribbon
  const sealX = width / 2;
  const sealY = 1040;
  const sealR = 75;

  // Ribbons
  ctx.save();
  ctx.fillStyle = pal.ribbon;

  // Left Ribbon Tail
  ctx.beginPath();
  ctx.moveTo(sealX - 25, sealY + 40);
  ctx.lineTo(sealX - 45, sealY + 140);
  ctx.lineTo(sealX - 20, sealY + 120);
  ctx.lineTo(sealX + 5, sealY + 140);
  ctx.lineTo(sealX - 5, sealY + 40);
  ctx.closePath();
  ctx.fill();

  // Right Ribbon Tail
  ctx.beginPath();
  ctx.moveTo(sealX + 5, sealY + 40);
  ctx.lineTo(sealX - 5, sealY + 140);
  ctx.lineTo(sealX + 20, sealY + 120);
  ctx.lineTo(sealX + 45, sealY + 140);
  ctx.lineTo(sealX + 25, sealY + 40);
  ctx.closePath();
  ctx.fill();

  // Golden Medallion
  const sealGrad = ctx.createRadialGradient(sealX - 20, sealY - 20, 10, sealX, sealY, sealR);
  sealGrad.addColorStop(0, pal.sealGradient[0]);
  sealGrad.addColorStop(0.5, pal.sealGradient[1]);
  sealGrad.addColorStop(1, pal.sealGradient[2]);

  ctx.fillStyle = sealGrad;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = pal.sealRing;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = pal.sealText;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR - 12, 0, Math.PI * 2);
  ctx.stroke();

  // Seal Text
  ctx.font = '900 13px monospace';
  ctx.fillStyle = pal.sealText;
  ctx.fillText('★ OFFICIAL SEAL ★', sealX, sealY - 14);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('ACCREDITED', sealX, sealY + 8);

  ctx.font = '10px monospace';
  ctx.fillText('JIMMA MAJLIS', sealX, sealY + 28);

  ctx.restore();

  // 14. Bottom Security & Verification Strip
  ctx.strokeStyle = pal.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 1260);
  ctx.lineTo(width - 100, 1260);
  ctx.stroke();

  ctx.font = '16px monospace';
  ctx.fillStyle = pal.dateText;
  ctx.textAlign = 'left';
  ctx.fillText(`Issued: ${data.issueDate}  |  Hijri: ${data.hijriDate}`, 120, 1310);

  ctx.textAlign = 'center';
  ctx.fillStyle = pal.headerAccent;
  ctx.fillText(`Security Ref: ${data.certificateNumber}`, width / 2, 1310);

  ctx.textAlign = 'right';
  ctx.fillStyle = pal.dateText;
  ctx.fillText('Digital Verification: https://jimma-islamic-affairs.et/verify', width - 120, 1310);

  ctx.restore();
}

/**
 * Downloads a rendered Canvas as a high-quality PDF using jsPDF
 */
export function downloadCanvasAsPdf(
  canvas: HTMLCanvasElement,
  fileName: string = 'Certificate.pdf'
): void {
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 297 mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 210 mm

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

  // Direct download via blob link
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Downloads a rendered Canvas as a high-resolution PNG image
 */
export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  fileName: string = 'Certificate.png'
): void {
  canvas.toBlob((blob) => {
    if (!blob) {
      // Fallback to data URL
      const imgUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = imgUrl;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 500);
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  }, 'image/png');
}
