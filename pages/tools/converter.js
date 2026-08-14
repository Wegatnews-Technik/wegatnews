import Head from "next/head";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiExternalLink,
  FiHash,
  FiImage,
  FiInfo,
  FiUploadCloud,
} from "react-icons/fi";

export const TARGET_WIDTH = 1200;
export const TARGET_HEIGHT = 800;

export default function ImageConverterPage() {
  const [previewUrl, setPreviewUrl] =
    useState(null);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [fileName, setFileName] =
    useState("");

  const [originalSize, setOriginalSize] =
    useState([
      TARGET_WIDTH,
      TARGET_HEIGHT,
    ]);

  const accept = useMemo(
    () => "image/*",
    [],
  );

  const fileNameValid = /^\d+$/.test(
    fileName.trim(),
  );

  const canDownload = Boolean(
    result?.url && fileNameValid,
  );

  const sanitizeFileName = (name) => {
    return name
      .trim()
      .replace(/\.webp$/i, "")
      .replace(
        /[<>:"/\\|?*\x00-\x1F]/g,
        "",
      )
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

    if (!file) {
      return;
    }

    setError(null);

    cleanupOldResult();
    cleanupOldPreview();

    const preview =
      URL.createObjectURL(file);

    setPreviewUrl(preview);

    try {
      const imageBitmap =
        await createImageBitmap(file);

      const canvas =
        document.createElement("canvas");

      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) {
        throw new Error(
          "Canvas konnte nicht erstellt werden.",
        );
      }

      ctx.fillStyle = "#ffffff";

      ctx.fillRect(
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT,
      );

      setOriginalSize([
        imageBitmap.width,
        imageBitmap.height,
      ]);

      const scale = Math.max(
        TARGET_WIDTH / imageBitmap.width,
        TARGET_HEIGHT / imageBitmap.height,
      );

      const drawWidth =
        imageBitmap.width * scale;

      const drawHeight =
        imageBitmap.height * scale;

      const offsetX =
        (TARGET_WIDTH - drawWidth) / 2;

      const offsetY =
        (TARGET_HEIGHT - drawHeight) / 2;

      ctx.drawImage(
        imageBitmap,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
      );

      const blob = await new Promise(
        (resolve) => {
          canvas.toBlob(
            resolve,
            "image/webp",
            0.9,
          );
        },
      );

      if (!blob) {
        throw new Error(
          "WebP-Konvertierung fehlgeschlagen.",
        );
      }

      const url =
        URL.createObjectURL(blob);

      setResult({
        url,
        sizeKB: Math.round(
          blob.size / 1024,
        ),
      });

      if (imageBitmap.close) {
        imageBitmap.close();
      }
    } catch {
      setResult(null);

      setError(
        "Fehler beim Konvertieren.",
      );
    }

    event.target.value = "";
  };

  const downloadName = `${sanitizeFileName(
    fileName,
  )}.webp`;

  return (
    <>
      <Head>
        <title>
          Bildconverter | WE G(A)T NEWS
        </title>

        <meta
          name="description"
          content="Bilder für WE G(A)T NEWS ins richtige Format bringen"
        />
      </Head>

      <section className="converter-page">
        <header className="converter-page-header">
          <div
            className="converter-page-icon"
            aria-hidden="true"
          >
            <FiImage />
          </div>

          <div>
            <h1>Bildconverter</h1>

            <p>
              Bilder automatisch auf{" "}
              {TARGET_WIDTH} × {TARGET_HEIGHT} px
              zuschneiden und als WebP speichern.
            </p>
          </div>
        </header>

        <div className="converter-card">
          <div className="converter-notice">
            <FiInfo aria-hidden="true" />

            <p>
              Bild auswählen, Artikelnummer
              eingeben und herunterladen. Die
              Bildquelle für den Editor nicht
              vergessen.
            </p>
          </div>

          <div className="converter-source-links">
            <span>
              Websites zur Bildsuche:
            </span>

            <a
              href="https://unsplash.com/de"
              target="_blank"
              rel="noopener noreferrer"
            >
              Unsplash 
              <FiExternalLink
                aria-hidden="true"
              />
            </a>

            <a
              href="https://www.pexels.com/de-de/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pexels
              <FiExternalLink
                aria-hidden="true"
              />
            </a>

            <a
              href="https://pixabay.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pixabay
              <FiExternalLink
                aria-hidden="true"
              />
            </a>
          </div>

          <div className="converter-field">
            <label
              htmlFor="converter-file-name"
              className="converter-label"
            >
              Artikelnummer
            </label>

            <input
              id="converter-file-name"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={fileName}
              onChange={(event) =>
                setFileName(
                  event.target.value,
                )
              }
              placeholder="z. B. 44"
              className={`converter-input ${
                fileName.trim() &&
                !fileNameValid
                  ? "converter-input-error"
                  : ""
              }`.trim()}
            />
          </div>

          {fileName.trim() &&
          !fileNameValid ? (
            <div className="converter-message converter-message-error">
              <FiAlertCircle
                aria-hidden="true"
              />

              <span>
                Die Artikelnummer darf nur Zahlen
                enthalten.
              </span>
            </div>
          ) : null}

          <div className="converter-actions">
            <label className="converter-upload-button">
              <FiUploadCloud
                aria-hidden="true"
              />

              <span>Bild auswählen</span>

              <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="converter-hidden-input"
              />
            </label>

            <a
              href={
                canDownload
                  ? result.url
                  : "#"
              }
              download={
                canDownload
                  ? downloadName
                  : undefined
              }
              onClick={(event) => {
                if (!canDownload) {
                  event.preventDefault();
                }
              }}
              aria-disabled={!canDownload}
              className={`converter-download-button ${
                canDownload
                  ? ""
                  : "is-disabled"
              }`.trim()}
            >
              <FiDownload
                aria-hidden="true"
              />

              Herunterladen
            </a>
          </div>

          {error ? (
            <div className="converter-message converter-message-error">
              <FiAlertCircle
                aria-hidden="true"
              />

              <span>{error}</span>
            </div>
          ) : null}

          {previewUrl || result ? (
            <div className="converter-preview-grid">
              {previewUrl ? (
                <article className="converter-preview-card">
                  <div className="converter-preview-heading">
                    <FiImage
                      aria-hidden="true"
                    />

                    <h2>Original</h2>
                  </div>

                  <Image
                    src={previewUrl}
                    className="converter-image"
                    alt="Originalbild"
                    width={originalSize[0]}
                    height={originalSize[1]}
                  />

                  <p className="converter-image-meta">
                    {originalSize[0]} ×{" "}
                    {originalSize[1]} px
                  </p>
                </article>
              ) : null}

              {result ? (
                <article className="converter-preview-card">
                  <div className="converter-preview-heading converter-preview-success">
                    <FiCheckCircle
                      aria-hidden="true"
                    />

                    <h2>Konvertiert</h2>
                  </div>

                  <Image
                    src={result.url}
                    className="converter-image"
                    alt="Konvertiertes Bild"
                    width={TARGET_WIDTH}
                    height={TARGET_HEIGHT}
                  />

                  <p className="converter-image-meta">
                    {TARGET_WIDTH} ×{" "}
                    {TARGET_HEIGHT} px ·{" "}
                    {result.sizeKB} KB
                  </p>
                </article>
              ) : null}
            </div>
          ) : (
            <div className="converter-empty-state">
              <FiImage aria-hidden="true" />

              <p>
                Noch kein Bild ausgewählt.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}