import { useEffect, useRef, useState } from "react";
import TurndownService from "turndown";
import ToolsLayout from "../../components/layout/ToolsLayout";

const BLOCK_TAGS = new Set([
  "p",
  "div",
  "section",
  "article",
  "header",
  "footer",
  "main",
]);

const ALLOWED_TAGS = new Set([
  "a",
  "blockquote",
  "br",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "ul",
]);

const WORD_ONLY_TAGS = new Set([
  "font",
  "meta",
  "link",
  "o:p",
  "script",
  "style",
  "xml",
]);

function normalizeText(value, { singleLine = false } = {}) {
  let text = String(value || "")
    // Word and browser-inserted invisible/control characters.
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
    .replace(/[\u00AD]/g, "")
    .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    // Common Word typography that often causes odd Markdown/YAML output.
    .replace(/[“”„]/g, '"')
    .replace(/[‘’‚]/g, "'");

  if (singleLine) {
    return text.replace(/\s+/g, " ").trim();
  }

  return text
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeHtmlText(value) {
  return String(value || "")
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
    .replace(/[\u00AD]/g, "")
    .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/[“”„]/g, '"')
    .replace(/[‘’‚]/g, "'")
    .replace(/[\t ]+/g, " ");
}

function yamlString(value) {
  if (value === undefined || value === null) return '""';
  return `"${normalizeText(value, { singleLine: true }).replace(/"/g, '\\"')}"`;
}

function createSlug(value) {
  return normalizeText(value, { singleLine: true })
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

function cleanUrl(value) {
  const url = normalizeText(value, { singleLine: true });
  if (!url) return "";

  try {
    const parsedUrl = new URL(url, window.location.origin);
    if (["http:", "https:", "mailto:"].includes(parsedUrl.protocol)) {
      return url;
    }
  } catch {
    return "";
  }

  return "";
}

function unwrapElement(element) {
  const fragment = document.createDocumentFragment();

  while (element.firstChild) {
    fragment.appendChild(element.firstChild);
  }

  element.replaceWith(fragment);
}

function getPointSize(value) {
  const match = String(value || "").match(/(-?\d+(?:\.\d+)?)(pt|px)?/i);
  if (!match) return 0;

  const number = Number.parseFloat(match[1]);
  const unit = (match[2] || "px").toLowerCase();

  return unit === "pt" ? number * 1.333 : number;
}

function getListInfo(element) {
  if (!element || element.tagName?.toLowerCase() !== "p") return null;

  const text = normalizeText(element.textContent, { singleLine: true });
  const bulletMatch = text.match(/^[•·●○▪▫-]\s+(.+)$/);
  const orderedMatch = text.match(/^(?:\d+|[a-zA-Z]|[ivxlcdmIVXLCDM]+)[.)]\s+(.+)$/);

  if (!bulletMatch && !orderedMatch) return null;

  const style = element.getAttribute("style") || "";
  const msoLevel = style.match(/mso-list\s*:[^;]*level(\d+)/i);
  const marginLeft = style.match(/margin-left\s*:\s*([^;]+)/i);
  const textIndent = style.match(/text-indent\s*:\s*([^;]+)/i);

  let level = msoLevel ? Number.parseInt(msoLevel[1], 10) - 1 : 0;

  if (!msoLevel && marginLeft) {
    const indentSize = Math.max(
      0,
      getPointSize(marginLeft[1]) + Math.min(0, getPointSize(textIndent?.[1]))
    );
    level = Math.max(0, Math.round(indentSize / 48) - 1);
  }

  return {
    type: bulletMatch ? "ul" : "ol",
    level: Math.max(0, Math.min(level, 6)),
  };
}

function stripListMarkerFromElement(element) {
  const walker = element.ownerDocument.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT
  );

  const firstTextNode = walker.nextNode();
  if (!firstTextNode) return element;

  firstTextNode.textContent = firstTextNode.textContent.replace(
    /^\s*(?:[•·●○▪▫-]|(?:\d+|[a-zA-Z]|[ivxlcdmIVXLCDM]+)[.)])\s+/,
    ""
  );

  return element;
}

function isEmptyParagraph(element) {
  if (!element || element.tagName?.toLowerCase() !== "p") return false;
  const text = normalizeText(element.textContent, { singleLine: true });
  return !text && !element.querySelector("br,img,video,iframe");
}

function copyCleanChildren(source, target, documentRef) {
  Array.from(source.childNodes).forEach((child) => {
    const cleanChild = cleanNode(child, documentRef);
    if (cleanChild) target.appendChild(cleanChild);
  });
}

