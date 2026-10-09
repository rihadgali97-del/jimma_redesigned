import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  downloadRegistryExport,
  RegistryExportColumn,
  RegistryExportFormat,
} from '../../utils/registryExport';

type RegistryExportButtonProps<T> = {
  title: string;
  filename: string;
  records: T[];
  columns: RegistryExportColumn<T>[];
};

export function RegistryExportButton<T>({
  title,
  filename,
  records,
  columns,
}: RegistryExportButtonProps<T>) {
  const { addToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportAs = async (format: RegistryExportFormat) => {
    setIsExporting(true);
    try {
      await downloadRegistryExport(format, filename, title, records, columns);
      setIsOpen(false);
    } catch (error) {
      addToast(
        'Could not export registry',
        error instanceof Error ? error.message : 'Please try again.',
        'error',
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        disabled={isExporting || records.length === 0}
        className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
      >
        <Download className="h-4 w-4" />
        Export
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label={`${title} export formats`}
          className="absolute right-0 z-20 mt-2 min-w-36 rounded-xl border border-stone-200 bg-white p-1 shadow-lg dark:border-stone-700 dark:bg-stone-900"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => void exportAs('csv')}
            disabled={isExporting}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-50 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Download CSV
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => void exportAs('pdf')}
            disabled={isExporting}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-50 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <FileText className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
