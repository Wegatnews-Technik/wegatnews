import dynamic from "next/dynamic";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiCode,
  FiDownload,
  FiLink,
  FiSettings,
  FiTag,
  FiEdit3,
  FiUser,
  FiX,
} from "react-icons/fi";

const MarkdownCkEditor = dynamic(
  () => import("../../components/MarkdownCkEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="editor-loading">
        Editor lädt ...
      </div>
    ),
  },
);

function normalizeText(
  value,
  { singleLine = false, trim = false } = {},
) {
  let text = String(value || "")
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
    .replace(/\u00AD/g, "")
    .replace(
      /[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g,
      " ",
    )
    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      "",
    )
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n");

  if (singleLine) {
    return trim
      ? text.replace(/\s+/g, " ").trim()
      : text.replace(/\s+/g, " ");
  }

  return text
    .split("\n")
    .map((line) =>
      line.replace(/[\t ]+/g, " ").trim(),
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function yamlString(value) {
  if (value === undefined || value === null) {
    return '""';
  }

  return `"${normalizeText(value, {
    singleLine: true,
    trim: true,
  }).replace(/"/g, '\\"')}"`;
}

function createSlug(value) {
  return normalizeText(value, {
    singleLine: true,
    trim: true,
  })
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeMarkdown(markdown) {
  return normalizeText(markdown)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const DEFAULT_TAGS = [
  "Informativ",
  "Meinung",
  "Umfrage",
  "Buchrezension",
];

function markdownToPlainText(markdown) {
  return String(markdown || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_~`[\]()\-+.!|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function EditorPage() {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [advancedOpen, setAdvancedOpen] =
    useState(false);

  const [title, setTitle] = useState("");
  const [articleNumber, setArticleNumber] =
    useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState(today);
  const [author, setAuthor] = useState("");
  const [imageSource, setImageSource] =
    useState("");
  const [preview, setPreview] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [contentMarkdown, setContentMarkdown] =
    useState("");
  const [markdown, setMarkdown] = useState("");

  const titleTooLong = title.length > 70;
  const previewTooLong = preview.length > 120;

  const plainTextContent =
    markdownToPlainText(contentMarkdown);

  const articleNumberValid = /^\d+$/.test(
    articleNumber.trim(),
  );

  const isValidPost =
    title.trim() &&
    !titleTooLong &&
    articleNumberValid &&
    preview.trim() &&
    !previewTooLong &&
    author.trim() &&
    slug.trim() &&
    plainTextContent;

  useEffect(() => {
    setSlug(createSlug(title));
  }, [title]);

  const addTagValue = (value) => {
    const cleaned = normalizeText(value, {
      singleLine: true,
      trim: true,
    });

    if (!cleaned) {
      return;
    }

    setTags((previous) =>
      previous.includes(cleaned)
        ? previous
        : [...previous, cleaned],
    );
  };

  const addTag = () => {
    addTagValue(tagInput);
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setTags((previous) =>
      previous.filter(
        (tag) => tag !== tagToRemove,
      ),
    );
  };

  const handleTagKeyDown = (event) => {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();

      addTag();
    }

    if (
      event.key === "Backspace" &&
      !tagInput &&
      tags.length > 0
    ) {
      setTags((previous) =>
        previous.slice(0, -1),
      );
    }
  };

  const buildMarkdown = useCallback(() => {
    const cleanContentMarkdown =
      sanitizeMarkdown(contentMarkdown);

    return [
      "---",
      `title: ${yamlString(title)}`,
      `articleNumber: ${yamlString(
        articleNumber,
      )}`,
      `slug: ${yamlString(slug)}`,
      `date: ${yamlString(date)}`,
      `author: ${yamlString(author)}`,
      `image: ${yamlString(
        `/article-images/${articleNumber.trim()}.webp`,
      )}`,
      `image_source: ${yamlString(
        imageSource,
      )}`,
      `preview: ${yamlString(preview)}`,
      `tags: [${tags
        .map((tag) => yamlString(tag))
        .join(", ")}]`,
      "---",
      "",
      cleanContentMarkdown,
    ].join("\n");
  }, [
    title,
    articleNumber,
    slug,
    date,
    author,
    imageSource,
    preview,
    tags,
    contentMarkdown,
  ]);

  useEffect(() => {
    setMarkdown(buildMarkdown());
  }, [buildMarkdown]);

  const downloadMarkdown = () => {
    if (!isValidPost) {
      return;
    }

    const md = buildMarkdown();

    const blob = new Blob([md], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${articleNumber.trim()}.md`;

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Head>
        <title>
          Blog Post Editor | WE G(A)T NEWS
        </title>

        <meta
          name="description"
          content="Blog Post Editor für WE G(A)T NEWS"
        />
      </Head>

      <section className="editor-page">
        <header className="editor-page-header">
          <div
            className="editor-page-icon"
            aria-hidden="true"
          >
            <FiEdit3 />
          </div>

          <div>
            <h1>Blog Post Editor</h1>

            <p>
              Metadaten ausfüllen, Artikel schreiben
              und anschließend als Markdown-Datei
              herunterladen.
            </p>
          </div>
        </header>

        <div className="editor-card">
          <div className="editor-field">
            <div className="editor-label-row">
              <label
                htmlFor="editor-title"
                className="editor-label"
              >
                Titel
              </label>

              <span
                className={`editor-char-count ${
                  titleTooLong
                    ? "is-error"
                    : ""
                }`.trim()}
              >
                {title.length}/70
              </span>
            </div>

            <input
              id="editor-title"
              type="text"
              placeholder="Titel des Artikels"
              value={title}
              onChange={(event) =>
                setTitle(
                  normalizeText(
                    event.target.value,
                    {
                      singleLine: true,
                    },
                  ),
                )
              }
              className={`editor-input ${
                titleTooLong
                  ? "editor-input-error"
                  : ""
              }`.trim()}
            />
          </div>

          <div className="editor-field-grid">
            <div className="editor-field">
              <label
                htmlFor="editor-article-number"
                className="editor-label"
              >
      
                Artikelnummer
              </label>

              <input
                id="editor-article-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="z. B. 44"
                value={articleNumber}
                onChange={(event) =>
                  setArticleNumber(
                    normalizeText(
                      event.target.value,
                      {
                        singleLine: true,
                        trim: true,
                      },
                    ),
                  )
                }
                className={`editor-input ${
                  articleNumber.trim() &&
                  !articleNumberValid
                    ? "editor-input-error"
                    : ""
                }`.trim()}
              />
            </div>

            <div className="editor-field">
              <label
                htmlFor="editor-date"
                className="editor-label"
              >
                <FiCalendar aria-hidden="true" />
                Datum
              </label>

              <input
                id="editor-date"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="editor-input"
              />
            </div>
          </div>

          {articleNumber.trim() &&
          !articleNumberValid ? (
            <div className="editor-message editor-message-error">
              <FiAlertTriangle
                aria-hidden="true"
              />

              <span>
                Die Artikelnummer darf nur Zahlen
                enthalten.
              </span>
            </div>
          ) : null}

          <div className="editor-field-grid">
            <div className="editor-field">
              <label
                htmlFor="editor-author"
                className="editor-label"
              >
                <FiUser aria-hidden="true" />
                Autor
              </label>

              <input
                id="editor-author"
                type="text"
                placeholder="Clara, 10. Klasse"
                value={author}
                onChange={(event) =>
                  setAuthor(
                    normalizeText(
                      event.target.value,
                      {
                        singleLine: true,
                      },
                    ),
                  )
                }
                className="editor-input"
              />
            </div>

            <div className="editor-field">
              <label
                htmlFor="editor-image-source"
                className="editor-label"
              >
                <FiLink aria-hidden="true" />
                Bildquelle
              </label>

              <input
                id="editor-image-source"
                type="text"
                placeholder="Link zur rechtlichen Bildquelle"
                value={imageSource}
                onChange={(event) =>
                  setImageSource(
                    normalizeText(
                      event.target.value,
                      {
                        singleLine: true,
                      },
                    ),
                  )
                }
                className="editor-input"
              />
            </div>
          </div>

          <div className="editor-field">
            <div className="editor-label-row">
              <label
                htmlFor="editor-preview"
                className="editor-label"
              >
                Vorschautext
              </label>

              <span
                className={`editor-char-count ${
                  previewTooLong
                    ? "is-error"
                    : ""
                }`.trim()}
              >
                {preview.length}/120
              </span>
            </div>

            <textarea
              id="editor-preview"
              rows={3}
              placeholder="Ein kurzer Einstieg, der neugierig macht ..."
              value={preview}
              onChange={(event) =>
                setPreview(
                  normalizeText(
                    event.target.value,
                    {
                      singleLine: true,
                    },
                  ),
                )
              }
              className={`editor-textarea ${
                previewTooLong
                  ? "editor-input-error"
                  : ""
              }`.trim()}
            />
          </div>

          <div className="editor-field">
            <div className="editor-label">
              <FiTag aria-hidden="true" />
              Tags
            </div>

            <div className="editor-tag-defaults">
              {DEFAULT_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    tags.includes(tag)
                      ? removeTag(tag)
                      : addTagValue(tag)
                  }
                  className={`editor-tag-default-button ${
                    tags.includes(tag)
                      ? "enabled-tag"
                      : ""
                  }`.trim()}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setAdvancedOpen(
                (previous) => !previous,
              )
            }
            className="editor-advanced-toggle"
            aria-expanded={advancedOpen}
          >
            <FiSettings aria-hidden="true" />

            {advancedOpen
              ? "Advanced schließen"
              : "Advanced"}
          </button>

          {advancedOpen ? (
            <div className="editor-advanced-panel">
              <div className="editor-field">
                <label
                  htmlFor="editor-custom-tag"
                  className="editor-label"
                >
                  <FiTag aria-hidden="true" />
                  Eigene Tags
                </label>

                <div className="editor-tags-box">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="editor-tag-chip"
                    >
                      {tag}

                      <button
                        type="button"
                        onClick={() =>
                          removeTag(tag)
                        }
                        className="editor-tag-remove"
                        aria-label={`Tag ${tag} entfernen`}
                      >
                        <FiX aria-hidden="true" />
                      </button>
                    </span>
                  ))}

                  <input
                    id="editor-custom-tag"
                    value={tagInput}
                    onChange={(event) =>
                      setTagInput(
                        normalizeText(
                          event.target.value,
                          {
                            singleLine: true,
                            trim: true,
                          },
                        ),
                      )
                    }
                    onKeyDown={handleTagKeyDown}
                    onBlur={addTag}
                    placeholder="Tag hinzufügen"
                    className="editor-tag-input"
                  />
                </div>
              </div>

              <div className="editor-field">
                <label
                  htmlFor="editor-slug"
                  className="editor-label"
                >
                  <FiLink aria-hidden="true" />
                  Slug
                </label>

                <input
                  id="editor-slug"
                  value={slug}
                  readOnly
                  className="editor-input editor-read-only"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="editor-writing-section">
          <div className="editor-section-heading">
            <div>
              <h2>Artikeltext</h2>

              <p>
                Prüfe nach dem Einfügen aus Word
                besonders Listen sowie Fett- und
                Kursivformatierungen.
              </p>
            </div>
          </div>

          <MarkdownCkEditor
            value={contentMarkdown}
            onChange={setContentMarkdown}
          />
        </div>

        {!isValidPost ? (
          <div className="editor-message editor-message-warning">
            <FiAlertTriangle
              aria-hidden="true"
            />

            <span>
              Download gesperrt — Titel,
              Artikelnummer, Vorschau, Autor und
              Artikeltext prüfen.
            </span>
          </div>
        ) : null}

        <div className="editor-actions-row">
          <button
            type="button"
            onClick={downloadMarkdown}
            disabled={!isValidPost}
            className="editor-download-button"
          >
            <FiDownload aria-hidden="true" />
            Markdown herunterladen
          </button>
        </div>

        {advancedOpen ? (
          <div className="editor-markdown-preview">
            <div className="editor-section-heading editor-section-heading-inline">
              <FiCode aria-hidden="true" />

              <h2>Markdown Preview</h2>
            </div>

            <pre className="editor-preview-box">
              {markdown}
            </pre>
          </div>
        ) : null}
      </section>
    </>
  );
}