function cleanNode(node, documentRef) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = normalizeHtmlText(node.textContent);
    return text ? documentRef.createTextNode(text) : null;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const originalTag = node.tagName.toLowerCase();

  if (WORD_ONLY_TAGS.has(originalTag)) return null;

  const style = node.getAttribute("style") || "";
  const fontWeight = style.match(/font-weight\s*:\s*([^;]+)/i)?.[1] || "";
  const isBold =
    ["b", "strong"].includes(originalTag) ||
    /bold/i.test(fontWeight) ||
    Number.parseInt(fontWeight, 10) >= 600;
  const isItalic = ["i", "em"].includes(originalTag) || /font-style\s*:\s*italic/i.test(style);

  let tagName = originalTag;

  if (BLOCK_TAGS.has(originalTag)) tagName = "p";
  else if (isBold) tagName = "strong";
  else if (isItalic) tagName = "em";
  else if (originalTag === "span") tagName = "fragment";
  else if (!ALLOWED_TAGS.has(originalTag)) tagName = "fragment";

  const cleanElement =
    tagName === "fragment"
      ? documentRef.createDocumentFragment()
      : documentRef.createElement(tagName);

  if (tagName === "a") {
    const href = cleanUrl(node.getAttribute("href"));
    if (href) cleanElement.setAttribute("href", href);
  }

  copyCleanChildren(node, cleanElement, documentRef);

  if (!cleanElement.childNodes.length && tagName !== "br") return null;

  if (isBold && isItalic && tagName !== "strong" && tagName !== "em") {
    const strong = documentRef.createElement("strong");
    const em = documentRef.createElement("em");
    em.appendChild(cleanElement);
    strong.appendChild(em);
    return strong;
  }

  if (isBold && isItalic && tagName === "strong") {
    const em = documentRef.createElement("em");
    while (cleanElement.firstChild) em.appendChild(cleanElement.firstChild);
    cleanElement.appendChild(em);
  }

  if (isBold && isItalic && tagName === "em") {
    const strong = documentRef.createElement("strong");
    while (cleanElement.firstChild) strong.appendChild(cleanElement.firstChild);
    cleanElement.appendChild(strong);
  }

  return cleanElement;
}

function normalizePastedPlainText(text) {
  const cleanText = normalizeText(text);
  if (!cleanText) return "";

  return cleanText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, "<br>"))
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
}

function normalizeWordLists(root) {
  const documentRef = root.ownerDocument;

  const processContainer = (container) => {
    Array.from(container.children).forEach(processContainer);

    const children = Array.from(container.childNodes);
    let index = 0;

    while (index < children.length) {
      const child = children[index];
      const info =
        child.nodeType === Node.ELEMENT_NODE ? getListInfo(child) : null;

      if (!info) {
        index += 1;
        continue;
      }

      const run = [];
      let cursor = index;

      while (cursor < children.length) {
        const runChild = children[cursor];
        const runInfo =
          runChild.nodeType === Node.ELEMENT_NODE ? getListInfo(runChild) : null;

        if (!runInfo) break;
        run.push({ element: runChild, info: runInfo });
        cursor += 1;
      }

      const firstParagraph = run[0].element;
      const stack = [];
      const listsFragment = documentRef.createDocumentFragment();

      run.forEach(({ element, info: listInfo }) => {
        let level = listInfo.level;

        while (level > 0 && !stack[level - 1]?.lastLi) {
          level -= 1;
        }

        stack.length = Math.min(stack.length, level + 1);

        if (!stack[level] || stack[level].type !== listInfo.type) {
          const list = documentRef.createElement(listInfo.type);

          if (level === 0) {
            listsFragment.appendChild(list);
          } else {
            stack[level - 1].lastLi.appendChild(list);
          }

          stack[level] = {
            list,
            type: listInfo.type,
            lastLi: null,
          };
        }

        const listItem = documentRef.createElement("li");
        const cleanParagraph = stripListMarkerFromElement(element.cloneNode(true));

        while (cleanParagraph.firstChild) {
          listItem.appendChild(cleanParagraph.firstChild);
        }

        stack[level].list.appendChild(listItem);
        stack[level].lastLi = listItem;
        stack.length = level + 1;
      });

      firstParagraph.before(listsFragment);
      run.forEach(({ element }) => element.remove());
      index = cursor;
    }
  };

  processContainer(root);
}

function sanitizeHtml(html) {
  if (!html) return "";

  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(html, "text/html");

  normalizeWordLists(parsedDocument.body);

  const cleanDocument = document.implementation.createHTMLDocument("");
  const container = cleanDocument.createElement("div");
  copyCleanChildren(parsedDocument.body, container, cleanDocument);

  Array.from(container.querySelectorAll("p")).forEach((paragraph) => {
    if (isEmptyParagraph(paragraph)) paragraph.remove();
  });

  return container.innerHTML
    .replace(/<p><br><\/p>/g, "")
    .replace(/(?:<br>\s*){3,}/g, "<br><br>")
    .trim();
}

