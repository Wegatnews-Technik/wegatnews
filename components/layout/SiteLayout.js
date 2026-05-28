import Link from "next/link";
import Head from "next/head";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/informativ", label: "Informativ📖" },
  { href: "/meinung", label: "Meinung💣" },
  { href: "/umfragen", label: "Umfragen🎤" },
  { href: "/mach-mit", label: "Mach mit👋" },
];

export default function SiteLayout({ children, posts }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setOpen(false);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    if (posts.newestPosts || posts.posts) {
      var input = document.getElementById("search-bar");
      input.addEventListener("keypress", function (event) {
        if (event.key == "Enter") {
          document.getElementById("search-button").click();
        }
      });
      let all_links = document.getElementsByTagName("a");
      return () => {
        try{
          document.getElementById("search-bar").value = "";
          document.getElementById("search-results").innerHTML = "";
        }
        catch {}
      };
    }
  });

  function search() {
    const search_string = document.getElementById("search-bar").value.trim();
    if (!search_string) return;
    const all_posts = posts.posts ? posts.posts : (new Array).concat(posts.newestPosts, posts.archivePosts);
    let results = document.createElement("ul");
    for (var i = 0; i < all_posts.length; i++) {
      var post_contents = "".concat(all_posts[i].title + all_posts[i].preview + all_posts[i].author + all_posts[i].contentHtml);
      if (post_contents.toLowerCase().search(search_string.toLowerCase()) != -1) {
        const finding = all_posts[i];
        let list_item = document.createElement("li");
        let link = document.createElement("a");
        link.target = "_blank";
        link.href = "/blog/" + finding.slug;
        link.innerText = finding.title;
        list_item.appendChild(link);
        results.appendChild(list_item);
      }
    }
    let results_div = document.getElementById("search-results");
    results_div.innerHTML = "<h3>Suchergebnisse: <h3>";
    results_div.appendChild(results);
  }

  return (
    <>
      <Head>
        <title>WE G(A)T NEWS – Die Schülerzeitung am Altenforst</title>
        <meta
          name="description"
          content="Unabhängiger Blog für Information, Meinung und Umfragen am Gymnasium zum Altenforst Troisdorf. Hier ist die Stimme der Schüler*innen!"
        />
        <meta
          name="keywords"
          content="Schülerzeitung, Gymnasium zum Altenforst, Troisdorf, News, Meinungen, Umfragen"
        />
        <meta name="author" content="Vincent Cui" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="WE G(A)T NEWS" />
        <meta
          property="og:description"
          content="Unabhängiger Blog für Information, Meinung und Umfragen"
        />
        <meta property="og:type" content="website" />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="2887ff34-c251-4b42-b710-7c2e064c633a"
        ></script>
      </Head>

      <header>
        <nav>
          <Link href="/" className="logo">
            <img src="/basic-images/logo.webp" alt="logo" />
          </Link>

          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>

          <div
            className="menu-toggle"
            onClick={(event) => {
              event.stopPropagation();
              setOpen((prev) => !prev);
            }}
          >
            <div></div>
            <div></div>
            <div></div>
          </div>
        </nav>

        <div className={`sidebar ${open ? "active" : ""}`}>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {
        posts.newestPosts || posts.posts ? (
          <>
            <div id="search">
              <input type="text" id="search-bar" />
              <button id="search-button" onClick={search}>Suchen</button>
            </div>
            <div id="search-results"></div>
          </>
        ) : (<></>)
      }

      {children}

      <footer>
        <Link href="/impressum">Datenschutz</Link>
        <Link href="/impressum">Impressum</Link>
        <Link href="/impressum">Cookies</Link>
        <p>© 2026 WE G(A)T NEWS</p>
      </footer>
    </>
  );
}
