import Head from "next/head";
import Link from "next/link";
import {
  FiTrendingUp,
  FiArrowRight,
  FiEdit3,
  FiExternalLink,
  FiImage,
} from "react-icons/fi";

export default function ToolsIndexPage() {
  return (
    <>
      <Head>
        <title>Redaktions-Tools | WE G(A)T NEWS</title>
        <meta
          name="description"
          content="Werkzeuge für die Redaktion von WE G(A)T NEWS"
        />
      </Head>

      <section className="tools-overview">
        <div className="tools-overview-header">
          <h1>Tools für Redaktion und Leserschaft</h1>

          <p className="tools-overview-intro">
            Kleine Werkzeuge für Artikel, Bilder und die Verwaltung von WE G(A)T
            NEWS.
          </p>
        </div>

        <div className="tools-grid">
          <a
            href="https://cloud.umami.is/share/j2rKzIhE8t490C1z"
            target="_blank"
            rel="noopener noreferrer"
            className="tool-overview-card"
          >
            <FiTrendingUp className="tool-overview-icon" aria-hidden="true" />

            <h2>Statistiken</h2>

            <p>Besucherzahlen und die Nutzung der Website in Umami ansehen.</p>

            <span className="tool-overview-action">
              Statistiken öffnen
              <FiExternalLink aria-hidden="true" />
            </span>
          </a>

          <Link href="/tools/editor" className="tool-overview-card">
            <FiEdit3 className="tool-overview-icon" aria-hidden="true" />

            <h2>Texteditor</h2>

            <p>
              Artikel vorbereiten, Metadaten eintragen und als Markdown
              herunterladen.
            </p>

            <span className="tool-overview-action">
              Editor öffnen
              <FiArrowRight aria-hidden="true" />
            </span>
          </Link>

          <Link href="/tools/converter" className="tool-overview-card">
            <FiImage className="tool-overview-icon" aria-hidden="true" />

            <h2>Bildconverter</h2>

            <p>
              Bilder auf das richtige Format bringen und als WebP für Artikel
              speichern.
            </p>

            <span className="tool-overview-action">
              Converter öffnen
              <FiArrowRight aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
