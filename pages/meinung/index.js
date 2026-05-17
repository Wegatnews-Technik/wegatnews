import { getPostsByTag } from "../../lib/posts";
import PostGrid from "../../components/blog/PostGrid";

export async function getStaticProps() {
  const meinung_posts = getPostsByTag("Meinung");

  return {
    props: {
      posts: meinung_posts,
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
      {chunkPosts(posts, 4).map((group, index) => (
        <PostGrid key={index} posts={group} />
      ))}
    </section>
  );
}

export default function InformativIndex({ posts }) {
  return (
    <main>
      <section className="archiv">
        <h1>Meinung 💣</h1>
        <p>Eigene Ansichten, provokative Diskussionen, Satire</p>
        <NewestPosts posts={posts} />
      </section>
    </main>
  );
}
