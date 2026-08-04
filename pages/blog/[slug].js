import Link from "next/link";
import { FiShare2 } from "react-icons/fi";
import { getAllPostSlugs, getPostBySlug } from "../../lib/posts";
import PostHead from "../../components/seo/PostHead";
import Image from "next/image";
import {TARGET_WIDTH, TARGET_HEIGHT} from "../tools/converter"

export default function Post({ post }) {
  async function handleShare() {
    const articleUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
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
    <>
      <PostHead post={post} />

      <article className="post">
        <header
          className={`post-hero${post.image ? "" : " post-hero--text-only"}`}
        >
          {post.image ? (
            <div className="post-media">
              <Image src={post.image} alt={post.title} className="post-image" width={TARGET_WIDTH} height={TARGET_HEIGHT}/>
            </div>
          ) : null}

          <div className="post-heading">
            <h1 className="post-title">{post.title}</h1>

            <div className="post-actions">
              <button
                type="button"
                onClick={handleShare}
                className="post-share-button"
                aria-label={`Artikel ${post.title} teilen`}
                title="Artikel teilen"
              >
                <FiShare2 aria-hidden="true" />
              </button>

              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  className={`${tag} tag`}
                  href={`/${
                    tag === "Umfrage" ? "umfragen" : tag.toLowerCase()
                  }`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <div className="post-reading-column">
          <div
            className="post-content"
            dangerouslySetInnerHTML={{
              __html: post.contentHtml,
            }}
          />

          <footer className="post-footer">
            <div className="post-meta-block">
              <p>{post.author}</p>
              <small>Bildquelle: {post.image_source}</small>
              <small>Artikelnummer: {post.articleNumber}</small>
            </div>

            <Link href="/" className="button1">
              Zurück zur Homepage
            </Link>
          </footer>
        </div>
      </article>
    </>
  );
}

export async function getStaticPaths() {
  const slugs = getAllPostSlugs();

  return {
    paths: slugs.map((slug) => ({
      params: { slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);

  return {
    props: { post },
  };
}
