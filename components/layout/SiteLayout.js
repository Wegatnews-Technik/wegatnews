import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

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

export default function SiteLayout({ children }) {
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
            <img
              src="/basic-images/logo.webp"
              alt="WE G(A)T NEWS"
              width="500"
              height="98"
            />
          </Link>

          <ul>
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
            <NavigationItems
              currentPath={router.pathname}
              onNavigate={() => setOpen(false)}
            />
          </ul>
        </aside>
      </header>

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