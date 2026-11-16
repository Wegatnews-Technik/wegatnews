import Link from "next/link";
import { FiShare2 } from "react-icons/fi";
import Image from "next/image";
import {TARGET_WIDTH, TARGET_HEIGHT, POSTER_WIDTH, POSTER_HEIGHT} from "../../pages/tools/converter"

export default function PostCard({ post }) {
  async function handleShare(event) {
    event.preventDefault();
    event.stopPropagation();

    const articleUrl = `${window.location.origin}/blog/${post.slug}`;
  //comment to trigger cloudfare bot
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
      <PreviewContent post={post} />

      <div className="meta">
        {new Date(post.date).toLocaleDateString("de-DE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · {post.author}
        {post.tags.map((tag) =>
          <Link key={tag} className={"tag " + tag} href={"/" + (tag == "Umfrage" ? "umfragen" : tag.toLowerCase())}>
            {tag}
          </Link>)}
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

function PreviewContent({post}) {
  if (post.type == "poster") {
    return (
      <>
        <Image src={post.image} alt={post.content} width={POSTER_WIDTH} height={POSTER_HEIGHT} className="poster" />
      </>
    )
  }
  else {
    return (
      <>
        <Image src={post.image} alt={post.title} width={TARGET_WIDTH} height={TARGET_HEIGHT}/>
        <h3>{post.title}</h3>
        <p className="blog-entry-preview">{post.preview}...</p>
      </>
    )
  }
}
