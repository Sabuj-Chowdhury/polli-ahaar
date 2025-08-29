import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../../components/spinner/LoadingSpinner";
import { Pagination } from "../../../components/pagination/Pagination";
import SectionTitle from "../../../components/sectionTitle/SectionTitle";
import ProductTable from "./ProductTable";
import EditProductModal from "../../../components/modal/EditProductModal";

// ---- Filter options ----
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

const ORIGIN_OPTIONS = [
  "",
  "দিনাজপুর",
  "নাটোর",
  "রাজবাড়ী",
  "চুয়াডাঙ্গা",
  "ফটিকছড়ি",
  "সুন্দরবন",
  "লোকাল বাজার",
  "রাজশাহী",
  "চট্টগ্রাম",
];

const UNIT_OPTIONS = ["", "গ্রাম", "কেজি", "লিটার", "পিস", "বস্তা"];

const ManageProducts = () => {
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();

  // Live filters
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    origin: "",
    unit: "",
    status: "",
    featured: "",
    sort: "newest",
    minPrice: "",
    maxPrice: "",
  });

  // Applied params (for query)
  const [applied, setApplied] = useState({
    ...filters,
    page: 1,
    limit: 10,
  });

  const [pageSize, setPageSize] = useState(10);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openEdit = (product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };
  const closeEdit = () => {
    setIsEditOpen(false);
    setSelectedProduct(null);
  };

  // Build params for query
  const params = useMemo(() => {
    const p = {
      page: applied.page,
      limit: applied.limit,
      sort: applied.sort,
    };
    if (applied.search) p.search = applied.search;
    if (applied.category) p.category = applied.category;
    if (applied.origin) p.origin = applied.origin;
    if (applied.unit) p.unit = applied.unit;
    if (applied.status) p.status = applied.status;
    if (applied.featured) p.featured = applied.featured;
    if (applied.minPrice !== "") p.minPrice = applied.minPrice;
    if (applied.maxPrice !== "") p.maxPrice = applied.maxPrice;
    return p;
  }, [applied]);

  // Query products
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products-admin", params],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/products", { params });
      return data; // { total, page, limit, pages, items }
    },
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const page = data?.page || 1;
  const pages = data?.pages || 1;

  const handleApply = () => {
    setApplied({
      ...filters,
      page: 1,
      limit: pageSize,
    });
  };

  const handleReset = () => {
    const reset = {
      search: "",
      category: "",
      origin: "",
      unit: "",
      status: "",
      featured: "",
      sort: "newest",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(reset);
    setPageSize(10);
    setApplied({ ...reset, page: 1, limit: 10 });
  };

  const onEnterApply = (e) => {
    if (e.key === "Enter") handleApply();
  };

  // DELETE (with SweetAlert2)
  const handleDelete = async (id) => {
    await axiosSecure.delete(`/product/${id}`);
    await refetch();
  };

  const handleCustomDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(id)
          .then(() => {
            Swal.fire({
              title: "Deleted!",
              text: "Product has been deleted.",
              icon: "success",
            });
          })
          .catch(() => {
            Swal.fire({
              title: "Failed!",
              text: "Delete failed. Try again.",
              icon: "error",
            });
          });
      }
    });
  };

  // Helpers for table
  const computeMinPrice = (p) =>
    typeof p.minPrice === "number"
      ? p.minPrice
      : Math.min(
          ...(p?.variants || []).map((v) => Number(v.price) || Infinity)
        );

  const totalStock = (p) =>
    (p?.variants || []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <SectionTitle heading="পণ্য ম্যানেজ করুন" />

      {/* Filters */}
      <div className="bg-white border border-green-200 shadow-sm rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-3">
            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
              onKeyDown={onEnterApply}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
              placeholder="পণ্য/টাইপ/ব্র্যান্ড/উৎস খুঁজুন…"
            />
          </div>

          {/* Category */}
          <div className="md:col-span-2">
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

          {/* Origin */}
          <div className="md:col-span-2">
            <select
              value={filters.origin}
              onChange={(e) =>
                setFilters((f) => ({ ...f, origin: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
            >
              {ORIGIN_OPTIONS.map((o) => (
                <option key={o || "all"} value={o}>
                  {o || "সব জেলা"}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div className="md:col-span-2">
            <select
              value={filters.unit}
              onChange={(e) =>
                setFilters((f) => ({ ...f, unit: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u || "all"} value={u}>
                  {u || "সব ইউনিট"}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="md:col-span-1">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
            >
              <option value="">স্ট্যাটাস</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Featured */}
          <div className="md:col-span-2">
            <select
              value={filters.featured}
              onChange={(e) =>
                setFilters((f) => ({ ...f, featured: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
            >
              <option value="">ফিচার্ড?</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>

          {/* Min/Max Price */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minPrice: e.target.value }))
                }
                onKeyDown={onEnterApply}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
                placeholder="Min ৳"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxPrice: e.target.value }))
                }
                onKeyDown={onEnterApply}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
                placeholder="Max ৳"
              />
            </div>
          </div>

          {/* Sort */}
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

          {/* Apply / Reset */}
          <div className="md:col-span-3 flex gap-2">
            <button
              onClick={handleApply}
              type="button"
              className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-2"
            >
              ফিল্টার প্রয়োগ
            </button>
            <button
              onClick={handleReset}
              type="button"
              className="rounded-xl border border-green-300 px-4 py-2 hover:bg-green-50"
            >
              রিসেট
            </button>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <ProductTable
        items={items}
        page={page}
        limit={applied.limit}
        computeMinPrice={computeMinPrice}
        totalStock={totalStock}
        onEdit={openEdit} // 👈 open modal with selected product
        onDelete={handleCustomDelete} // 👈 sweetalert2 delete flow
      />

      {/* Pagination */}
      {pages > 1 && (
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
      )}

      {/* Edit Modal (render once at page root) */}
      <EditProductModal
        product={selectedProduct}
        isOpen={isEditOpen}
        onClose={closeEdit}
        refetch={refetch}
      />
    </div>
  );
};

export default ManageProducts;
