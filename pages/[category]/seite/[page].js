import { getPostsByTag } from "../../../lib/posts";
import {
  getPageData,
  getPagePaths,
} from "../../../lib/pagination";
import { CATEGORIES } from "../../../lib/categories";
import CategoryPage from "../../../components/blog/CategoryPage";

export function getStaticPaths() {
  const paths = Object.entries(CATEGORIES).flatMap(
    ([categorySlug, category]) => {
      const posts = getPostsByTag(category.tag);

      return getPagePaths(posts).map(({ params }) => ({
        params: {
          category: categorySlug,
          page: params.page,
        },
      }));
    },
  );

  return {
    paths,
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const category = CATEGORIES[params.category];

  if (!category) {
    return {
      notFound: true,
    };
  }

  const pageData = getPageData(
    getPostsByTag(category.tag),
    params.page,
  );

  if (!pageData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...pageData,
      ...category,
      basePath: `/${params.category}`,
    },
  };
}

export default function PaginatedCategoryPage(props) {
  return <CategoryPage {...props} />;
}