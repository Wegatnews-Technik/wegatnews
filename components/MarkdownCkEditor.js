import { CKEditor } from "@ckeditor/ckeditor5-react";

import {
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Markdown,
  Paragraph,
  PasteFromOffice,
} from "ckeditor5";

const editorConfig = {
  licenseKey: "GPL",

  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Link,
    List,
    BlockQuote,
    Code,
    CodeBlock,
    Autoformat,
    Markdown,
    PasteFromOffice,
  ],

  toolbar: {
    items: [
      "undo",
      "redo",
      "|",
      "heading",
      "|",
      "bold",
      "italic",
      "code",
      "|",
      "link",
      "blockQuote",
      "|",
      "bulletedList",
      "numberedList",
    ],
    shouldNotGroupWhenFull: true,
  },

  heading: {
    options: [
      {
        model: "paragraph",
        title: "Absatz",
        class: "ck-heading_paragraph",
      },
      {
        model: "heading2",
        view: "h2",
        title: "Überschrift 2",
        class: "ck-heading_heading2",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Überschrift 3",
        class: "ck-heading_heading3",
      },
    ],
  },

  link: {
    defaultProtocol: "https://",
    decorators: {
      openInNewTab: {
        mode: "manual",
        label: "In neuem Tab öffnen",
        attributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      },
    },
  },

  placeholder: "Artikeltext aus Word hier einfügen ...",
};

export default function MarkdownCkEditor({ value, onChange }) {
  return (
    <div className="editor-ckeditor">
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={value || ""}
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}