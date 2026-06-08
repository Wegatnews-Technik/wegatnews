import { getPostsByTag } from "../../lib/posts";
import PostGrid from "../../components/blog/PostGrid";

export async function getStaticProps() {
  const buchrezensions_posts = getPostsByTag("Buchrezension");

  console.log(buchrezensions_posts);

  return {
    props: {
      posts: buchrezensions_posts,
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

export default function BuchrezensionIndex({posts}) {

  return (
    <main>
      <div className="welcome-container">
        <h1>Buchrezensionen 📕</h1>
        <p>Zusammenfassungen und Empfehlungen zu verschieden Büchern</p>
      </div>

      <NewestPosts posts={posts} />
    </main>
  );
}
