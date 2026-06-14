import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ToolsLayout from "../../components/layout/ToolsLayout";

const MarkdownCkEditor = dynamic(
  () => import("../../components/MarkdownCkEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="editor-content editor-loading">Editor lädt ...</div>
    ),
  },
);

function normalizeText(value, { singleLine = false, trim = false } = {}) {
  let text = String(value || "")
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
    .replace(/\u00AD/g, "")
    .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n");

  if (singleLine) {
    return trim ? text.replace(/\s+/g, " ").trim() : text.replace(/\s+/g, " ");
  }

  return text
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function yamlString(value) {
  if (value === undefined || value === null) return '""';

  return `"${normalizeText(value, { singleLine: true, trim: true}).replace(/"/g, '\\"')}"`;
}

function createSlug(value) {
  return normalizeText(value, { singleLine: true, trim: true })
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
  const today = new Date().toISOString().split("T")[0];

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [articleNumber, setArticleNumber] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState(today);
  const [author, setAuthor] = useState("");
  const [imageSource, setImageSource] = useState("");
  const [preview, setPreview] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [markdown, setMarkdown] = useState("");

  const titleTooLong = title.length > 70;
  const previewTooLong = preview.length > 120;

  const plainTextContent = markdownToPlainText(contentMarkdown);
  const articleNumberValid = /^\d+$/.test(articleNumber.trim());

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

  const addTag = () => {
    const cleaned = normalizeText(tagInput, { singleLine: true });

    if (!cleaned) return;

    if (tags.includes(cleaned)) {
      setTagInput("");
      return;
    }

    setTags((prev) => [...prev, cleaned]);
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }

    if (event.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const buildMarkdown = () => {
    const cleanContentMarkdown = sanitizeMarkdown(contentMarkdown);

    return [
      "---",
      `title: ${yamlString(title)}`,
      `articleNumber: ${yamlString(articleNumber)}`,
      `slug: ${yamlString(slug)}`,
      `date: ${yamlString(date)}`,
      `author: ${yamlString(author)}`,
      `image: ${yamlString(`/article-images/${articleNumber.trim()}.webp`)}`,
      `image_source: ${yamlString(imageSource)}`,
      `preview: ${yamlString(preview)}`,
      `tags: [${tags.map((tag) => yamlString(tag)).join(", ")}]`,
      "---",
      "",
      cleanContentMarkdown,
    ].join("\n");
  };

  useEffect(() => {
    setMarkdown(buildMarkdown());
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

  const downloadMarkdown = () => {
    if (!isValidPost) return;

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
    <div className="editor-page">
      <input
        type="text"
        placeholder="Titel (max 70 Zeichen)"
        value={title}
        onChange={(event) =>
          setTitle(normalizeText(event.target.value, { singleLine: true }))
        }
        className={`editor-input ${
          titleTooLong ? "editor-input-error" : ""
        }`.trim()}
      />

      <div className="editor-char-count">{title.length}/70</div>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Artikelnummer (gleich wie Bild)"
        value={articleNumber}
        onChange={(event) =>
          setArticleNumber(
            normalizeText(event.target.value, { singleLine: true, trim: true }),
          )
        }
        className={`editor-input ${
          articleNumber.trim() && !articleNumberValid
            ? "editor-input-error"
            : ""
        }`.trim()}
      />

      {articleNumber.trim() && !articleNumberValid ? (
        <div className="editor-error-box">
          Die Artikelnummer darf nur Zahlen enthalten.
        </div>
      ) : null}

      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="editor-input"
      />

      <input
        type="text"
        placeholder="Author (Vorname, Klassenstufe, zb Clara, 10.Klasse)"
        value={author}
        onChange={(event) =>
          setAuthor(normalizeText(event.target.value, { singleLine: true }))
        }
        className="editor-input"
      />

      <input
        type="text"
        placeholder="Bild Link (rechtliche Bildquelle)"
        value={imageSource}
        onChange={(event) =>
          setImageSource(
            normalizeText(event.target.value, { singleLine: true, trim: true }),
          )
        }
        className="editor-input"
      />

      <textarea
        rows={2}
        placeholder="Textvorschau (ein interessanter Anfang, der Neugier. max 120 Zeichen)"
        value={preview}
        onChange={(event) =>
          setPreview(normalizeText(event.target.value, { singleLine: true }))
        }
        className={`editor-textarea ${
          previewTooLong ? "editor-input-error" : ""
        }`.trim()}
      />

      <div className="editor-char-count">{preview.length}/120</div>

      <div className="editor-tags-box">
        {tags.map((tag) => (
          <span key={tag} className="editor-tag-chip">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="editor-tag-remove"
            >
              ×
            </button>
          </span>
        ))}

        <input
          value={tagInput}
          onChange={(event) =>
            setTagInput(normalizeText(event.target.value, { singleLine: true, trim: true }))
          }
          onKeyDown={handleTagKeyDown}
          onBlur={addTag}
          placeholder="Tags (normal leer lassen)"
          className="editor-tag-input"
        />
      </div>

      {advancedOpen ? (
        <input
          value={slug}
          readOnly
          className="editor-input editor-read-only"
        />
      ) : null}

      <p>
        Formartierung des Texts überprüfen, es kann sein dass listen, Fett und Kursiv verloren geht.
      </p>
      <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          className="editor-advanced-toggle"
        >
          {advancedOpen ? "Advanced schließen" : "Advanced"}
        </button>
      <MarkdownCkEditor value={contentMarkdown} onChange={setContentMarkdown} />

      {!isValidPost ? (
        <div className="editor-error-box">
          Download gesperrt — Titel, Artikelnummer, Vorschau, Autor und Text
          prüfen. Die Artikelnummer darf nur Zahlen enthalten.
        </div>
      ) : null}

      <div className="editor-actions-row">
        <button
          type="button"
          onClick={downloadMarkdown}
          disabled={!isValidPost}
          className={`editor-download-button ${
            !isValidPost ? "editor-disabled-button" : ""
          }`.trim()}
        >
          Markdown herunterladen
        </button>


      </div>

      {advancedOpen ? (
        <>
          <h2>Markdown Preview</h2>
          <pre className="editor-preview-box">{markdown}</pre>
        </>
      ) : null}
    </div>
  );
}

EditorPage.getLayout = function getLayout(page) {
  return <ToolsLayout title="Blog Post Editor">{page}</ToolsLayout>;
};
