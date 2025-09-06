// src/pages/dashboard/MyOrders.jsx
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SectionTitle from "../../../components/sectionTitle/SectionTitle";
import { Pagination } from "../../../components/pagination/Pagination";
import OrdersTable from "./OrdersTable";
import UpdateOrderModal from "../../../components/modal/UpdateOrderModal";
import ReviewModal from "../../../components/modal/ReviewModal";
import ConfirmCancelModal from "../../../components/modal/ConfirmCancelModal";

const MyOrders = () => {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const onDashboard = pathname.startsWith("/dashboard");

  // modal states
  const [cancelTarget, setCancelTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  // table controls
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const qs = useMemo(() => ({ page, limit: pageSize }), [page, pageSize]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const canQuery = onDashboard && !loading && !!user?.email && !!token;

  // ===== Query: my orders =====
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["my-orders", user?.email, qs],
    enabled: canQuery,
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/orders/my/${user?.email}`, {
        params: qs,
      });
      return data; // { total, page, limit, pages, items }
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    keepPreviousData: true,
  });

  // ===== Mutations =====
  const cancelMutation = useMutation({
    mutationFn: async (orderId) =>
      axiosSecure.patch(`/orders/${orderId}/cancel`),
    onMutate: () => toast.loading("অর্ডার বাতিল হচ্ছে…", { id: "ord-act" }),
    onSuccess: () => {
      toast.success("অর্ডার বাতিল হয়েছে।", { id: "ord-act" });
      setCancelTarget(null);
      queryClient.invalidateQueries({ queryKey: ["my-orders"], exact: false });
      refetch();
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "অর্ডার বাতিল করা যায়নি।", {
        id: "ord-act",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ orderId, shipping }) =>
      axiosSecure.patch(`/orders/${orderId}`, { shipping }),
    onMutate: () => toast.loading("অর্ডার আপডেট হচ্ছে…", { id: "ord-upd" }),
    onSuccess: () => {
      toast.success("অর্ডার আপডেট হয়েছে।", { id: "ord-upd" });
      setEditTarget(null);
      queryClient.invalidateQueries({ queryKey: ["my-orders"], exact: false });
      refetch();
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "অর্ডার আপডেট করা যায়নি।", {
        id: "ord-upd",
      });
    },
  });

  // ✅ Review mutation
  const reviewMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosSecure.post("/review", payload);
      return data;
    },
    onMutate: () => toast.loading("রিভিউ সাবমিট হচ্ছে…", { id: "ord-rev" }),
    onSuccess: () => {
      toast.success("ধন্যবাদ! আপনার রিভিউ যুক্ত হয়েছে।", { id: "ord-rev" });
      setReviewTarget(null);
      queryClient.invalidateQueries({ queryKey: ["my-orders"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["reviews"], exact: false });
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "রিভিউ সাবমিট করা যায়নি।", {
        id: "ord-rev",
      });
    },
  });

  if (!onDashboard) return null;

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const currentPage = data?.page ?? page;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SectionTitle heading="আমার অর্ডার" />

      {/* toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600 hind-siliguri-regular">
          {!canQuery
            ? "লগইন যাচাই হচ্ছে…"
            : isLoading || isFetching
            ? "লোড হচ্ছে…"
            : `মোট অর্ডার: ${total} • পৃষ্ঠা: ${currentPage}/${pages}`}
        </div>
      </div>

      {/* error */}
      {canQuery && isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          অর্ডার লোড করা যায়নি।{" "}
          <span className="text-gray-700">
            {error?.response?.data?.message || error?.message || ""}
          </span>
        </div>
      )}

      {/* loading */}
      {canQuery && (isLoading || isFetching) && (
        <div className="overflow-hidden rounded-2xl border border-green-200 bg-white">
          <div className="h-40 animate-pulse bg-gray-100" />
        </div>
      )}

      {/* empty */}
      {canQuery &&
        !isLoading &&
        !isFetching &&
        !isError &&
        orders.length === 0 && (
          <div className="rounded-2xl border border-green-200 bg-white p-10 text-center">
            <div className="text-gray-500">কোনো অর্ডার পাওয়া যায়নি।</div>
            <Link
              to="/all-products"
              className="mt-4 inline-block rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              কেনাকাটা শুরু করুন
            </Link>
          </div>
        )}

      {/* table */}
      {canQuery &&
        !isLoading &&
        !isFetching &&
        !isError &&
        orders.length > 0 && (
          <>
            <OrdersTable
              orders={orders}
              onEdit={(o) => setEditTarget(o)}
              onCancelRequest={(o) => setCancelTarget(o)}
              onReview={(o) => setReviewTarget(o)}
            />

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

      {/* Update modal */}
      {editTarget && (
        <UpdateOrderModal
          order={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(shipping) =>
            updateMutation.mutate({ orderId: editTarget._id, shipping })
          }
          submitting={updateMutation.isLoading}
        />
      )}

      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal
          order={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={(payload) =>
            reviewMutation.mutate({
              orderId: reviewTarget._id,
              userId: user?._id,
              userEmail: user?.email,
              name: payload.anonymous ? "Anonymous" : payload.name,
              stars: payload.stars,
              text: payload.text,
              createdAt: new Date(),
            })
          }
          submitting={reviewMutation.isLoading}
        />
      )}

      <ConfirmCancelModal
        open={!!cancelTarget}
        orderId={cancelTarget?._id}
        submitting={cancelMutation.isLoading}
        onClose={() =>
          !cancelMutation.isLoading ? setCancelTarget(null) : null
        }
        onConfirm={() =>
          cancelTarget && cancelMutation.mutate(cancelTarget._id)
        }
      />
    </div>
  );
};

export default MyOrders;
