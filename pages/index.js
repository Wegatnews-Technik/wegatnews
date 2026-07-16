import { getAllPosts } from "../lib/posts";
import PostGrid from "../components/blog/PostGrid";
import ArchiveList from "../components/blog/ArchiveList";
import ShareButton from "../components/layout/ShareButton";

export async function getStaticProps() {
  const posts = getAllPosts();

  return {
    props: {
      newestPosts: posts.slice(0, 24),
      archivePosts: posts.slice(24),
    },
  };
}

function chunkPosts(posts, size) {
  const chunks = [];

  for (let index = 0; index < posts.length; index += size) {
    chunks.push(posts.slice(index, index + size));
  }

  return chunks;
}

function NewestPosts({ posts }) {
  return (
    <section className="blog-section">
      <PostGrid posts={posts} />
    </section>
  );
}

export default function Blog({ newestPosts, archivePosts }) {
  return (
    <>
      <div className="welcome-container">
        <h2 className="welcome">
          Willkommen auf wegatnews, der digitalen Schülerzeitung am Altenforst.
        </h2>
      </div>

      <NewestPosts posts={newestPosts} />

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

      <section>
        <h1 className="archiv">Archiv</h1>
        <ArchiveList posts={archivePosts} />
      </section>
    </>
  );
}