/**
 * when no query parameter passed then we can handle query using default values
 * DEFAULT_PAGE_NUMBER is 1
 * DEFAULT_PAGE_LIMIT is 0
 * Setting 0 because when 0 passed in limit query mongo returns all the documents
 */

const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_LIMIT = 0;

const getPagination = (query) => {
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
  const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
  };
};

module.exports = {
  getPagination,
};
