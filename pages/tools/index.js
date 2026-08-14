import Link from "next/link";
import ToolsLayout from "../../components/layout/ToolsLayout";

export default function ToolsIndexPage() {
  return (
    <section className="archiv">
      <p>Textbearbeitung:</p>
      <Link href="/tools/editor">Texteditor</Link>
      <p>Bildbearbeitung:</p>
      <Link href="/tools/converter">Bildconverter</Link>
      <p>Statistiken:</p >
      <a href="https://cloud.umami.is/share/j2rKzIhE8t490C1z" target="_blank" rel="noopener noreferrer">
        Statistiken
      </a>
    </section>
  );
}

ToolsIndexPage.getLayout = function getLayout(page) {
  return (
    <ToolsLayout
      title="Redaktions-Tools"
      description="Werkzeuge für die Redaktion"
    >
      {page}
    </ToolsLayout>
  );
};