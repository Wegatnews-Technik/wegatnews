export const POSTS_PER_PAGE = 12;

export function getPageCount(posts) {
  return Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
}

export function getPageData(posts, page) {
  const currentPage = Number(page);
  const pageCount = getPageCount(posts);

  if (
    !Number.isInteger(currentPage) ||
    currentPage < 1 ||
    currentPage > pageCount
  ) {
    return null;
  }

  const start = (currentPage - 1) * POSTS_PER_PAGE;

  return {
    posts: posts.slice(start, start + POSTS_PER_PAGE),
    currentPage,
    pageCount,
  };
}

export function getPagePaths(posts) {
  const pageCount = getPageCount(posts);

  return Array.from(
    { length: Math.max(0, pageCount - 1) },
    (_, index) => ({
      params: {
        page: String(index + 2),
      },
    }),
  );
}