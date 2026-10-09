export type RegistryExportFormat = 'csv' | 'pdf';

export type RegistryExportValue =
  | string
  | number
  | boolean
  | readonly string[]
  | { lat: number; lng: number }
  | null
  | undefined;

export type RegistryExportColumn<T> = {
  header: string;
  value: (record: T, index: number) => RegistryExportValue;
};

function downloadBlob(content: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function cellText(value: RegistryExportValue) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.join('; ');
  if (typeof value === 'object' && 'lat' in value && 'lng' in value) {
    return `${value.lat}, ${value.lng}`;
  }
  return String(value);
}

function csvCell(value: RegistryExportValue) {
  const text = cellText(value);
  const safeText = typeof value === 'string' && /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

function addPdfTableHeader(
  pdf: import('jspdf').jsPDF,
  title: string,
  headers: string[],
  recordCount: number,
  groupIndex: number,
  groupCount: number,
  left: number,
  top: number,
  contentWidth: number,
) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(title, left, top);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Records: ${recordCount}  |  Exported: ${new Date().toLocaleString()}  |  Column group ${groupIndex + 1}/${groupCount}`, left, top + 5);

  const cellWidth = contentWidth / headers.length;
  const headerY = top + 8;
  const headerLines = headers.map(
    (header) => pdf.splitTextToSize(header, cellWidth - 2) as string[],
  );
  const headerHeight = Math.max(7, ...headerLines.map((lines) => lines.length * 3.2 + 2));
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  headerLines.forEach((lines, index) => {
    const x = left + index * cellWidth;
    pdf.rect(x, headerY, cellWidth, headerHeight);
    pdf.text(lines, x + 1, headerY + 3);
  });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  return { cellWidth, nextY: headerY + headerHeight };
}

export async function downloadRegistryExport<T>(
  format: RegistryExportFormat,
  filename: string,
  title: string,
  records: T[],
  columns: RegistryExportColumn<T>[],
) {
  if (format === 'csv') {
    const rows = [
      ['Lak.', ...columns.map((column) => column.header)].map(csvCell).join(','),
      ...records.map((record, index) =>
        [
          csvCell(index + 1),
          ...columns.map((column) => csvCell(column.value(record, index))),
        ].join(','),
      ),
    ];
    downloadBlob(`\uFEFF${rows.join('\r\n')}`, 'text/csv;charset=utf-8', `${filename}.csv`);
    return;
  }

  const { default: jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const left = 10;
  const right = 10;
  const top = 10;
  const bottom = 10;
  const lineHeight = 3.2;
  const contentWidth = pageWidth - left - right;
  const columnsPerPage = 4;
  const groupedColumns: RegistryExportColumn<T>[][] = [];
  for (let index = 0; index < columns.length; index += columnsPerPage) {
    groupedColumns.push(columns.slice(index, index + columnsPerPage));
  }
  const groups = groupedColumns.length;
  let pageHasHeader = false;
  let groupIndex = -1;
  let cellWidth = 0;
  let y = 0;

  let firstPage = true;
  const startPage = () => {
    if (firstPage) {
      firstPage = false;
    } else {
      pdf.addPage();
    }
    pageHasHeader = false;
  };
  const ensureHeader = () => {
    if (pageHasHeader) return;
    const header = addPdfTableHeader(
      pdf,
      title,
      ['Lak.', ...groupedColumns[groupIndex].map((column) => column.header)],
      records.length,
      groupIndex,
      groups,
      left,
      top,
      contentWidth,
    );
    cellWidth = header.cellWidth;
    y = header.nextY;
    pageHasHeader = true;
  };

  for (groupIndex = 0; groupIndex < groups; groupIndex += 1) {
    startPage();
    ensureHeader();
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);

    for (const [recordIndex, record] of records.entries()) {
      const values = [
        String(recordIndex + 1),
        ...groupedColumns[groupIndex].map((column) => cellText(column.value(record, recordIndex))),
      ];
      const wrappedCells = values.map(
        (value) => pdf.splitTextToSize(value || '—', cellWidth - 2) as string[],
      );
      const maxLines = Math.max(1, ...wrappedCells.map((lines) => lines.length));
      let lineOffset = 0;

      while (lineOffset < maxLines) {
        if (y + lineHeight > pageHeight - bottom) {
          startPage();
          ensureHeader();
        }
        const availableLines = Math.max(
          1,
          Math.floor((pageHeight - bottom - y) / lineHeight),
        );
        const linesThisPage = Math.min(maxLines - lineOffset, availableLines);
        const rowHeight = linesThisPage * lineHeight;

        wrappedCells.forEach((lines, columnIndex) => {
          const x = left + columnIndex * cellWidth;
          pdf.rect(x, y, cellWidth, rowHeight);
          const visibleLines = lines.slice(lineOffset, lineOffset + linesThisPage);
          if (visibleLines.length > 0) pdf.text(visibleLines, x + 1, y + 2.5);
        });
        y += rowHeight;
        lineOffset += linesThisPage;
      }
    }
  }

  pdf.save(`${filename}.pdf`);
}
