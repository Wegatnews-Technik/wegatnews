import { getPostsByTag } from "../../lib/posts";
import { getPageData } from "../../lib/pagination";
import { CATEGORIES } from "../../lib/categories";
import CategoryPage from "../../components/blog/CategoryPage";

const category = CATEGORIES.buchrezension;

export function getStaticProps() {
  return {
    props: getPageData(getPostsByTag(category.tag), 1),
  };
}

export default function BuchrezensionIndex(props) {
  return (
    <CategoryPage
      {...props}
      {...category}
      basePath="/buchrezension"
    />
  );
}