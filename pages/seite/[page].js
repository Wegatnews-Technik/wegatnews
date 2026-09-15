import Head from "next/head";
import { getAllPosts } from "../../lib/posts";
import {
  getPageData,
  getPagePaths,
} from "../../lib/pagination";
import PostListing from "../../components/blog/PostListing";

export function getStaticPaths() {
  const posts = getAllPosts();

  return {
    paths: getPagePaths(posts),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const pageData = getPageData(getAllPosts(), params.page);

  if (!pageData) {
    return {
      notFound: true,
    };
  }

  return {
    props: pageData,
  };
}

export default function PostsPage({
  posts,
  currentPage,
  pageCount,
}) {
  return (
    <main>
      <Head>
        <title>
          Artikel – Seite {currentPage} | WE G(A)T NEWS
        </title>
      </Head>

      <PostListing
        posts={posts}
        currentPage={currentPage}
        pageCount={pageCount}
        basePath="/"
      />
    </main>
  );
}