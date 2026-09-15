import { getPostsByTag } from "../../lib/posts";
import { getPageData } from "../../lib/pagination";
import { CATEGORIES } from "../../lib/categories";
import CategoryPage from "../../components/blog/CategoryPage";

const category = CATEGORIES.meinung;

export function getStaticProps() {
  return {
    props: getPageData(getPostsByTag(category.tag), 1),
  };
}

export default function MeinungIndex(props) {
  return (
    <CategoryPage
      {...props}
      {...category}
      basePath="/meinung"
    />
  );
}