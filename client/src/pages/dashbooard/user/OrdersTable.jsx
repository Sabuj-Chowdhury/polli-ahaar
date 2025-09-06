// src/components/orders/OrdersTable.jsx
import { Link } from "react-router";
import { FiExternalLink, FiXCircle, FiEdit2, FiStar } from "react-icons/fi";

const OrdersTable = ({ orders = [], onEdit, onCancelRequest, onReview }) => {
  // show Action column only if any row has primary actions
  const hasAnyActions =
    Array.isArray(orders) &&
    orders.some((o) => {
      const s = (o?.status || "pending").toLowerCase();
      return s === "pending" || (s === "delivered" && !o?.reviewed);
    });

  const actionColWidth = hasAnyActions ? "w-56" : null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-green-200 bg-white">
      <table className="min-w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-green-50 text-left">
            <Th className="w-32">অর্ডার আইডি</Th>
            <Th className="w-32">তারিখ</Th>
            <Th className="w-[28rem]">পণ্য</Th>
            <Th className="w-24 text-right">মোট (৳)</Th>
            <Th className="w-28 text-center">স্ট্যাটাস</Th>
            {hasAnyActions && (
              <Th className={`${actionColWidth} text-center`}>অ্যাকশন</Th>
            )}
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
                (s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0),
                0
              );

            const status = (o.status || "pending").toLowerCase();

            const showUpdateCancel = status === "pending";
            const showReview = status === "delivered" && !o.reviewed;
            const rowHasPrimary = showUpdateCancel || showReview;

            // How many lines to show in the table cell before "+N more"
            const VISIBLE = 4;

            return (
              <tr key={id} className="border-t border-green-100 align-top">
                <Td className="w-32 font-medium">{String(id).slice(-8)}</Td>
                <Td className="w-32">{dateStr}</Td>

                {/* Products column with brief details */}
                <Td className="w-[28rem]">
                  {itemsArr.length === 0 ? (
                    <span className="text-gray-500">কোনো আইটেম নেই</span>
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
                          <div key={i} className="flex items-center gap-3 py-1">
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

                <Td className="w-24 text-right">
                  {Number(totalAmount).toLocaleString("bn-BD")}
                </Td>
                <Td className="w-28 text-center">
                  <StatusBadge status={status} />
                </Td>

                {hasAnyActions && (
                  <Td className={`${actionColWidth} text-center`}>
                    <div
                      className={`flex items-center gap-2 ${
                        rowHasPrimary ? "justify-end" : "justify-center"
                      } whitespace-nowrap`}
                    >
                      <Link
                        to={`/dashboard/my-orders/${id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2.5 py-1.5 text-sm hover:bg-green-50"
                        title="বিস্তারিত"
                      >
                        <FiExternalLink />
                        <span>বিস্তারিত</span>
                      </Link>

                      {showUpdateCancel && (
                        <button
                          onClick={() => onEdit?.(o)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-1.5 text-sm hover:bg-blue-50"
                        >
                          <FiEdit2 />
                          আপডেট
                        </button>
                      )}
                      {showUpdateCancel && (
                        <button
                          onClick={() => onCancelRequest?.(o)} // open modal
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-sm hover:bg-red-50"
                        >
                          <FiXCircle />
                          বাতিল
                        </button>
                      )}
                      {showReview && (
                        <button
                          onClick={() => onReview?.(o)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-sm hover:bg-amber-50"
                        >
                          <FiStar />
                          রিভিউ
                        </button>
                      )}
                    </div>
                  </Td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;

/* subcomponents */
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
