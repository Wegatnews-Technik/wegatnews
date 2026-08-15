import "../styles/globals.css";
import "../styles/search.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/post.css";
import "../styles/tools.css";
import "../styles/editor.css";
import "../styles/converter.css";

import "ckeditor5/ckeditor5.css";
import SiteLayout from "../components/layout/SiteLayout";

export default function App({ Component, pageProps }) {
  return (
    <SiteLayout posts={pageProps}>
      <Component {...pageProps} />
    </SiteLayout>
  );
}
