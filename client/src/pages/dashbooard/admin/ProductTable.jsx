// src/pages/dashboard/products/ProductTable.jsx
import { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../../components/spinner/LoadingSpinner";

const ProductTable = ({
  items,
  page,
  limit,
  computeMinPrice,
  totalStock,
  refetch,
  onEdit, // ✅ accept onEdit from parent
}) => {
  const axiosSecure = useAxiosSecure();
  const [deletingId, setDeletingId] = useState(null);

  // Delete API call
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await axiosSecure.delete(`/product/${id}`);
      await refetch?.();
    } finally {
      setDeletingId(null);
    }
  };

  // SweetAlert wrapper
  const handleCustomDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await handleDelete(id);
          Swal.fire({
            title: "Deleted!",
            text: "Product has been deleted.",
            icon: "success",
          });
        } catch {
          Swal.fire({
            title: "Failed!",
            text: "Delete failed. Try again.",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-green-200 bg-white shadow-sm">
      <table className="min-w-full text-left">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">পণ্য</th>
            <th className="px-4 py-3">ক্যাটাগরি/টাইপ</th>
            <th className="px-4 py-3">স্ট্যাটাস</th>
            <th className="px-4 py-3">দাম (সর্বনিম্ন)</th>
            <th className="px-4 py-3">স্টক</th>
            <th className="px-4 py-3">ফিচার্ড</th>
            <th className="px-4 py-3 text-right">অ্যাকশন</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                কোনো পণ্য পাওয়া যায়নি।
              </td>
            </tr>
          ) : (
            items.map((p, idx) => {
              const rowNumber = (page - 1) * limit + idx + 1;
              const isDeleting = deletingId === p._id;

              return (
                <tr key={p._id} className="border-t relative">
                  {/* Row overlay while deleting */}
                  {isDeleting && (
                    <td colSpan={8} className="absolute inset-0 z-10">
                      <div className="w-full h-full bg-white/70 flex items-center justify-center">
                        <LoadingSpinner />
                      </div>
                    </td>
                  )}

                  <td className="px-4 py-3 align-middle">{rowNumber}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="hind-siliguri-medium">{p.name}</div>
                        {p.brand && (
                          <div className="text-xs text-gray-500">{p.brand}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {p.category || "-"}
                      {p.type ? ` / ${p.type}` : ""}
                    </div>
                    {p.originDistrict && (
                      <div className="text-xs text-gray-500">
                        উৎস: {p.originDistrict}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        p.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.status || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    ৳ {Number(computeMinPrice(p)).toLocaleString("bn-BD")}
                  </td>

                  <td className="px-4 py-3">{totalStock(p)}</td>

                  <td className="px-4 py-3">{p.featured ? "✔︎" : "—"}</td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onEdit?.(p)}
                      disabled={isDeleting}
                      className={`mr-2 inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm ${
                        isDeleting
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-green-50"
                      }`}
                      aria-label="সম্পাদনা"
                      title="সম্পাদনা"
                    >
                      <FiEdit2 size={16} />
                      <span>সম্পাদনা</span>
                    </button>

                    <button
                      onClick={() => handleCustomDelete(p._id)}
                      disabled={isDeleting}
                      className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm ${
                        isDeleting
                          ? "opacity-50 cursor-not-allowed"
                          : "border-red-300 text-red-600 hover:bg-red-50"
                      }`}
                      aria-label="মুছুন"
                      title="মুছুন"
                    >
                      <FiTrash2 size={16} />
                      <span>মুছুন</span>
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
