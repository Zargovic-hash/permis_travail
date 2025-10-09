import { useState, useCallback } from 'react';
import { PAGINATION_DEFAULTS } from '../utils/constants';

export const usePagination = (initialPage = PAGINATION_DEFAULTS.PAGE, initialLimit = PAGINATION_DEFAULTS.LIMIT) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    reset
  };
};