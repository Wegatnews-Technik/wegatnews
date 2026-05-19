import Link from "next/link";
import { FiShare2 } from "react-icons/fi";

export default function PostCard({ post }) {
  async function handleShare(event) {
    event.preventDefault();
    event.stopPropagation();

    const articleUrl = `${window.location.origin}/blog/${post.slug}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.preview,
          url: articleUrl,
        });
      } else {
        await navigator.clipboard.writeText(articleUrl);
        alert("Link kopiert");
      }
    } catch (error) {
      console.error("Teilen fehlgeschlagen:", error);
    }
  }

  return (
    <div className="blog-entry">
      <img src={post.image} alt={post.title} />
      <h3>{post.title}</h3>
      <p>{post.preview}...</p>

      <div className="meta">
        {new Date(post.date).toLocaleDateString("de-DE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · {post.author}
        {post.tags.map((tag) => <span key={tag} className={tag + " tag"}>{tag}</span>) }
      </div>

      <div className="blog-entry-actions">
        <Link href={`/blog/${post.slug}`} className="blog-entry-readmore">
          Artikel lesen
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="blog-entry-share"
          aria-label={`Artikel ${post.title} teilen`}
          title="Artikel teilen"
        >
          <FiShare2 aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
