// src/pages/dashboard/OrderDetails.jsx
import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { FiArrowLeft } from "react-icons/fi";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SectionTitle from "../../../components/sectionTitle/SectionTitle";
import LoadingSpinner from "../../../components/spinner/LoadingSpinner";

const OrderDetails = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/orders/${id}`);
      return data; // { _id, createdAt, status, items, shipping, amounts }
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* <div className="h-40 animate-pulse bg-gray-100 rounded-xl" /> */}
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-red-600">
        অর্ডার লোড করা যায়নি: {error?.response?.data?.message || error.message}
      </div>
    );
  }

  const order = data || {};
  const created = order.createdAt ? new Date(order.createdAt) : null;
  const dateStr = created
    ? created.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back link */}
      <div className="mb-2">
        <Link
          to="/dashboard/my-orders"
          className="inline-flex items-center gap-1 text-green-700 hover:underline"
        >
          <FiArrowLeft /> ফিরে যান
        </Link>
      </div>

      <SectionTitle heading={`অর্ডার #${String(order._id || "").slice(-8)}`} />

      {/* Summary Card */}
      <div className="rounded-xl border border-green-200 bg-white p-5 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium">তারিখ:</span>
          <span>{dateStr}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">স্ট্যাটাস:</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">মোট:</span>
          <span className=" text-green-700">
            ৳{Number(order.amounts?.grandTotal || 0).toLocaleString("bn-BD")}
          </span>
        </div>
      </div>

      {/* Shipping Card */}
      <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">
        <h4 className="font-medium mb-2">ডেলিভারি তথ্য</h4>
        <p className="text-sm text-gray-700">
          {order.shipping?.name || "-"}
          <br />
          {order.shipping?.phone || "-"}
          <br />
          {order.shipping?.address || "-"}
        </p>
      </div>

      {/* Items List */}
      <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">
        <h4 className="font-medium mb-3">পণ্যের তালিকা</h4>
        <div className="space-y-3">
          {(order.items || []).map((it, idx) => (
            <div
              key={idx}
              className="flex justify-between items-start border-b border-green-100 pb-2 last:border-0"
            >
              <div>
                <p className="font-medium">
                  {it.productName || `পণ্য ${idx + 1}`}
                </p>
                <p className="text-sm text-gray-500">
                  {it.variantLabel || "—"}
                </p>
                <p className="text-sm text-gray-600">
                  পরিমাণ: {it.qty} × ৳
                  {Number(it.price || 0).toLocaleString("bn-BD")}
                </p>
              </div>
              <div className="text-right font-medium">
                ৳
                {Number((it.qty || 0) * (it.price || 0)).toLocaleString(
                  "bn-BD"
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Status badge */
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

export default OrderDetails;
