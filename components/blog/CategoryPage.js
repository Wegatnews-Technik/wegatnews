import Head from "next/head";
import PostListing from "./PostListing";

export default function CategoryPage({
  title,
  description,
  posts,
  currentPage,
  pageCount,
  basePath,
}) {
  return (
    <main>
      <Head>
        <title>
          {title}
          {currentPage > 1 ? ` – Seite ${currentPage}` : ""} | WE G(A)T NEWS
        </title>
      </Head>

      <div className="welcome-container">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <PostListing
        posts={posts}
        currentPage={currentPage}
        pageCount={pageCount}
        basePath={basePath}
      />
    </main>
  );
}