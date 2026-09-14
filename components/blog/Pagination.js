import { useRouter } from "next/router";
import ReactPaginate from "react-paginate";

function getPageHref(basePath, page) {
  const cleanBasePath =
    basePath === "/" ? "" : basePath.replace(/\/$/, "");

  if (page === 1) {
    return cleanBasePath || "/";
  }

  return `${cleanBasePath}/seite/${page}`;
}

export default function Pagination({
  currentPage,
  pageCount,
  basePath = "/",
}) {
  const router = useRouter();

  function handlePageChange({ selected }) {
    const page = selected + 1;
    router.push(getPageHref(basePath, page));
  }

  return (
    <ReactPaginate
      pageCount={pageCount}
      forcePage={currentPage - 1}
      onPageChange={handlePageChange}
      hrefBuilder={(page) => getPageHref(basePath, page)}
      previousLabel="Zurück"
      nextLabel="Weiter"
      previousAriaLabel="Zur vorherigen Seite"
      nextAriaLabel="Zur nächsten Seite"
      breakLabel="…"
      breakAriaLabels={{
        forward: "Weitere Seiten",
        backward: "Vorherige Seiten",
      }}
      marginPagesDisplayed={1}
      pageRangeDisplayed={1}
      ariaLabelBuilder={(page, selected) =>
        selected ? `Seite ${page}, aktuelle Seite` : `Zu Seite ${page}`
      }
      containerClassName="pagination"
      pageClassName="pagination__item"
      pageLinkClassName="pagination__link"
      previousClassName="pagination__item pagination__previous"
      nextClassName="pagination__item pagination__next"
      previousLinkClassName="pagination__link"
      nextLinkClassName="pagination__link"
      activeClassName="pagination__item--active"
      disabledClassName="pagination__item--disabled"
      breakClassName="pagination__item pagination__break"
      breakLinkClassName="pagination__link"
      renderOnZeroPageCount={null}
    />
  );
}