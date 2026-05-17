import "../styles/globals.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/post.css";
import "../styles/tools.css";
import "ckeditor5/ckeditor5.css";
import SiteLayout from "../components/layout/SiteLayout";

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <SiteLayout>
      {getLayout(<Component {...pageProps} />)}
    </SiteLayout>
  );
}