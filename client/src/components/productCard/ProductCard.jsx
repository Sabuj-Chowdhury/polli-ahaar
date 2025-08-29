// src/components/products/ProductCard.jsx
import { motion } from "motion/react";
import { FiShoppingCart } from "react-icons/fi";
import useCart from "../../hooks/useCart";

export const ProductCard = ({ p }) => {
  const { addItem } = useCart();

  // Min price from variants (or precomputed p.minPrice)
  const minPrice =
    typeof p.minPrice === "number"
      ? p.minPrice
      : Math.min(
          ...(p?.variants || [])
            .map((v) => Number(v.price))
            .filter((n) => Number.isFinite(n))
        );

  // Total stock across variants
  const totalStock = (p?.variants || []).reduce(
    (sum, v) => sum + (Number(v?.stock) || 0),
    0
  );
  const outOfStock = totalStock <= 0;

  // Choose a default variant to add (first one that has stock)
  const defaultVariant =
    (p?.variants || []).find((v) => Number(v?.stock) > 0) || null;

  const handleAddToCart = () => {
    if (!outOfStock && defaultVariant) {
      // CartContext takes (product, variant, qty=1)
      addItem(p, defaultVariant, 1);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 20, mass: 0.6 }}
      className="group h-[380px] rounded-2xl border border-green-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition relative"
    >
      {/* Top image */}
      <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
        <motion.img
          src={p.image}
          alt={p.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
        />

        {/* Badge (top-left) */}
        {outOfStock ? (
          <span className="absolute left-2 top-2 rounded-full bg-red-100 text-red-700 text-[11px] px-2 py-0.5">
            স্টক নেই
          </span>
        ) : (
          p.featured && (
            <span className="absolute left-2 top-2 rounded-full bg-amber-100 text-amber-700 text-[11px] px-2 py-0.5">
              Featured
            </span>
          )
        )}
      </div>

      {/* Body (flex to pin button at bottom) */}
      <div className="flex flex-col h-[calc(380px-((100%/4)*3))] p-4">
        {/* Title + brand (clamped for uniform height) */}
        <div>
          <h3 className="hind-siliguri-medium text-gray-900 line-clamp-2 leading-snug">
            {p.name}
          </h3>
          {p.brand && (
            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {p.brand}
            </div>
          )}
        </div>

        {/* Price row */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg text-green-700">
            {Number.isFinite(minPrice) ? `৳ ${minPrice}` : "দাম দেখুন"}
          </div>
          {/* Invisible placeholder keeps layout stable */}
          <div className="text-[11px] text-gray-500 invisible">•</div>
        </div>

        {/* Meta */}
        <div className="mt-1 text-[11px] text-gray-500 line-clamp-1">
          {p.category}
          {p.type ? ` • ${p.type}` : ""}
        </div>

        {/* Spacer keeps button aligned at bottom */}
        <div className="flex-1" />

        {/* Add to cart */}
        <motion.button
          type="button"
          onClick={handleAddToCart}
          whileTap={!outOfStock ? { scale: 0.98 } : undefined}
          disabled={outOfStock}
          aria-disabled={outOfStock}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 transition
            ${
              outOfStock
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          aria-label={outOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
          title={outOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
        >
          <FiShoppingCart />
          <span className="hind-siliguri-medium text-sm">
            {outOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
