import { getAllPosts } from "../../lib/posts";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { FiSearch } from "react-icons/fi";

export async function getStaticProps() {
  return {
    props: {
      posts: getAllPosts(),
    },
  };
}

function renderSearchResults(posts, searchString) {
  const resultsDiv = document.getElementById("search-results");
  const summary = document.getElementById("search-summary");

  if (!resultsDiv || !summary) return;

  resultsDiv.innerHTML = "";

  const results = document.createElement("ul");

  let resultCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const postContents = "".concat(
      posts[i].title + posts[i].preview + posts[i].author,
    );

    if (postContents.toLowerCase().includes(searchString.toLowerCase())) {
      const finding = posts[i];

      const listItem = document.createElement("li");

      const link = document.createElement("a");

      link.href = "/blog/" + finding.slug;
      link.innerText = finding.title;

      const meta = document.createElement("span");
      meta.className = "search-result-meta";

      meta.innerText =
        new Date(finding.date).toLocaleDateString("de-DE") +
        " · " +
        finding.author;

      listItem.appendChild(link);
      listItem.appendChild(meta);

      results.appendChild(listItem);

      resultCount++;
    }
  }

  summary.innerText =
    resultCount === 1
      ? `1 Ergebnis für „${searchString}“`
      : `${resultCount} Ergebnisse für „${searchString}“`;

  if (resultCount === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "search-empty";

    emptyMessage.innerText = `Keine Artikel für „${searchString}“ gefunden.`;

    resultsDiv.appendChild(emptyMessage);

    return;
  }

  resultsDiv.appendChild(results);
}

export default function SearchPage({ posts }) {
  const router = useRouter();

  function search(event) {
    event.preventDefault();

    const input = document.getElementById("search-page-bar");

    const searchString = input.value.trim();

    if (!searchString) return;

    router.push(`/suche?q=${encodeURIComponent(searchString)}`, undefined, {
      shallow: true,
    });
  }

  useEffect(() => {
    if (!router.isReady) return;

    const searchString =
      typeof router.query.q === "string" ? router.query.q.trim() : "";

    const input = document.getElementById("search-page-bar");

    if (input) {
      input.value = searchString;
    }

    if (searchString) {
      renderSearchResults(posts, searchString);
    }
  }, [router.isReady, router.query.q, posts]);

  return (
    <main className="search-page">
      <div className="search-page-header">
        <h1>Suche</h1>

        <p>Durchsuche die Artikel von WE G(A)T NEWS.</p>
      </div>

      <form className="search-page-form" onSubmit={search} role="search">
        <input
          id="search-page-bar"
          className="search-page-input"
          type="search"
          placeholder="Artikel suchen …"
          aria-label="Artikel suchen"
        />

        <button
          className="search-page-button"
          type="submit"
          aria-label="Suche starten"
          title="Suchen"
        >
          <FiSearch aria-hidden="true" />
        </button>
      </form>

      <p id="search-summary" className="search-summary" />

      <div id="search-results" />
    </main>
  );
}
