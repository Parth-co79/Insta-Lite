function parsePositiveInteger(value) {
  if (typeof value !== 'string') {
    return null;
  }
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }
  const num = Number(value);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

function parsePagination(query) {
  let page = 1;
  let limit = 10;

  if (query.page !== undefined) {
    const parsedPage = parsePositiveInteger(query.page);
    if (parsedPage === null) {
      return { error: 'page and limit must be positive integers' };
    }
    page = parsedPage;
  }

  if (query.limit !== undefined) {
    const parsedLimit = parsePositiveInteger(query.limit);
    if (parsedLimit === null) {
      return { error: 'page and limit must be positive integers' };
    }
    limit = Math.min(parsedLimit, 50);
  }

  return { page, limit };
}

function buildMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

module.exports = {
  parsePositiveInteger,
  parsePagination,
  buildMeta,
};