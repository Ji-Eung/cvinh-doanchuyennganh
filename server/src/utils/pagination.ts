export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const pages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}
