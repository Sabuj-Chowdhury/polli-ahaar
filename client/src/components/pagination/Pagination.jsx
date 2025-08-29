import { useMemo } from "react";
import {
  MdFirstPage,
  MdLastPage,
  MdNavigateBefore,
  MdNavigateNext,
} from "react-icons/md";

export const Pagination = ({
  page,
  pages,
  total,
  onPageChange,
  pageSize,
  onPageSizeChange,
}) => {
  // build page numbers with ellipses
  const numbers = useMemo(() => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const arr = [1];
    const left = Math.max(2, page - 1);
    const right = Math.min(pages - 1, page + 1);
    if (left > 2) arr.push("…");
    for (let p = left; p <= right; p++) arr.push(p);
    if (right < pages - 1) arr.push("…");
    arr.push(pages);
    return arr;
  }, [page, pages]);

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="text-sm text-gray-600">
        মোট <span className="font-medium">{total}</span> টি পণ্য
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="inline-flex items-center gap-1 rounded-xl border border-green-300 px-3 py-2 disabled:opacity-50"
          aria-label="First page"
          title="First page"
        >
          <MdFirstPage size={18} />
          <span className="sr-only">First</span>
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="inline-flex items-center gap-1 rounded-xl border border-green-300 px-3 py-2 disabled:opacity-50"
          aria-label="Previous page"
          title="Previous"
        >
          <MdNavigateBefore size={18} />
          <span className="sr-only">Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {numbers.map((n, idx) =>
            n === "…" ? (
              <span key={`dots-${idx}`} className="px-2 text-gray-500">
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => onPageChange(n)}
                className={`min-w-[40px] rounded-xl px-3 py-2 text-sm ${
                  n === page
                    ? "bg-green-600 text-white"
                    : "border border-green-300 hover:bg-green-50"
                }`}
              >
                {n}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          disabled={page === pages}
          className="inline-flex items-center gap-1 rounded-xl border border-green-300 px-3 py-2 disabled:opacity-50"
          aria-label="Next page"
          title="Next"
        >
          <MdNavigateNext size={18} />
          <span className="sr-only">Next</span>
        </button>
        <button
          onClick={() => onPageChange(pages)}
          disabled={page === pages}
          className="inline-flex items-center gap-1 rounded-xl border border-green-300 px-3 py-2 disabled:opacity-50"
          aria-label="Last page"
          title="Last page"
        >
          <MdLastPage size={18} />
          <span className="sr-only">Last</span>
        </button>

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="ml-2 rounded-xl border border-green-300 px-3 py-2"
          title="Items per page"
        >
          {[10, 20, 30, 50].map((n) => (
            <option key={n} value={n}>
              প্রতি পেজে {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
