# WE G(A)T NEWS

Statische Website der digitalen Schülerzeitung am Gymnasium zum Altenforst in Troisdorf.

- Live-Seite: [wegatnews.de](https://wegatnews.de)
- Artikel: Markdown-Dateien im Repository
- Hosting und Deployments: Netlify
- Artikel-Workflow: GitHub Actions und Pull Requests

## Überblick

WE G(A)T NEWS ist bewusst ohne klassisches CMS aufgebaut. Artikel, Bilder und Quellcode liegen gemeinsam im GitHub-Repository. Next.js erzeugt daraus eine vollständig statische Website, die Netlify veröffentlicht.

Die Redaktion kann neue Beiträge mit den Browser-Werkzeugen unter `/tools` vorbereiten. Ein GitHub-Workflow übernimmt die Dateien anschließend in einen eigenen Branch, prüft den Produktions-Build und erstellt einen Pull Request mit Deploy Preview.

## Aktueller technischer Stand

Stand: 7. August 2026

| Komponente | Version oder Technik |
| --- | --- |
| Node.js | 24.x |
| Next.js | 16.2.12, Pages Router |
| React / React DOM | 19.2.7 |
| ESLint | 9.39.x |
| Playwright | 1.61.x, End-to-End-Tests in Chromium, Firefox und WebKit |
| `eslint-config-next` | 16.2.12 |
| Ausgabe | statischer Export nach `out/` |
| Inhalte | Markdown mit YAML-Frontmatter |
| Styling | globale CSS-Dateien |

Das Projekt verwendet den React Compiler und den statischen Export über `output: "export"`. Die Node-Version ist in `.nvmrc` und zusätzlich über `engines.node` in `package.json` festgelegt.

## Voraussetzungen

- Node.js 24
- npm
- Git, wenn Änderungen committed und veröffentlicht werden sollen
- Für Browser-Tests: die Playwright-Browser (einmalig lokal installieren)

Die installierte Version lässt sich so prüfen:

```bash
node --version
npm --version
```

`node --version` sollte `v24.x.x` ausgeben.

## Lokale Entwicklung

Repository klonen oder herunterladen, Terminal im Projektordner öffnen und die Abhängigkeiten exakt nach Lockfile installieren:

```bash
npm ci
```

Entwicklungsserver starten:

```bash
npm run dev
```

Die Seite ist danach unter [http://localhost:3000](http://localhost:3000) erreichbar. Der Server wird mit `Ctrl+C` beendet.

Vor einem Commit oder Pull Request sollten mindestens Linting, Tests und Produktions-Build ausgeführt werden. Für die Playwright-Tests muss der Entwicklungsserver lokal bereits laufen; Details stehen im Abschnitt [Browser-Tests mit Playwright](#browser-tests-mit-playwright).

```bash
npm run test
npm run lint
npm run build
```

`npm run test` wird dabei in einem zweiten Terminal ausgeführt, während `npm run dev` weiterläuft. Der fertige statische Export liegt anschließend in `out/`.

> `npm run start` ist für dieses Projekt nicht der normale Vorschauweg, da `next.config.mjs` einen statischen Export konfiguriert. Für die Entwicklung wird `npm run dev` verwendet; Netlify zeigt den Produktionsstand als Deploy Preview.

## npm-Skripte

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Startet den lokalen Next.js-Entwicklungsserver |
| `npm run lint` | Prüft den Quellcode mit ESLint |
| `npm run test` | Führt die Playwright-Browser-Tests aus; lokal muss vorher `npm run dev` laufen |
| `npm run build` | Erzeugt RSS, baut die Website und erzeugt Sitemap sowie `robots.txt` |
| `npm run generate-rss` | Erzeugt ausschließlich `public/feed.xml` |
| `npm run prebuild` | Wird vor `build` automatisch ausgeführt und erzeugt den RSS-Feed |
| `npm run postbuild` | Wird nach `build` automatisch ausgeführt und startet `next-sitemap` |

## Browser-Tests mit Playwright

Das Projekt verwendet [Playwright](https://playwright.dev/) für End-to-End-Tests. Dabei wird die Website wie in einem echten Browser geöffnet und geprüft. Die Testdateien liegen unter `tests/`; die zentrale Konfiguration befindet sich in `playwright.config.ts`.

### Einmalige Einrichtung

Nach `npm ci` müssen auf einem neuen Rechner zusätzlich die Browser installiert werden, die Playwright für die Tests verwendet:

```bash
npx playwright install
```

Unter Linux beziehungsweise in CI kann Playwright zusätzlich benötigte Systempakete mitinstallieren:

```bash
npx playwright install --with-deps
```

Die Browser-Installation ist normalerweise nur einmal nötig. Sie muss nicht vor jedem Testlauf erneut ausgeführt werden.

### Tests lokal ausführen

Die vorhandenen Tests rufen `http://localhost:3000/` auf. Der Next.js-Entwicklungsserver wird von der aktuellen Playwright-Konfiguration **nicht automatisch gestartet**. Deshalb werden lokal zwei Terminals benötigt.

**Terminal 1 – Entwicklungsserver starten:**

```bash
npm run dev
```

Sobald Next.js meldet, dass die Seite unter `http://localhost:3000` erreichbar ist, bleibt dieses Terminal geöffnet.

**Terminal 2 – Tests starten:**

```bash
npm run test
```

Nach dem Testlauf kann der Entwicklungsserver in Terminal 1 mit `Ctrl+C` beendet werden.

> Wichtig: Das npm-Skript heißt aktuell `test` (Singular). Der richtige Befehl ist deshalb `npm run test` beziehungsweise kurz `npm test`, nicht `npm run tests`.

### Was wird getestet?

`tests/IndexTest.spec.ts` enthält aktuell zwei aktive Testfälle:

1. **Seitentitel:** Die Startseite wird geöffnet und der erwartete Titel der Schülerzeitung geprüft.
2. **Navbar-Links:** Die Navigation zu „Informativ“, „Meinung“, „Umfragen“, „Buchrezensionen“ und „Mach mit“ wird durchgeklickt; auf jeder Zielseite wird eine passende Überschrift erwartet.

Playwright führt diese beiden Testfälle standardmäßig in drei Browser-Projekten aus: **Chromium, Firefox und WebKit**. Deshalb zeigt die Ausgabe derzeit insgesamt **6 Tests** an: 2 Testfälle × 3 Browser.

### Fehler: `ERR_CONNECTION_REFUSED` / `Could not connect to server`

Wenn ein Test bereits bei `page.goto('http://localhost:3000/')` mit einer Meldung wie

```text
ERR_CONNECTION_REFUSED
Could not connect to server
```

abbricht, läuft in der Regel kein Server auf Port 3000. Dann zuerst in einem Terminal `npm run dev` starten und anschließend in einem zweiten Terminal erneut `npm run test` ausführen.

Falls `npm run dev` selbst einen anderen Port verwendet, muss entweder Port 3000 wieder freigemacht oder die Test-URL entsprechend angepasst werden.

### Playwright-Report

Nach einem Testlauf verwendet Playwright den HTML-Reporter. Bei fehlgeschlagenen Tests kann dadurch ein lokaler Report angeboten werden, häufig unter `http://localhost:9323`. Er enthält Details zu den einzelnen Browsern, Fehlern und Testschritten.

In GitHub Actions läuft der Ablauf etwas anders: Der Workflow baut zuerst die statische Website, startet anschließend einen Server für `out/` und führt danach die Playwright-Tests aus. Lokal bleibt vorerst der oben beschriebene manuelle Start mit `npm run dev` vorgesehen.

## Projektstruktur

```text
.
├── .github/workflows/          # GitHub Actions für Preview und Veröffentlichung
├── components/                 # Wiederverwendbare React-Komponenten
│   ├── blog/                   # Karten, Raster und Archiv
│   ├── layout/                 # Website- und Tools-Layout
│   └── seo/                    # Metadaten für Artikelseiten
├── lib/posts.js                # Laden, Sortieren und Rendern der Artikel
├── neuer-post/                 # Zwischenablage für genau einen neuen Artikel
├── pages/                      # Next.js Pages Router
│   ├── blog/[slug].js          # Statisch erzeugte Artikelseiten
│   └── tools/                  # Editor und Bildkonverter
├── posts/                      # Veröffentlichte Artikel als Markdown
├── public/
│   ├── article-images/         # Artikelbilder im WebP-Format
│   └── basic-images/           # Logo, Favicon und allgemeine Bilder
├── scripts/generate-rss.js     # Erzeugt den RSS-Feed
├── tests/                      # Playwright-End-to-End-Tests
├── playwright.config.ts        # Browser- und Test-Konfiguration für Playwright
├── styles/                     # Globale Stylesheets
├── eslint.config.mjs           # ESLint-Konfiguration
├── next.config.mjs             # Next.js- und Export-Konfiguration
├── next-sitemap.config.js      # Sitemap und robots.txt
├── package.json                # Skripte und Abhängigkeiten
├── package-lock.json           # Exakt aufgelöste npm-Abhängigkeiten
└── README.md                   # Diese Dokumentation
```

## Artikel-System

Ein veröffentlichter Artikel besteht aus zwei Dateien mit derselben freien Artikelnummer:

```text
posts/42.md
public/article-images/42.webp
```

Die Zahl im Dateinamen, `articleNumber` im Frontmatter und Bildpfad müssen zusammenpassen.

### Frontmatter

Jede Markdown-Datei beginnt mit YAML-Frontmatter:

```markdown
---
title: "Beispielartikel"
articleNumber: "42"
slug: "beispielartikel"
date: "2026-07-15"
author: "Name, 10. Klasse"
image: "/article-images/42.webp"
image_source: "Eigene Aufnahme"
preview: "Kurzer Vorschautext für die Startseite."
tags: ["Informativ"]
---

Hier beginnt der Artikeltext.
```

Wichtige Regeln:

- `title` darf im Editor höchstens 70 Zeichen lang sein.
- `articleNumber` enthält nur Ziffern und darf noch nicht vergeben sein.
- `slug` bestimmt dauerhaft die Artikel-URL und sollte nach Veröffentlichung nicht mehr geändert werden.
- `date` verwendet das Format `YYYY-MM-DD`.
- `image` verweist auf das zur Artikelnummer passende WebP-Bild.
- `image_source` dokumentiert die rechtlich korrekte Bildquelle. Das Feld ist redaktionell verpflichtend, auch wenn der Editor es derzeit nicht technisch erzwingt.
- `preview` darf im Editor höchstens 120 Zeichen lang sein.
- Gültige Kategorie-Tags sind `Informativ`, `Meinung`, `Umfrage` und `Buchrezension`. Ohne Kategorie wird `tags: []` verwendet.

### Laden und Rendern

`lib/posts.js` erledigt die Content-Verarbeitung:

1. Alle `.md`-Dateien aus `posts/` werden gelesen.
2. `gray-matter` trennt Frontmatter und Artikelinhalt.
3. Ein vorhandener Slug wird verwendet; sonst wird er aus dem Titel erzeugt.
4. Die Übersicht wird absteigend nach Datum sortiert.
5. `remark` und `remark-html` wandeln den Markdown-Inhalt der Artikelseiten in HTML um.
6. `getStaticPaths` und `getStaticProps` erzeugen jede Artikel-URL beim Build statisch.

Eine typische URL lautet:

```text
https://wegatnews.de/blog/beispielartikel/
```

## Redaktions-Tools

Die Werkzeuge sind unter [wegatnews.de/tools](https://wegatnews.de/tools) öffentlich erreichbar. Sie arbeiten vollständig im Browser und speichern keine Artikel auf einem Server.

### Editor

Der Editor unter `/tools/editor`:

- bereinigt eingefügten Text,
- erzeugt den Slug automatisch,
- prüft Titel, Artikelnummer, Vorschau, Autor und Text,
- erzeugt YAML-Frontmatter und Markdown,
- lädt die Datei als `NUMMER.md` herunter.

Formatierungen aus Word oder anderen Editoren sollten nach dem Einfügen immer kontrolliert werden.

### Bildkonverter

Der Konverter unter `/tools/converter`:

- akzeptiert ein Bildformat des Browsers,
- schneidet das Bild mittig auf das Seitenverhältnis 3:2 zu,
- erzeugt 1200 × 800 Pixel,
- exportiert WebP mit Qualitätsstufe 0,9,
- lädt die Datei als `NUMMER.webp` herunter.

Die Bildquelle muss separat notiert und im Editor eingetragen werden.

## Neuen Artikel veröffentlichen

### Ablauf für die Redaktion

1. Eine freie Artikelnummer festlegen.
2. Den Artikel unter `/tools/editor` erstellen und als `NUMMER.md` herunterladen.
3. Das Bild unter `/tools/converter` vorbereiten und als `NUMMER.webp` herunterladen.
4. Prüfen, dass Nummer, Frontmatter und Bildpfad übereinstimmen.
5. Beide Dateien in `neuer-post/` hochladen. Dort sollte nur dieses eine Dateipaar liegen.
6. In GitHub Actions den Workflow **Neuer Post Preview** manuell starten.
7. Den automatisch erstellten Pull Request und den Netlify Deploy Preview prüfen, auch auf einem Smartphone.
8. Den Pull Request über den grünen Merge-Button oder mit dem Kommentar `/publish` veröffentlichen.
9. Nach dem Netlify-Deploy den Artikel auf der Live-Seite kontrollieren.

### Was der Preview-Workflow prüft

`.github/workflows/new-post-preview.yml`:

1. checkt das Repository aus,
2. installiert die in `.nvmrc` festgelegte Node-Version,
3. installiert Abhängigkeiten mit `npm ci`,
4. sucht eine Markdown-Datei und das gleich nummerierte WebP-Bild,
5. bricht ab, wenn Artikel oder Bild bereits veröffentlicht sind,
6. kopiert beide Dateien an ihre endgültigen Orte,
7. führt `npm run build` aus,
8. leert `neuer-post/`,
9. erstellt und pusht `post/NUMMER`,
10. erstellt einen Pull Request gegen `main`.

Der Workflow benötigt das Repository-Secret `POST_BOT_TOKEN` mit den erforderlichen Rechten.

### Veröffentlichung mit `/publish`

`.github/workflows/publish-post-command.yml` reagiert auf einen exakt geschriebenen PR-Kommentar:

```text
/publish
```

Der Kommentar wird nur für Repository-Mitglieder, Collaborators oder Owner akzeptiert. Der Workflow führt einen Squash-Merge durch und löscht anschließend den Artikel-Branch.

## Statischer Build, Sitemap und RSS

`next.config.mjs` setzt `output: "export"` und schreibt die Website nach `out/`. Die Next.js-Bildoptimierung ist deshalb deaktiviert; Artikelbilder werden bereits als WebP vorbereitet.

Beim Produktions-Build entstehen zusätzlich:

- `out/sitemap.xml`
- `out/robots.txt`
- `public/feed.xml`, das beim Export nach `out/feed.xml` übernommen wird

Die Sitemap wird durch `next-sitemap` erzeugt. Der RSS-Feed verwendet die Artikeldaten aus `posts/` und ist öffentlich unter [wegatnews.de/feed.xml](https://wegatnews.de/feed.xml) erreichbar.

Artikelseiten erhalten über `components/seo/PostHead.js` einen eigenen Seitentitel, eine Beschreibung sowie Open-Graph-Metadaten.

## Hosting und Statistik

Netlify ist mit dem GitHub-Repository verbunden:

- Änderungen auf `main` lösen einen Production Deploy aus.
- Pull Requests erhalten einen Deploy Preview.
- Die Domain `wegatnews.de` zeigt auf die Netlify-Seite.

Umami Cloud zählt Seitenaufrufe über das Script in `components/layout/SiteLayout.js`. Bei Änderungen an Deploy Previews sollte geprüft werden, ob interne Vorschau-Aufrufe in der Statistik erfasst werden.

## Abhängigkeiten aktualisieren

Next.js, React, React DOM und `eslint-config-next` sollten gemeinsam aktualisiert werden. Der zuletzt erfolgreich getestete Stand wurde so installiert:

```bash
npm install next@16.2.12 react@19.2.7 react-dom@19.2.7
npm install --save-dev eslint-config-next@16.2.12 eslint@^9.39.5
```

Danach immer ausführen:

```bash
npm audit --omit=dev
npm run lint
npm run build
```

Wenn Playwright oder seine Browser-Versionen aktualisiert wurden, gegebenenfalls zusätzlich erneut ausführen:

```bash
npx playwright install
```

`package.json` und `package-lock.json` müssen gemeinsam committed werden. `npm audit fix --force` sollte nicht ungeprüft eingesetzt werden.

## Häufige Fehler

### Keine Markdown-Datei gefunden

In `neuer-post/` muss genau eine Datei `NUMMER.md` liegen.

### Passendes Bild fehlt

Zu `42.md` muss `42.webp` vorhanden sein. Abweichende Nummern oder zusätzliche Namensbestandteile werden vom Workflow nicht übernommen.

### Artikel existiert bereits

Wenn `posts/NUMMER.md` oder `public/article-images/NUMMER.webp` existiert, muss eine freie Artikelnummer gewählt werden. Alte Dateien derselben Nummer müssen außerdem aus `neuer-post/` entfernt werden.

### Build schlägt fehl

Zuerst lokal ausführen:

```bash
npm ci
npm run lint
npm run build
```

Typische Ursachen sind ungültiges YAML-Frontmatter, fehlende Pflichtdaten, falsche Dateipfade, nicht passende Artikelnummern oder fehlerhafte Imports.

### Playwright erreicht `localhost:3000` nicht

Fehler wie `ERR_CONNECTION_REFUSED`, `NS_ERROR_CONNECTION_REFUSED` oder `Could not connect to server` bedeuten normalerweise, dass der lokale Entwicklungsserver nicht läuft.

In Terminal 1:

```bash
npm run dev
```

Danach in Terminal 2:

```bash
npm run test
```

### Kategorie-Link führt zu 404

Interne Pfade sind kleingeschrieben. Beispiele:

```text
/informativ
/meinung
/umfragen
/buchrezension
```

## Bekannte offene Punkte

- Vor dem nächsten Artikel-Workflow müssen veraltete oder bereits veröffentlichte Dateien aus `neuer-post/` entfernt werden. Im geprüften Projektstand lag dort noch das bereits veröffentlichte Paar `39.md` und `39.webp`.
- Branch Protection, verpflichtende Reviews und ein verpflichtender erfolgreicher Build für `main` sollten in den Repository-Einstellungen abgesichert werden.

## Kurzfassung für neue Technik-Mitglieder

```text
Markdown + WebP vorbereiten
→ in neuer-post hochladen
→ GitHub-Workflow starten
→ Netlify Preview prüfen
→ Pull Request mergen
→ Live-Seite prüfen
```

Für normale Artikel reicht der Browser. Wer am Quellcode arbeitet, verwendet lokal `npm ci`, `npm run dev`, `npm run test`, `npm run lint` und `npm run build`. Vor dem ersten Playwright-Testlauf auf einem neuen Rechner ist außerdem einmal `npx playwright install` nötig. Für `npm run test` muss `npm run dev` aktuell parallel in einem zweiten Terminal laufen.
