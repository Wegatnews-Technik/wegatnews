import { getPostsByTag } from "../../lib/posts";
import PostGrid from "../../components/blog/PostGrid";

export async function getStaticProps() {
  const informativ_posts = getPostsByTag("Informativ");

  return {
    props: {
      posts: informativ_posts,
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
      <div className="welcome-container">
        <h1>Informativ 📖</h1>
        <p>Berichte, Argumentationen, Stellungnahmen. Sachliche Diskussionen</p>
      </div>

      <NewestPosts posts={posts} />
    </main>
  );
}
