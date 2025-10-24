/**
 * Calculate offset for SQL query
 */
function getOffset(page = 1, limit = 10) {
  return (parseInt(page) - 1) * parseInt(limit);
}

/**
 * Generate pagination metadata
 */
function getPaginationMeta(page = 1, limit = 10, totalCount = 0) {
  const currentPage = parseInt(page);
  const perPage = parseInt(limit);
  const totalPages = Math.ceil(totalCount / perPage);
  
  return {
    page: currentPage,
    limit: perPage,
    totalCount: parseInt(totalCount),
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}

module.exports = { getPaginationMeta, getOffset };