import { getPostsByTag } from "../../lib/posts";
import { getPageData, getPagePaths } from "../../lib/pagination";
import { CATEGORIES } from "../../lib/categories";
import CategoryPage from "../../components/blog/CategoryPage";

export function getStaticPaths() {
  const paths = Object.entries(CATEGORIES).map(category => {
    return {
      params: {
        category: category[0],
      }
    };
  });

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

  const pageData = getPageData(getPostsByTag(category.tag), 1);
  return {
    props: {
      ...pageData,
      category,
      basePath: `/${params.category}`,
    },
  };
}

export default function CategoryIndex({ posts, currentPage, pageCount, category, basePath }) {
  return (
    <CategoryPage
      posts={posts}
      currentPage={currentPage}
      pageCount={pageCount}
      title={category.title}
      description={category.description}
      basePath={basePath}
    />
  );
}