function sanitizeMarkdown(markdown) {
  return normalizeText(markdown)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function EditorPage() {
  const editorRef = useRef(null);
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
  const [contentHtml, setContentHtml] = useState("");
  const [markdown, setMarkdown] = useState("");

  const titleTooLong = title.length > 70;
  const previewTooLong = preview.length > 120;

  const plainTextContent = contentHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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

  const setEditorHtml = (html) => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }

    setContentHtml(html);
  };

  const sanitizeEditorHtml = (html) => {
    const cleanHtml = sanitizeHtml(html);
    setEditorHtml(cleanHtml);
    return cleanHtml;
  };

  const getEditorSelectionRange = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) return null;

    return range;
  };

  const setCaretAfterNode = (node) => {
    const selection = window.getSelection();
    if (!selection || !node) return;

    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const insertHtmlAtSelection = (html) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const range = getEditorSelectionRange() || document.createRange();

    if (!range.commonAncestorContainer || !editor.contains(range.commonAncestorContainer)) {
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    const template = document.createElement("template");
    template.innerHTML = html;
    const fragment = template.content;
    const lastNode = fragment.lastChild;

    range.deleteContents();
    range.insertNode(fragment);

    setCaretAfterNode(lastNode);
    setContentHtml(editor.innerHTML);
  };

  const formatInline = (tagName) => {
    const editor = editorRef.current;
    const range = getEditorSelectionRange();

    if (!editor || !range || range.collapsed) return;

    const wrapper = document.createElement(tagName);
    wrapper.appendChild(range.extractContents());
    range.insertNode(wrapper);
    setCaretAfterNode(wrapper);
    sanitizeEditorHtml(editor.innerHTML);
  };

  const formatList = (type) => {
    const editor = editorRef.current;
    const range = getEditorSelectionRange();

    if (!editor || !range) return;

    const selectedText = normalizeText(range.toString());
    if (!selectedText) return;

    const list = document.createElement(type);

    selectedText
      .split(/\n+/)
      .map((line) => normalizeText(line, { singleLine: true }))
      .filter(Boolean)
      .forEach((line) => {
        const item = document.createElement("li");
        item.textContent = line.replace(
          /^(?:[•·●○▪▫-]|(?:\d+|[a-zA-Z]|[ivxlcdmIVXLCDM]+)[.)])\s+/,
          ""
        );
        list.appendChild(item);
      });

    range.deleteContents();
    range.insertNode(list);
    setCaretAfterNode(list);
    sanitizeEditorHtml(editor.innerHTML);
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const clipboardData = event.clipboardData;
    const pastedHtml = clipboardData.getData("text/html");
    const pastedText = clipboardData.getData("text/plain");
    const cleanHtml = sanitizeHtml(
      pastedHtml || normalizePastedPlainText(pastedText)
    );

    if (!cleanHtml) return;

    insertHtmlAtSelection(cleanHtml);
  };

  useEffect(() => {
    setSlug(createSlug(title));
  }, [title]);

  const addTag = () => {
    const cleaned = normalizeText(tagInput, { singleLine: true }).toLowerCase();

    if (!cleaned) return;

    if (tags.includes(cleaned)) {
      setTagInput("");
      return;
    }

    setTags((prev) => [...prev, cleaned]);
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    const nextTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(nextTags);
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
    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
    });

    turndownService.remove(["style", "script", "meta", "link"]);

    const cleanHtml = sanitizeHtml(contentHtml);
    const contentMarkdown = sanitizeMarkdown(turndownService.turndown(cleanHtml));

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
      contentMarkdown,
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
    contentHtml,
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
          setArticleNumber(normalizeText(event.target.value, { singleLine: true }))
        }
        className={`editor-input ${
          articleNumber.trim() && !articleNumberValid ? "editor-input-error" : ""
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
          setImageSource(normalizeText(event.target.value, { singleLine: true }))
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
            <button onClick={() => removeTag(tag)} className="editor-tag-remove">
              ×
            </button>
          </span>
        ))}

        <input
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={addTag}
          placeholder="Tags (normal leer lassen)"
          className="editor-tag-input"
        />
      </div>

      {advancedOpen ? (
        <input value={slug} readOnly className="editor-input editor-read-only" />
      ) : null}

      <div className="editor-toolbar">
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatInline("strong")}>Fett</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatInline("em")}>Kursiv</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatList("ul")}>Liste</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatList("ol")}>Nummeriert</button>
      </div>

      <p>
        Prüfe die Formatierung, ob sie dem Original entspricht. Vor allem bei
        Fett und Kursiv, sowie Listen und Absätze.
      </p>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onPaste={handlePaste}
        onInput={(event) => setContentHtml(event.currentTarget.innerHTML)}
        onBlur={(event) => sanitizeEditorHtml(event.currentTarget.innerHTML)}
        className="editor-content"
      />

      {!isValidPost ? (
        <div className="editor-error-box">
          Download gesperrt — Titel, Artikelnummer, Vorschau, Autor und Text
          prüfen. Die Artikelnummer darf nur Zahlen enthalten.
        </div>
      ) : null}

      <div className="editor-actions-row">
        <button
          onClick={downloadMarkdown}
          disabled={!isValidPost}
          className={`editor-download-button ${
            !isValidPost ? "editor-disabled-button" : ""
          }`.trim()}
        >
          Markdown herunterladen
        </button>

        <button
          onClick={() => setAdvancedOpen((prev) => !prev)}
          className="editor-advanced-toggle"
          type="button"
        >
          {advancedOpen ? "Advanced schließen" : "Advanced"}
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
  return (
    <ToolsLayout title="Blog Post Editor">
      {page}
    </ToolsLayout>
  );
};
