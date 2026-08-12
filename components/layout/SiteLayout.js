import Head from "next/head";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/informativ", label: "Informativ 📖" },
  { href: "/meinung", label: "Meinung 💣" },
  { href: "/umfragen", label: "Umfragen 🎤" },
  { href: "/buchrezension", label: "Buchrezensionen 📕" },
  { href: "/mach-mit", label: "Mach mit 👋" },
];

function NavigationItems({ currentPath, onNavigate }) {
  return NAV_ITEMS.map((item) => (
    <li key={item.href}>
      <Link
        href={item.href}
        aria-current={currentPath === item.href ? "page" : undefined}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    </li>
  ));
}

export default function SiteLayout({ children, posts }) {
  const router = useRouter();
  const headerRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const desktopMedia = window.matchMedia(
      "(min-width: 961px)",
    );

    function handleDesktopChange(event) {
      if (event.matches) {
        setOpen(false);
      }
    }

    desktopMedia.addEventListener(
      "change",
      handleDesktopChange,
    );

    return () => {
      desktopMedia.removeEventListener(
        "change",
        handleDesktopChange,
      );
    };
  }, []);

  useEffect(() => {
    function listenForEnter(event) {
      if (event.key == "Enter") {
        Array.from(document.querySelectorAll("#search-button"))
          .filter((e) => e.checkVisibility())[0]
          .click();
      }
    }

    if (posts.newestPosts || posts.posts) {
      Array.from(document.querySelectorAll("#search-bar"))
        .map((input) => (
          input.addEventListener("keypress", listenForEnter)
        ));
      return () => {
        try {
          Array.from(document.querySelectorAll("#search-bar"))
            .map((input) => (
              input.removeEventListener("keypress", listenForEnter)
            ));
          document.getElementById("search-results").innerHTML = "";
        }
        catch {}
      };
    }
  }, [posts]);

  function search() {
    const search_string = Array.from(document.querySelectorAll("#search-bar"))
      .filter((e) => e.checkVisibility())[0]
      .value
      .trim();
    if (!search_string) return;
    const all_posts = posts.posts ? posts.posts : (new Array).concat(posts.newestPosts, posts.archivePosts);
    let results = document.createElement("ul");
    for (var i = 0; i < all_posts.length; i++) {
      var post_contents = "".concat(all_posts[i].title + all_posts[i].preview + all_posts[i].author);
      if (post_contents.toLowerCase().search(search_string.toLowerCase()) != -1) {
        const finding = all_posts[i];
        let list_item = document.createElement("li");
        let link = document.createElement("a");
        link.target = "_blank";
        link.href = "/blog/" + finding.slug;
        link.innerText = finding.title;
        list_item.appendChild(link);
        list_item.innerHTML += " - <b>" + new Date(finding.date).toLocaleDateString("de-DE") + "</b>" +
          " - " + finding.author;
        results.appendChild(list_item);
      }
    }
    setOpen(false); // Close sidebar if open
    let results_div = document.getElementById("search-results");
    results_div.innerHTML = "<h3>Suchergebnisse: <h3>";
    results_div.appendChild(results);
  }

  return (
    <>
      <Head>
        <title>
          WE G(A)T NEWS – Die Schülerzeitung am Altenforst
        </title>

        <meta
          name="description"
          content="Unabhängiger Blog für Information, Meinung und Umfragen am Gymnasium zum Altenforst Troisdorf. Hier ist die Stimme der Schüler*innen!"
        />

        <meta
          name="keywords"
          content="Schülerzeitung, Gymnasium zum Altenforst, Troisdorf, News, Meinungen, Umfragen"
        />

        <meta name="author" content="Vincent Cui" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

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
        />
      </Head>

      <header ref={headerRef}>
        <nav aria-label="Hauptnavigation">
          <Link
            href="/"
            className="logo"
            aria-label="WE G(A)T NEWS – Startseite"
          >
            <Image
              src="/basic-images/logo.webp"
              alt="WE G(A)T NEWS"
              width="500"
              height="98"
            />
          </Link>

          <ul>
            {
              posts.newestPosts || posts.posts ? (
                <div id="search">
                  <input type="text" id="search-bar" />
                  <button id="search-button" onClick={search}>Suchen</button>
                </div>
              ) : <></>
              }
            <NavigationItems
              currentPath={router.pathname}
              onNavigate={() => setOpen(false)}
            />
          </ul>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={
              open
                ? "Navigation schließen"
                : "Navigation öffnen"
            }
            onClick={() =>
              setOpen((previous) => !previous)
            }
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </nav>

        <aside
          id="mobile-navigation"
          className={`sidebar ${open ? "active" : ""}`}
          aria-label="Mobile Navigation"
          aria-hidden={!open}
        >
          <ul>
            {
              posts.newestPosts || posts.posts ? (
                <div id="search">
                  <input type="text" id="search-bar" />
                  <button id="search-button" onClick={search}>Suchen</button>
                </div>
              ) : <></>
            }
            <NavigationItems
              currentPath={router.pathname}
              onNavigate={() => setOpen(false)}
            />
          </ul>
        </aside>
      </header>

      {
        posts.newestPosts || posts.posts ? (
            <div id="search-results"></div>
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
