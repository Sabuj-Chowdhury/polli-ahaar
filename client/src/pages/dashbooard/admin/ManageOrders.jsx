// src/pages/dashboard/admin/ManageOrders.jsx
import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { FiExternalLink, FiTrash2, FiRotateCcw } from "react-icons/fi";
import toast from "react-hot-toast";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SectionTitle from "../../../components/sectionTitle/SectionTitle";
import { Pagination } from "../../../components/pagination/Pagination";
import ConfirmDeleteModal from "../../../components/modal/ConfirmDeleteModal";
import StatusSelect from "./StatusSelect";

/* debounce helper */
const useDebounced = (value, delay = 400) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const ManageOrders = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient(); // 👈 for cross-page invalidation

  // filters
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");

  const dSearch = useDebounced(search, 500);

  const qs = useMemo(
    () => ({ page, limit: pageSize, search: dSearch, status, sort }),
    [page, pageSize, dSearch, status, sort]
  );

  // load
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["admin-orders", qs],
    queryFn: async () => {
      const { data } = await axiosSecure.get("/orders", { params: qs });
      return data;
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const currentPage = data?.page ?? page;

  // reset filters
  const onReset = () => {
    setSearch("");
    setStatus("");
    setSort("newest");
    setPageSize(20);
    setPage(1);
  };

  /* ----- Mutations ----- */
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }) =>
      axiosSecure.patch(`/orders/${orderId}/status`, { status }),
    onMutate: () =>
      toast.loading("স্ট্যাটাস আপডেট হচ্ছে…", { id: "ord-status" }),
    onSuccess: () => {
      toast.success("স্ট্যাটাস আপডেট হয়েছে।", { id: "ord-status" });
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["my-orders"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["order"], exact: false });
      refetch();
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "স্ট্যাটাস আপডেট ব্যর্থ।", {
        id: "ord-status",
      });
    },
  });

  // delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const deleteMutation = useMutation({
    mutationFn: async (orderId) => axiosSecure.delete(`/orders/${orderId}`),
    onMutate: () => toast.loading("অর্ডার ডিলিট হচ্ছে…", { id: "ord-del" }),
    onSuccess: () => {
      toast.success("অর্ডার ডিলিট হয়েছে।", { id: "ord-del" });
      setDeleteTarget(null);
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["my-orders"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["order"], exact: false });
      refetch();
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "অর্ডার ডিলিট ব্যর্থ।", {
        id: "ord-del",
      });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SectionTitle heading="অর্ডার ম্যানেজমেন্ট" />

      {/* filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="সার্চ: নাম, ইমেইল, মোবাইল, ঠিকানা, আইডি…"
          className="rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <option value="">সব স্ট্যাটাস</option>
          <option value="pending">পেন্ডিং</option>
          <option value="processing">প্রসেস হচ্ছে</option>
          <option value="shipped">শিপড</option>
          <option value="delivered">ডেলিভারড</option>
          <option value="completed">সম্পন্ন</option>
          <option value="cancelled">বাতিল</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <option value="newest">নতুন আগে</option>
          <option value="oldest">পুরনো আগে</option>
        </select>

        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value) || 20);
            setPage(1);
          }}
          className="rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              প্রতি পৃষ্ঠায় {n}
            </option>
          ))}
        </select>

        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          title="Reset filters"
        >
          <FiRotateCcw />
          রিসেট
        </button>
      </div>

      {/* meta */}
      <div className="mb-3 text-sm text-gray-600">
        {isLoading || isFetching
          ? "লোড হচ্ছে…"
          : `মোট: ${total} • পৃষ্ঠা: ${currentPage}/${pages}`}
      </div>

      {/* states */}
      {isError && (
        <div className="rounded-২xl border border-red-200 bg-red-50 p-4 text-red-700">
          লোড করা যায়নি — {error?.response?.data?.message || error?.message}
        </div>
      )}

      {(isLoading || isFetching) && (
        <div className="overflow-hidden rounded-2xl border border-green-200 bg-white">
          <div className="h-40 animate-pulse bg-gray-100" />
        </div>
      )}

      {!isLoading && !isFetching && !isError && orders.length === 0 && (
        <div className="rounded-2xl border border-green-200 bg-white p-10 text-center text-gray-500">
          কোনো অর্ডার পাওয়া যায়নি।
        </div>
      )}

      {/* table */}
      {!isLoading && !isFetching && !isError && orders.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-green-200 bg-white">
            <table className="min-w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-green-50 text-left">
                  <Th className="w-32">অর্ডার আইডি</Th>
                  <Th className="w-36">তারিখ</Th>
                  <Th className="w-28 text-right">মোট (৳)</Th>
                  <Th className="w-[32rem]">পণ্য</Th>
                  <Th className="w-40">গ্রাহক</Th>
                  <Th className="w-36 text-center">স্ট্যাটাস</Th>
                  <Th className="w-40 text-center">স্ট্যাটাস পরিবর্তন</Th>
                  <Th className="w-40 text-center">অ্যাকশন</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const id = o._id || o.id || o.orderId || "";
                  const created =
                    o.createdAt || o.timeStamp
                      ? new Date(o.createdAt || o.timeStamp)
                      : null;
                  const dateStr = created
                    ? created.toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-";

                  const itemsArr = Array.isArray(o.items) ? o.items : [];
                  const itemCount = itemsArr.reduce(
                    (s, it) => s + (Number(it.qty) || 0),
                    0
                  );

                  const totalAmount =
                    o.amounts?.grandTotal ??
                    o.total ??
                    o.subtotal ??
                    itemsArr.reduce(
                      (s, it) =>
                        s + (Number(it.qty) || 0) * (Number(it.price) || 0),
                      0
                    );

                  const status = (o.status || "pending").toLowerCase();

                  return (
                    <tr
                      key={id}
                      className="border-t border-green-100 align-top"
                    >
                      <Td className="w-32 font-medium pt-3">
                        {String(id).slice(-8)}
                      </Td>
                      <Td className="w-36 pt-3">{dateStr}</Td>
                      <Td className="w-28 text-right pt-3">
                        {Number(totalAmount).toLocaleString("bn-BD")}
                      </Td>

                      {/* Products column: show ALL items (scrollable if long) */}
                      <Td className="w-[32rem]">
                        {itemsArr.length === 0 ? (
                          <span className="text-gray-500 text-sm">
                            কোনো আইটেম নেই
                          </span>
                        ) : (
                          <div className="max-h-40 overflow-y-auto pr-1">
                            {itemsArr.map((it, i) => {
                              const name =
                                it.name || it.productName || `পণ্য ${i + 1}`;
                              const label = it.label || it.variantLabel || null;
                              const img =
                                it.imageUrl ||
                                it.image ||
                                "https://via.placeholder.com/40?text=🛒";
                              const qty = Number(it.qty) || 0;
                              return (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 py-1"
                                >
                                  <img
                                    src={img}
                                    alt={name}
                                    className="h-9 w-9 rounded-md object-cover border border-emerald-100 bg-white"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <div className="truncate font-medium">
                                      {name}
                                      {label ? (
                                        <span className="text-gray-500 font-normal">
                                          {" "}
                                          ({label})
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      পরিমাণ: {qty}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="text-xs text-gray-600 mt-1">
                              মোট আইটেম: {itemCount}
                            </div>
                          </div>
                        )}
                      </Td>

                      {/* Customer */}
                      <Td className="w-40">
                        <div className="truncate">
                          {o?.shipping?.name || "-"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {o?.shipping?.phone || o?.shipping?.email || "-"}
                        </div>
                      </Td>

                      {/* Status badge column */}
                      <Td className="w-36 text-center">
                        <StatusBadge status={status} />
                      </Td>

                      {/* Status change dropdown column */}
                      <Td className="w-40 text-center">
                        <StatusSelect
                          value={status}
                          disabled={statusMutation.isLoading}
                          onChange={(val) =>
                            statusMutation.mutate({
                              orderId: id,
                              status: val,
                            })
                          }
                        />
                      </Td>

                      {/* Actions */}
                      <Td className="w-40 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/dashboard/my-orders/${id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2.5 py-1.5 text-sm hover:bg-green-50"
                          >
                            <FiExternalLink />
                            বিস্তারিত
                          </Link>

                          <button
                            onClick={() => setDeleteTarget(o)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-sm hover:bg-red-50 text-red-700"
                            title="অর্ডার ডিলিট"
                          >
                            <FiTrash2 />
                            ডিলিট
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="mt-6">
              <Pagination
                page={currentPage}
                pages={pages}
                total={total}
                pageSize={pageSize}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </>
      )}

      {/* Delete modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        orderId={deleteTarget?._id}
        submitting={deleteMutation.isLoading}
        onClose={() =>
          !deleteMutation.isLoading ? setDeleteTarget(null) : null
        }
        onConfirm={() =>
          deleteTarget && deleteMutation.mutate(deleteTarget._id)
        }
      />
    </div>
  );
};

export default ManageOrders;

/* helpers */
const Th = ({ children, className = "" }) => (
  <th className={`px-4 py-3 text-sm font-semibold text-green-800 ${className}`}>
    {children}
  </th>
);
const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  const label =
    {
      pending: "পেন্ডিং",
      processing: "প্রসেস হচ্ছে",
      shipped: "শিপড",
      delivered: "ডেলিভারড",
      completed: "সম্পন্ন",
      cancelled: "বাতিল",
    }[status] || "পেন্ডিং";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs ${
        map[status] || map.pending
      }`}
    >
      {label}
    </span>
  );
};
