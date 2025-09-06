import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MotionConfig, motion } from "motion/react";
import { Link } from "react-router";
import { FiArrowRight } from "react-icons/fi";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import ProductCard from "../productCard/ProductCard";

export const WeeklyPicks = ({
  title = "সপ্তাহের সেরা খাঁটি",
  filter = { featured: true },
  limit = 8,
  sort = "newest",
  linkHref = "/all-products",
}) => {
  const axiosPublic = useAxiosPublic();

  // ---------- params ----------
  const params = useMemo(() => {
    const p = { page: 1, limit, sort };
    Object.entries(filter || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") p[k] = v;
    });
    return p;
  }, [filter, limit, sort]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["weekly-picks", params],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/products", { params });
      return data; // { total, page, limit, pages, items }
    },
    keepPreviousData: true,
  });

  const items = data?.items ?? [];

  // ---------- motion variants ----------
  const header = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 180, damping: 20 },
    },
  };
  const grid = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  };
  const card = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 18, mass: 0.6 },
    },
  };

  return (
    <MotionConfig reducedMotion="user">
      <section className="px-4 py-5 sm:py-10">
        {/* ---------- Header ---------- */}
        <motion.div
          variants={header}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-5 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="text-center sm:text-left">
            <h2 className="noto-serif-bengali-normal text-2xl md:text-3xl">
              {title}
            </h2>

            {/* animated underline */}
            <motion.span
              aria-hidden
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
              className="mx-auto sm:mx-0 mt-2 block h-[3px] w-24 origin-left rounded bg-gradient-to-r from-green-600 to-emerald-600"
            />

            <p className="hind-siliguri-regular text-gray-500 text-sm mt-2">
              এই মুহূর্তে আমাদের সবচেয়ে জনপ্রিয় ও বিশ্বাসযোগ্য পণ্যগুলোর
              বাছাই।
            </p>
          </div>

          {/* See all products (Link) */}
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={linkHref}
              className="relative inline-flex items-center gap-2 rounded-2xl px-4 py-2 hind-siliguri-medium
                         bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm
                         hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition"
              aria-label="সব পণ্য দেখুন"
              title="সব পণ্য দেখুন"
            >
              {/* subtle shine */}
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <motion.span
                  className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/15 blur-sm"
                  initial={false}
                  whileHover={{ x: "160%" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </span>
              <span className="relative z-10">সব পণ্য দেখুন</span>
              <FiArrowRight className="relative z-10" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ---------- Loading ---------- */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="h-[360px] sm:h-[380px] rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ---------- Error ---------- */}
        {isError && !isLoading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 hind-siliguri-regular">
            ডাটা লোড করতে সমস্যা হয়েছে।{" "}
            <button
              onClick={() => refetch()}
              className="underline underline-offset-2"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        {/* ---------- Empty ---------- */}
        {!isLoading && !isError && items.length === 0 && (
          <div className="py-12 text-center text-gray-500 hind-siliguri-regular">
            এই সেকশনে কোনো পণ্য নেই।
          </div>
        )}

        {/* ---------- Grid (mobile: 2 cols) ---------- */}
        {!isLoading && !isError && items.length > 0 && (
          <motion.div
            variants={grid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {items.slice(0, limit).map((p) => (
              <motion.div key={p._id} variants={card}>
                <ProductCard p={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </MotionConfig>
  );
};

export default WeeklyPicks;
