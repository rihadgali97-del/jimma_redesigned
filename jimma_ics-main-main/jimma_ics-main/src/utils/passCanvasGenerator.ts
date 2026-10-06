import jsPDF from 'jspdf';
import { CouncilEvent, EventRegistration } from '../types';

export function drawEventPassOnCanvas(
  canvas: HTMLCanvasElement,
  event: CouncilEvent,
  registration: EventRegistration
) {
  const width = 1600;
  const height = 900;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#064e3b'); // Emerald 900
  bgGrad.addColorStop(0.65, '#022c22'); // Emerald 950
  bgGrad.addColorStop(1, '#111827'); // Slate 900
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Border & Gold Accent
  ctx.strokeStyle = '#d97706'; // Gold amber
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // Perforated Stub Divider on Right
  const stubX = 1180;
  ctx.beginPath();
  ctx.setLineDash([12, 10]);
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
  ctx.lineWidth = 3;
  ctx.moveTo(stubX, 30);
  ctx.lineTo(stubX, height - 30);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // Header - Organization Title
  ctx.fillStyle = '#fde047'; // Gold
  ctx.font = 'bold 24px "Times New Roman", serif';
  ctx.textAlign = 'left';
  ctx.fillText('JIMMA ZONE ISLAMIC AFFAIRS SUPREME COUNCIL', 70, 85);

  ctx.fillStyle = '#6ee7b7'; // Mint
  ctx.font = '16px sans-serif';
  ctx.fillText('OFFICIAL EVENT ADMISSION PASS & ACCESS SANAD', 70, 115);

  // Pass Number Pill
  ctx.fillStyle = 'rgba(217, 119, 6, 0.25)';
  ctx.fillRect(70, 140, 260, 36);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(70, 140, 260, 36);

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`PASS NO: ${registration.passNumber}`, 85, 164);

  // Category Badge
  ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
  ctx.fillRect(345, 140, 200, 36);
  ctx.strokeStyle = '#10b981';
  ctx.strokeRect(345, 140, 200, 36);
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(event.category.toUpperCase(), 360, 164);

  // Event Title (Wrap text if long)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Times New Roman", Georgia, serif';
  const titleWords = event.title.split(' ');
  let line1 = '';
  let line2 = '';
  for (const word of titleWords) {
    if ((line1 + word).length < 42) {
      line1 += (line1 ? ' ' : '') + word;
    } else {
      line2 += (line2 ? ' ' : '') + word;
    }
  }
  ctx.fillText(line1, 70, 230);
  if (line2) {
    ctx.fillText(line2, 70, 275);
  }

  // Arabic Title if present
  if (event.arabicTitle) {
    ctx.fillStyle = '#fcd34d';
    ctx.font = '22px "Times New Roman", serif';
    ctx.fillText(event.arabicTitle, 70, line2 ? 315 : 275);
  }

  // Divider line
  const dividerY = line2 ? 345 : 310;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(70, dividerY);
  ctx.lineTo(stubX - 50, dividerY);
  ctx.stroke();

  // 2-Column Info Grid: Left = Event Details, Right = Attendee Details
  const gridY = dividerY + 35;

  // Column 1: Event Logistics
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('DATE & HIJRI TIMING', 70, gridY);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`${event.date} (${event.hijriDate})`, 70, gridY + 28);
  ctx.fillStyle = '#fde047';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Time: ${event.time}`, 70, gridY + 54);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('VENUE & LOCATION', 70, gridY + 105);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText(event.location, 70, gridY + 132);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '15px sans-serif';
  ctx.fillText(event.venueDetails || `District: ${event.district}`, 70, gridY + 156);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('KEYNOTE / CHIEF SCHOLAR', 70, gridY + 205);
  ctx.fillStyle = '#6ee7b7';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(event.speaker, 70, gridY + 232);

  // Column 2: Attendee Credentials
  const col2X = 640;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('REGISTERED ATTENDEE', col2X, gridY);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(registration.fullName, col2X, gridY + 30);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('AFFILIATION / MADRASA', col2X, gridY + 75);
  ctx.fillStyle = '#fde047';
  ctx.font = '18px sans-serif';
  ctx.fillText(registration.organizationOrMadrasa || `District of ${registration.district}`, col2X, gridY + 100);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('CONTACT PHONE', col2X, gridY + 145);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '17px sans-serif';
  ctx.fillText(registration.phone, col2X, gridY + 170);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('ADMISSION QUOTA', col2X, gridY + 215);
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText(`${registration.attendeesCount} Person(s) - Reserved Seating`, col2X, gridY + 240);

  // Footer on Left Main Body
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '12px sans-serif';
  ctx.fillText('Notice: Please present this pass at the security gate 30 minutes prior to session commencement.', 70, height - 55);

  // --- RIGHT STUB SECTION (Verification & QR) ---
  const stubCenterX = stubX + (width - stubX) / 2;

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 18px "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText('VERIFICATION STUB', stubCenterX, 85);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = '13px sans-serif';
  ctx.fillText('GATE ADMISSION TICKET', stubCenterX, 110);

  // Draw Simulated High-Contrast QR Code Box
  const qrSize = 200;
  const qrX = stubCenterX - qrSize / 2;
  const qrY = 145;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);

  // Draw QR Pattern
  ctx.fillStyle = '#0f172a';
  // Corners
  ctx.fillRect(qrX + 15, qrY + 15, 45, 45);
  ctx.clearRect(qrX + 25, qrY + 25, 25, 25);
  ctx.fillRect(qrX + 30, qrY + 30, 15, 15);

  ctx.fillRect(qrX + qrSize - 60, qrY + 15, 45, 45);
  ctx.clearRect(qrX + qrSize - 50, qrY + 25, 25, 25);
  ctx.fillRect(qrX + qrSize - 45, qrY + 30, 15, 15);

  ctx.fillRect(qrX + 15, qrY + qrSize - 60, 45, 45);
  ctx.clearRect(qrX + 25, qrY + qrSize - 50, 25, 25);
  ctx.fillRect(qrX + 30, qrY + qrSize - 45, 15, 15);

  // Random pixel blocks for QR authenticity
  const gridCells = 14;
  const cellSize = 10;
  for (let r = 0; r < gridCells; r++) {
    for (let c = 0; c < gridCells; c++) {
      if ((r < 5 && c < 5) || (r < 5 && c > 8) || (r > 8 && c < 5)) continue;
      const hash = (r * 31 + c * 17 + registration.passNumber.charCodeAt(r % registration.passNumber.length)) % 5;
      if (hash < 2) {
        ctx.fillRect(qrX + 30 + c * cellSize, qrY + 30 + r * cellSize, cellSize - 2, cellSize - 2);
      }
    }
  }

  // QR Center Badge
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(stubCenterX - 18, qrY + qrSize / 2 - 18, 36, 36);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(stubCenterX - 18, qrY + qrSize / 2 - 18, 36, 36);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px serif';
  ctx.fillText('JIC', stubCenterX, qrY + qrSize / 2 + 6);

  // Pass Number under QR
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(registration.passNumber, stubCenterX, qrY + qrSize + 30);

  // Security Barcode simulation
  const barY = qrY + qrSize + 55;
  const barHeight = 45;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(stubCenterX - 150, barY, 300, barHeight + 25);
  ctx.fillStyle = '#000000';
  for (let b = 0; b < 280; b += 7) {
    const barW = (b % 4 === 0) ? 4 : (b % 3 === 0) ? 2 : 1;
    ctx.fillRect(stubCenterX - 140 + b, barY + 6, barW, barHeight);
  }
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`*${registration.passNumber}*`, stubCenterX, barY + barHeight + 18);

  // Status Seal
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('STATUS: CONFIRMED VERIFIED', stubCenterX, height - 70);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '11px sans-serif';
  ctx.fillText('Authorized by Jimma Islamic Council', stubCenterX, height - 48);
}

export function downloadPassAsPdf(
  canvas: HTMLCanvasElement,
  fileName: string = 'Event_Pass.pdf'
) {
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  pdf.save(fileName);
}

export function downloadPassAsPng(
  canvas: HTMLCanvasElement,
  fileName: string = 'Event_Pass.png'
) {
  const imgUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = fileName;
  link.href = imgUrl;
  link.click();
}
