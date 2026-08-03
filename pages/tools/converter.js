import { useMemo, useState } from "react";
import ToolsLayout from "../../components/layout/ToolsLayout";
import Image from "next/image";

export const TARGET_WIDTH = 1200;
export const TARGET_HEIGHT = 800;

export default function ImageConverterPage() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [originalSize, setOriginalSize] = useState([TARGET_WIDTH, TARGET_HEIGHT]);

  const accept = useMemo(() => "image/*", []);

  const fileNameValid = /^\d+$/.test(fileName.trim());
  const canDownload = Boolean(result?.url && fileNameValid);

  const sanitizeFileName = (name) => {
    return name
      .trim()
      .replace(/\.webp$/i, "")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .replace(/\s+/g, "-");
  };

  const cleanupOldPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const cleanupOldResult = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    cleanupOldResult();
    cleanupOldPreview();

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      const imageBitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      setOriginalSize([imageBitmap.width, imageBitmap.height]); // used to correctly display the orignal image
      const scale = Math.max(
        TARGET_WIDTH / imageBitmap.width,
        TARGET_HEIGHT / imageBitmap.height,
      );

      const drawWidth = imageBitmap.width * scale;
      const drawHeight = imageBitmap.height * scale;
      const offsetX = (TARGET_WIDTH - drawWidth) / 2;
      const offsetY = (TARGET_HEIGHT - drawHeight) / 2;

      ctx.drawImage(imageBitmap, offsetX, offsetY, drawWidth, drawHeight);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.9);
      });

      const url = URL.createObjectURL(blob);
      setResult({
        url,
        sizeKB: Math.round(blob.size / 1024),
      });

      if (imageBitmap.close) {
        imageBitmap.close();
      }
    } catch {
      setResult(null);
      setError("Fehler beim Konvertieren.");
    }

    event.target.value = "";
  };

  const downloadName = `${sanitizeFileName(fileName)}.webp`;

  return (
    <div className="tools-card tools-card--converter">
      <p className="tools-copy">
        Bild auswählen, Artikelnummer eingeben und herunterladen.{" "}
        <strong>Bildquelle nicht vergessen für den Editor,</strong> am besten
        den Tab offen lassen.
      </p>

      <p>
        Websiten zur Bildsuche:{" "}
        <a href="https://unsplash.com/de" target="_blank" rel="noopener noreferrer">
          Unsplash
        </a>
        {", "}
        <a
          href="https://www.pexels.com/de-de/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pexels
        </a>
        {", "}
        <a href="https://pixabay.com/" target="_blank" rel="noopener noreferrer">
          Pixabay
        </a>
        {", "}
      </p>

      <div className="tools-field">
        <label className="tools-label">Dateiname</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
          placeholder="Artikelnummer"
          className={`tools-input ${
            fileName.trim() && !fileNameValid ? "tools-input-error" : ""
          }`.trim()}
        />
      </div>

      {fileName.trim() && !fileNameValid ? (
        <p className="tools-error">Die Artikelnummer darf nur Zahlen enthalten.</p>
      ) : null}

      <div className="tools-actions">
        <label className="tools-upload-button">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="tools-hidden-input"
          />
          Bild auswählen
        </label>

        <a
          href={canDownload ? result.url : "#"}
          download={canDownload ? downloadName : undefined}
          onClick={(event) => {
            if (!canDownload) event.preventDefault();
          }}
          className={`tools-download-button ${
            canDownload ? "" : "is-disabled"
          }`.trim()}
        >
          Herunterladen
        </a>
      </div>

      {error ? <p className="tools-error">{error}</p> : null}

      {previewUrl ? (
        <div className="tools-section">
          <h3>Original</h3>
          <Image src={previewUrl} className="tools-image" alt="Originalbild" width={originalSize[0]} height={originalSize[1]}/>
        </div>
      ) : null}

      {result ? (
        <div className="tools-section">
          <h3>Konvertiert</h3>
          <Image
            src={result.url}
            className="tools-image"
            alt="Konvertiertes Bild"
            width={TARGET_WIDTH}
            height={TARGET_HEIGHT}
          />
          <p>
            Größe: <strong>{result.sizeKB} KB</strong>
          </p>
        </div>
      ) : null}
    </div>
  );
}

ImageConverterPage.getLayout = function getLayout(page) {
  return <ToolsLayout title="Image Converter">{page}</ToolsLayout>;
};
