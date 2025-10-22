import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiShoppingCart, FiCheck, FiShoppingBag } from "react-icons/fi";
import useCart from "../../hooks/useCart";

export const ProductCard = ({ p }) => {
  const { addItem } = useCart();

  // prices
  const minPrice =
    typeof p.minPrice === "number"
      ? p.minPrice
      : Math.min(
          ...(p?.variants || [])
            .map((v) => Number(v.price))
            .filter((n) => Number.isFinite(n))
        );

  // stock
  const totalStock = (p?.variants || []).reduce(
    (sum, v) => sum + (Number(v?.stock) || 0),
    0
  );
  const outOfStock = totalStock <= 0;

  const defaultVariant =
    (p?.variants || []).find((v) => Number(v?.stock) > 0) || null;

  const one =
    Array.isArray(p?.variants) && p.variants.length === 1
      ? p.variants[0]
      : null;

  const singleVariantLabel =
    one?.label?.toString().trim() ||
    one?.title?.toString().trim() ||
    (one?.qty && one?.unit ? `${one.qty} ${one.unit}` : null);

  const orderCount = Number(p?.orderCount) || 0;
  const orderCountBn = orderCount.toLocaleString("bn-BD");

  // micro states
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // disable hover animations on touch devices
  const [canHover, setCanHover] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCanHover(window.matchMedia("(hover: hover)").matches);
    }
  }, []);

  const handleAddToCart = async () => {
    if (outOfStock || !defaultVariant || isAdding) return;
    try {
      setIsAdding(true);
      addItem(p, defaultVariant, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1100);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={canHover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 220, damping: 20, mass: 0.6 }}
      className="group rounded-xl border border-green-200 bg-white shadow-sm overflow-hidden transition relative flex flex-col"
    >
      {/* Image (square looks best on mobile cards) */}
      <div className="aspect-square bg-gray-50 overflow-hidden relative">
        <motion.img
          src={p.image}
          alt={p.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          whileHover={canHover ? { scale: 1.04 } : undefined}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
        />

        {/* Stock / Featured */}
        {outOfStock ? (
          <span className="absolute left-2 top-2 rounded-full bg-red-100 text-red-700 text-[10px] px-2 py-0.5">
            স্টক নেই
          </span>
        ) : (
          p.featured && (
            <span className="absolute left-2 top-2 rounded-full bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5">
              Featured
            </span>
          )
        )}

        {/* Single variant */}
        {singleVariantLabel && (
          <span className="absolute right-2 top-2 rounded-full bg-emerald-600 text-white text-[10px] font-medium px-2 py-0.5 shadow-sm">
            {singleVariantLabel}
          </span>
        )}

        {/* Order count – always visible */}
        {orderCount > 0 && (
          <span
            className="absolute left-2 bottom-2 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white/95 backdrop-blur px-2 py-0.5 text-[10px] text-green-700 shadow-sm"
            title={`${orderCountBn} বার অর্ডার হয়েছে`}
            aria-label={`${orderCountBn} বার অর্ডার হয়েছে`}
          >
            <FiShoppingBag className="text-green-700" />
            <span>{orderCountBn} বার অর্ডার হয়েছে</span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <div>
          <h3 className="hind-siliguri-medium text-gray-900 leading-snug text-[15px] sm:text-base line-clamp-1 sm:line-clamp-2">
            {p.name}
          </h3>

          {p.brand && (
            <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">
              {p.brand}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-[15px] sm:text-lg text-green-700">
            {Number.isFinite(minPrice) ? `৳ ${minPrice}` : "দাম দেখুন"}
          </div>
          <div className="text-[10px] text-gray-500 invisible">•</div>
        </div>

        <div className="flex-1" />

        {/* Cart Button */}
        <motion.button
          type="button"
          onClick={handleAddToCart}
          whileHover={!outOfStock && canHover ? { y: -1 } : undefined}
          whileTap={!outOfStock ? { scale: 0.98 } : undefined}
          disabled={outOfStock || isAdding}
          aria-disabled={outOfStock || isAdding}
          aria-label={
            outOfStock ? "স্টক নেই" : added ? "যোগ হয়েছে" : "কার্টে যোগ করুন"
          }
          title={
            outOfStock ? "স্টক নেই" : added ? "যোগ হয়েছে" : "কার্টে যোগ করুন"
          }
          className={`relative mt-3 w-full overflow-hidden rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5
            transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            ${
              outOfStock || isAdding
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm hover:shadow-md"
            }`}
        >
          {!outOfStock && !isAdding && canHover && (
            <motion.span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100">
              <motion.span
                className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/10 blur-md"
                initial={{ x: "-120%" }}
                whileHover={{ x: "160%" }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </motion.span>
          )}

          <div className="relative z-10 flex items-center justify-center gap-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {added ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="grid place-items-center rounded-full bg-white/20 p-1"
                >
                  <FiCheck className="text-white" />
                </motion.span>
              ) : (
                <motion.span
                  key="cart"
                  initial={{ y: 0 }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="grid place-items-center rounded-full bg-white/15 p-1"
                >
                  <FiShoppingCart className="text-white" />
                </motion.span>
              )}
            </AnimatePresence>

            <span className="hind-siliguri-medium text-[13px] sm:text-sm">
              {outOfStock
                ? "স্টক নেই"
                : added
                ? "যোগ হয়েছে"
                : "কার্টে যোগ করুন"}
            </span>
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.span
                className="absolute inset-0 grid place-items-center bg-black/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "linear",
                  }}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
