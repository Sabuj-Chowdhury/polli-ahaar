// src/pages/checkout/OrderSuccess.jsx
import { useSearchParams, Link } from "react-router";
import { FiCheckCircle, FiShoppingBag } from "react-icons/fi";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-green-50 p-6 border border-green-200">
          <FiCheckCircle className="text-green-600" size={48} />
        </div>
      </div>

      <h1 className="noto-serif-bengali-normal text-2xl mb-2">
        🎉 অর্ডার সফল হয়েছে!
      </h1>
      <p className="hind-siliguri-regular text-gray-600 mb-4">
        আপনার অর্ডার আমরা পেয়েছি। শীঘ্রই আমাদের টিম যোগাযোগ করবে।
      </p>

      {orderId && (
        <p className="text-sm text-gray-500 mb-6">
          অর্ডার আইডি:{" "}
          <span className="hind-siliguri-medium text-green-700">{orderId}</span>
        </p>
      )}

      <div className="flex justify-center gap-3">
        <Link
          to="/all-products"
          className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2 hover:bg-green-50 transition"
        >
          <FiShoppingBag /> কেনাকাটা চালিয়ে যান
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
        >
          হোমে যান
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
