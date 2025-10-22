import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiRefreshCcw } from "react-icons/fi";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import SectionTitle from "../../components/sectionTitle/SectionTitle";
import { Pagination } from "../../components/pagination/Pagination";
import { ProductCard } from "../../components/productCard/ProductCard";

// Keep the same categories used across the app
const CATEGORY_OPTIONS = [
  { value: "", label: "সব ক্যাটাগরি" },
  { value: "rice", label: "চাল" },
  { value: "oil", label: "তেল" },
  { value: "spice", label: "মশলা" },
  { value: "honey", label: "মধু" },
  { value: "sugar", label: "চিনি" },
  { value: "dal", label: "ডাল" },
  { value: "tea", label: "চা পাতা" },
  { value: "snacks", label: "স্ন্যাকস/অন্যান্য" },
  { value: "pantry", label: "প্যান্ট্রি" },
];

// Small card component for products

const AllProducts = () => {
  const axiosPublic = useAxiosPublic();

  // live (unapplied) filters
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest", // newest | asc | des
  });

  // applied params for actual query
  const [applied, setApplied] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    page: 1,
    limit: 12,
  });

  const [pageSize, setPageSize] = useState(12);

  const params = useMemo(() => {
    const p = {
      page: applied.page,
      limit: applied.limit,
      sort: applied.sort,
    };
    if (applied.search) p.search = applied.search;
    if (applied.category) p.category = applied.category;
    if (applied.minPrice !== "") p.minPrice = applied.minPrice;
    if (applied.maxPrice !== "") p.maxPrice = applied.maxPrice;
    return p;
  }, [applied]);

  const { data, isLoading } = useQuery({
    queryKey: ["public-products", params],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/products", { params });
      // expects { total, page, limit, pages, items }
      return data;
    },
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const page = data?.page || 1;
  const pages = data?.pages || 1;

  const applyFilters = () =>
    setApplied({ ...filters, page: 1, limit: pageSize });

  const resetFilters = () => {
    const reset = {
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    };
    setFilters(reset);
    setPageSize(12);
    setApplied({ ...reset, page: 1, limit: 12 });
  };

  const onEnterApply = (e) => {
    if (e.key === "Enter") applyFilters();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SectionTitle heading="পণ্যসমূহ" />

      {/* Filters */}
      <div className="bg-white border border-green-200 rounded-2xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* search */}
          <div className="md:col-span-5">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                onKeyDown={onEnterApply}
                className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 outline-none focus:border-green-600"
                placeholder="পণ্য/টাইপ/ব্র্যান্ড খুঁজুন"
              />
            </div>
          </div>

          {/* category */}
          <div className="md:col-span-3">
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* min/max */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minPrice: e.target.value }))
                }
                onKeyDown={onEnterApply}
                placeholder="Min ৳"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxPrice: e.target.value }))
                }
                onKeyDown={onEnterApply}
                placeholder="Max ৳"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
              />
            </div>
          </div>

          {/* sort */}
          <div className="md:col-span-2">
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters((f) => ({ ...f, sort: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
            >
              <option value="newest">নতুন আগে</option>
              <option value="asc">দাম কম → বেশি</option>
              <option value="des">দাম বেশি → কম</option>
            </select>
          </div>

          {/* actions */}
          <div className="md:col-span-12 flex gap-2 justify-end">
            <button
              onClick={applyFilters}
              type="button"
              className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-5 py-2"
            >
              ফিল্টার প্রয়োগ
            </button>
            <button
              onClick={resetFilters}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-green-300 px-4 py-2 hover:bg-green-50"
            >
              <FiRefreshCcw />
              রিসেট
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-64 rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          কোনো পণ্য পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-6">
          <Pagination
            page={page}
            pages={pages}
            total={total}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setApplied((a) => ({ ...a, page: 1, limit: size }));
            }}
            onPageChange={(p) => setApplied((a) => ({ ...a, page: p }))}
          />
        </div>
      )}
    </div>
  );
};

export default AllProducts;
