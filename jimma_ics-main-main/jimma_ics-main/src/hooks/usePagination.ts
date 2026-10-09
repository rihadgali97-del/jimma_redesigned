import { useEffect, useMemo, useState } from 'react';

export function usePagination<T>(items: T[], pageSize = 10, resetKey?: string) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, items, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return {
    page: currentPage,
    pageCount,
    paginatedItems,
    setPage,
    firstItem: items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1,
    lastItem: Math.min(currentPage * pageSize, items.length),
    totalItems: items.length,
  };
}
