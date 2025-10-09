/**
 * Sanitize user input to prevent XSS and injection attacks
 */
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
}

module.exports = { sanitizeInput };

// ============================================================================
// FILE: src/utils/pagination.js
// ============================================================================
/**
 * Generate pagination metadata
 */
function getPaginationMeta(page, limit, totalCount) {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    totalCount: parseInt(totalCount),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

/**
 * Calculate offset for SQL query
 */
function getOffset(page, limit) {
  return (page - 1) * limit;
}

module.exports = { getPaginationMeta, getOffset };