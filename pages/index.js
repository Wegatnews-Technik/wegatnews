import { getAllPosts } from "../lib/posts";
import { getPageData } from "../lib/pagination";
import PostListing from "../components/blog/PostListing";

export async function getStaticProps() {
  const pageData = getPageData(getAllPosts(), 1);

  return {
    props: pageData,
  };
}

export default function Blog({
  posts,
  currentPage,
  pageCount,
}) {
  return (
    <>
      <div className="welcome-container">
        <h2 className="welcome">
          Willkommen auf wegatnews, der digitalen Schülerzeitung am Altenforst.
        </h2>
      </div>

      <PostListing
        posts={posts}
        currentPage={currentPage}
        pageCount={pageCount}
        basePath="/"
      />

      <section>
        <div className="image-or-text">
          <h2>Ideen, Artikel, Probleme, Fragen?</h2>

          <p>
            Einfach per Teams oder E-Mail an Vincent Cui (Technik), oder an
            Ouijdan Hussein (Inhalt)
          </p>

          <p>wegatnews@outlook.de</p>

          <p>
            Wir treffen uns jeden Donnerstag in der Mittagspause vor den
            Computerräumen.
          </p>

          <p>Komm doch einfach mal vorbei!</p>
        </div>
      </section>
    </>
  );
}