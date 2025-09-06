// src/pages/checkout/Checkout.jsx
import { Link, useNavigate } from "react-router";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MotionConfig, motion } from "motion/react";
import {
  FiShoppingBag,
  FiLock,
  FiPhone,
  FiMapPin,
  FiUser,
  FiMail,
} from "react-icons/fi";
import toast from "react-hot-toast";
import useCart from "../../hooks/useCart";
import useAdmin from "../../hooks/useAdmin";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";

const Checkout = () => {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { isAdmin } = useAdmin();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const hasItems = items.length > 0;

  // ---------- Prefill profile ----------
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/user/${user.email}`);
      return data; // { name, phone, email, address, ... }
    },
  });

  const initial = useMemo(
    () => ({
      name: profile?.name ?? user?.displayName ?? "",
      phone: profile?.phone ?? user?.phoneNumber ?? "",
      email: profile?.email ?? user?.email ?? "",
      address: profile?.address ?? "",
      note: "",
    }),
    [profile, user]
  );

  // Detect missing essentials (phone or address) to nudge profile update
  const missingPhone = !profileLoading && !(initial.phone ?? "").trim();
  const missingAddress = !profileLoading && !(initial.address ?? "").trim();
  const needsProfileUpdate = missingPhone || missingAddress;

  if (!hasItems) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-green-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <FiShoppingBag className="text-green-700" size={28} />
          </div>
          <h2 className="noto-serif-bengali-normal text-xl mb-2">কার্ট খালি</h2>
          <p className="hind-siliguri-regular text-gray-500 mb-6">
            অর্ডার করার আগে কিছু পণ্য কার্টে যোগ করুন।
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isAdmin) return;

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name")?.toString().trim();
    const phone = fd.get("phone")?.toString().trim();
    const email = fd.get("email")?.toString().trim();
    const address = fd.get("address")?.toString().trim();
    const note = fd.get("note")?.toString().trim();

    if (!name || !phone || !email || !address) {
      toast.error("নাম, মোবাইল, ইমেইল ও ঠিকানা দিন।");
      return;
    }

    // --- Build line items with the extra fields you wanted ---
    const itemsForBackend = items.map((i) => ({
      productId: i.id,
      name: i.name, // include product name
      label: i.variantLabel || null, // include label (variant)
      imageUrl: i.imageUrl || i.image || null, // include image url (fallbacks)
      price: i.price,
      qty: i.qty, // per-line quantity
    }));

    // --- Aggregate total quantity by product (across variants/lines) ---
    const totalsByProductMap = items.reduce((acc, i) => {
      const key = i.id;
      if (!acc[key]) {
        acc[key] = {
          productId: i.id,
          name: i.name,
          imageUrl: i.imageUrl || i.image || null,
          totalQty: 0,
        };
      }
      acc[key].totalQty += i.qty;
      return acc;
    }, {});
    const productsSummary = Object.values(totalsByProductMap); // [{ productId, name, imageUrl, totalQty }]

    // Shape now includes both detailed line items and aggregated totals
    const orderPayload = {
      items: itemsForBackend,
      productsSummary,
      shipping: { name, phone, email, address, note },
      payment: { method: "COD" },
    };

    try {
      toast.loading("অর্ডার সাবমিট হচ্ছে…", { id: "place-order" });
      const { data } = await axiosSecure.post("/orders", orderPayload);
      toast.success("অর্ডার সফলভাবে গ্রহণ করা হয়েছে!", {
        id: "place-order",
      });

      // Invalidate ALL my-orders queries (any page/limit)
      queryClient.invalidateQueries({ queryKey: ["my-orders"], exact: false });

      clearCart();

      // ✅ Redirect to the original success page with orderId (if provided)
      navigate(`/order-success?id=${data?.orderId ?? ""}`, { replace: true });
    } catch (err) {
      console.error("Place order failed:", err);
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401 || err?.response?.status === 403
          ? "লগইন করুন তারপর চেষ্টা করুন।"
          : "অর্ডার সম্পন্ন করা যায়নি, পরে আবার চেষ্টা করুন।");
      toast.error(msg, { id: "place-order" });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="noto-serif-bengali-normal text-2xl mb-5"
        >
          চেকআউট
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT */}
          <motion.form
            onSubmit={handlePlaceOrder}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="lg:col-span-8 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm"
          >
            <h2 className="hind-siliguri-medium text-lg">ডেলিভারি তথ্য</h2>

            {/* Profile update hint */}
            {!profileLoading && needsProfileUpdate && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm flex gap-3">
                <div className="shrink-0 mt-0.5">
                  {missingPhone ? <FiPhone /> : <FiMapPin />}
                </div>
                <div>
                  <p className="hind-siliguri-regular">
                    আপনার {missingPhone && "মোবাইল নম্বর"}
                    {missingPhone && missingAddress && " ও "}
                    {missingAddress && "ঠিকানা"} প্রোফাইলে যোগ করা নেই। মসৃণ
                    অভিজ্ঞতার জন্য প্রোফাইল আপডেট করুন।
                  </p>
                  <Link
                    to="/dashboard/profile"
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700 mt-2 transition"
                  >
                    প্রোফাইল আপডেট করুন
                  </Link>
                </div>
              </div>
            )}

            {profileLoading && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-10 rounded-xl bg-gray-100 animate-pulse sm:col-span-2" />
                <div className="h-10 rounded-xl bg-gray-100 animate-pulse sm:col-span-2" />
              </div>
            )}

            {profileError && !profileLoading && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
                প্রোফাইল ডেটা লোড করা যায়নি। তথ্যগুলো নিজে পূরণ করুন।{" "}
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => refetchProfile()}
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            )}

            {!profileLoading && (
              <>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    icon={<FiUser />}
                    placeholder="নাম"
                    name="name"
                    defaultValue={initial.name}
                    autoComplete="name"
                    required
                  />
                  <Field
                    icon={<FiPhone />}
                    placeholder="মোবাইল নম্বর"
                    name="phone"
                    type="tel"
                    defaultValue={initial.phone}
                    autoComplete="tel"
                    required
                  />
                </div>

                {/* EMAIL: visually disabled, but value still submitted */}
                <Field
                  icon={<FiMail />}
                  placeholder="ইমেইল"
                  name="email"
                  type="email"
                  className="mt-4 pointer-events-none cursor-not-allowed bg-gray-100"
                  defaultValue={initial.email}
                  autoComplete="email"
                  required
                  readOnly
                />

                <Field
                  icon={<FiMapPin />}
                  placeholder="সম্পূর্ণ ঠিকানা"
                  name="address"
                  className="mt-4"
                  defaultValue={initial.address}
                  autoComplete="shipping street-address"
                  required
                />

                <Textarea
                  placeholder="অতিরিক্ত নির্দেশনা (ঐচ্ছিক)"
                  name="note"
                  className="mt-4"
                  defaultValue={initial.note}
                />
              </>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>ক্যাশ অন ডেলিভারি</Chip>
              <Chip>চট্টগ্রামে দ্রুত ডেলিভারি</Chip>
              <Chip>৭ দিনের রিটার্ন</Chip>
            </div>

            <motion.button
              type="submit"
              whileHover={!isAdmin ? { y: -1 } : undefined}
              whileTap={!isAdmin ? { scale: 0.98 } : undefined}
              disabled={isAdmin || profileLoading}
              className={`relative mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3
                hind-siliguri-medium text-white shadow-sm focus:outline-none focus-visible:ring-2
                ${
                  isAdmin || profileLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-md"
                }
              `}
            >
              {!isAdmin && !profileLoading && (
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  <motion.span
                    className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/20 blur-sm"
                    initial={{ x: "-120%" }}
                    whileHover={{ x: "160%" }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </span>
              )}
              <FiLock className="relative z-10" />
              <span className="relative z-10">
                {isAdmin
                  ? "অ্যাডমিন অর্ডার করতে পারবেন না"
                  : profileLoading
                  ? "লোড হচ্ছে…"
                  : "অর্ডার সম্পন্ন করুন"}
              </span>
            </motion.button>

            {isAdmin && (
              <p className="mt-2 text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                আপনি অ্যাডমিন হিসেবে লগইন করেছেন—অর্ডার সাবমিট নিষ্ক্রিয়।
              </p>
            )}
          </motion.form>

          {/* RIGHT */}
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="lg:col-span-4"
          >
            <div className="lg:sticky lg:top-20 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              <h3 className="hind-siliguri-medium text-lg mb-4">
                অর্ডার সারাংশ
              </h3>

              <div className="space-y-2 text-sm">
                {items.map((i) => (
                  <div
                    key={i.id + i.variantLabel}
                    className="flex justify-between gap-3"
                  >
                    <span className="truncate">
                      {i.name} {i.variantLabel ? `(${i.variantLabel})` : ""} ×{" "}
                      {i.qty}
                    </span>
                    <span className="hind-siliguri-medium">
                      ৳ {i.qty * i.price}
                    </span>
                  </div>
                ))}

                <div className="border-t border-emerald-200 pt-2 flex justify-between text-base">
                  <span className="hind-siliguri-regular">মোট</span>
                  <span className="hind-siliguri-regular text-green-700">
                    ৳ {subtotal}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-[12px] text-gray-500">
                অর্ডার পাওয়ার পর আমাদের টিম যাচাই করে দ্রুত যোগাযোগ করবে।
              </p>

              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-[12px] text-emerald-800">
                নিরাপদ চেকআউট – আপনার তথ্য গোপন রাখা হয়।
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </MotionConfig>
  );
};

const Field = ({ icon, className = "", ...props }) => (
  <label className={`relative block ${className}`}>
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/80">
      {icon}
    </span>
    <input
      {...props}
      className="w-full rounded-xl border border-emerald-200 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
    />
  </label>
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    {...props}
    rows={3}
    className={`w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 ${className}`}
  />
);

const Chip = ({ children }) => (
  <span className="hind-siliguri-regular text-xs rounded-full border border-emerald-200 bg-white/70 px-3 py-1">
    {children}
  </span>
);

export default Checkout;
