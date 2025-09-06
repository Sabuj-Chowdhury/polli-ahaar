import { Link, useNavigate } from "react-router";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import useCart from "../../hooks/useCart";
import useAdmin from "../../hooks/useAdmin";

const CartPage = () => {
  const { items, removeItem, setQty, subtotal, clearCart } = useCart();
  const totalItems = items.reduce((s, i) => s + i.qty, 0);

  const navigate = useNavigate();

  // check role
  const { isAdmin, isLoading: adminLoading } = useAdmin();

  if (!items.length) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-green-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <FiShoppingBag className="text-green-700" size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-2">কার্ট খালি</h2>
          <p className="text-gray-500 mb-6">
            পণ্য বেছে নিন এবং কার্টে যোগ করুন।
          </p>
          <Link
            to="/all-products"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
          >
            কেনাকাটা শুরু করুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="noto-serif-bengali-normal text-2xl mb-5">আমার কার্ট</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Items */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const lineTotal = item.qty * item.price;
            const disableMinus = item.qty <= 1;
            const disablePlus = item.qty >= item.stock;

            return (
              <div
                key={item.id + item.variantLabel}
                className="flex items-stretch gap-4 rounded-2xl border border-green-200 bg-white p-3 shadow-sm"
              >
                {/* Image */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Middle: title, meta, qty */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="hind-siliguri-medium truncate">
                        {item.name}
                      </h3>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.variantLabel} • ৳ {item.price}
                        {item.stock <= 3 && (
                          <span className="ml-2 text-red-600">
                            (স্টকে {item.stock})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove (top-right) */}
                    <button
                      onClick={() => removeItem(item.id, item.variantLabel)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      <FiTrash2 size={14} />
                      মুছুন
                    </button>
                  </div>

                  {/* Qty controls */}
                  <div className="mt-3 inline-flex items-center gap-2">
                    <button
                      onClick={() =>
                        setQty(item.id, item.variantLabel, item.qty - 1)
                      }
                      disabled={disableMinus}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                        disableMinus
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-green-200 hover:bg-green-50"
                      }`}
                      aria-label="কমান"
                      title="কমান"
                    >
                      <FiMinus />
                    </button>

                    <span className="min-w-[36px] text-center hind-siliguri-medium">
                      {item.qty}
                    </span>

                    <button
                      onClick={() =>
                        setQty(item.id, item.variantLabel, item.qty + 1)
                      }
                      disabled={disablePlus}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                        disablePlus
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-green-200 hover:bg-green-50"
                      }`}
                      aria-label="বাড়ান"
                      title="বাড়ান"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                {/* Right: line total */}
                <div className="flex flex-col items-end justify-between">
                  <div className="hind-siliguri-medium text-green-700">
                    ৳ {lineTotal}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    প্রতি পিস: ৳ {item.price}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Actions under list */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/all-products"
              className="rounded-xl border border-green-200 px-4 py-2 hover:bg-green-50"
            >
              কেনাকাটা চালিয়ে যান
            </Link>

            <button
              onClick={clearCart}
              className="rounded-xl border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50"
            >
              কার্ট খালি করুন
            </button>
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-20 rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
            <h3 className="hind-siliguri-medium text-lg mb-4">অর্ডার সারাংশ</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">আইটেম (সংখ্যা)</span>
                <span className="hind-siliguri-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">সাবটোটাল</span>
                <span className="hind-siliguri-medium">৳ {subtotal}</span>
              </div>
              <div className="border-t border-green-200 pt-2 flex justify-between text-base">
                <span className="hind-siliguri-medium">মোট পরিশোধ</span>
                <span className="hind-siliguri-medium text-green-700">
                  ৳ {subtotal}
                </span>
              </div>
            </div>

            {/* Order button — disabled for admin */}
            <button
              type="button"
              disabled={!adminLoading && isAdmin} // only disable when we know it's an admin
              aria-disabled={!adminLoading && isAdmin}
              title={
                !adminLoading && isAdmin
                  ? "অ্যাডমিন হিসেবে অর্ডার করা যাবে না"
                  : "অর্ডার করুন"
              }
              className={`mt-4 w-full rounded-xl px-4 py-2 transition ${
                !adminLoading && isAdmin
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              onClick={() => {
                if (!isAdmin) {
                  navigate("/checkout");
                }
              }}
            >
              অর্ডার করুন
            </button>

            {!adminLoading && isAdmin && (
              <p className="mt-2 text-[12px] text-amber-700">
                নোট: অ্যাডমিন একাউন্ট দিয়ে অর্ডার করা নিষ্ক্রিয়। দয়া করে
                সাধারণ ক্রেতা একাউন্ট ব্যবহার করুন।
              </p>
            )}

            <p className="mt-3 text-[12px] text-gray-500">
              অর্ডার করার আগে পরিমাণ ও ভ্যারিয়েন্ট যাচাই করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
