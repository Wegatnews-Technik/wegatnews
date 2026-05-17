import { getPostsByTag } from "../../lib/posts";

export async function getStaticProps() {
  const informativ_posts = getPostsByTag("informativ");

  return {
    props: {
      posts: informativ_posts,
    },
  };
}

export default function InformativIndex({ posts }) {
  return (
    <main>
      <section className="archiv">
        <h1>Informativ 📖</h1>
        <p>Berichte, Argumentationen, Stellungnahmen. Sachliche Diskussionen</p>
        <p>
          <b>{posts}</b>
        </p>
      </section>
    </main>
  );
}
