import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationControlsProps = {
  page: number;
  pageCount: number;
  firstItem: number;
  lastItem: number;
  totalItems: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
};

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  pageCount,
  firstItem,
  lastItem,
  totalItems,
  itemLabel = 'records',
  onPageChange,
}) => {
  if (totalItems === 0 || pageCount <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-stone-500 dark:text-stone-400" aria-live="polite">
        Showing {firstItem}–{lastItem} of {totalItems} {itemLabel}
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="min-w-[5rem] text-center text-xs font-medium text-stone-600 dark:text-stone-300">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};
