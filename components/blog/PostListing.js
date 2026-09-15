import PostGrid from "./PostGrid";
import Pagination from "./Pagination";

export default function PostListing({
  posts,
  currentPage,
  pageCount,
  basePath,
}) {
  return (
    <>
      <section className="blog-section">
        <PostGrid posts={posts} />
      </section>

      <Pagination
        currentPage={currentPage}
        pageCount={pageCount}
        basePath={basePath}
      />
    </>
  );
}