import { motion } from "motion/react";
import { Link } from "react-router";
import { FiArrowRight } from "react-icons/fi";

const FinalCTA = () => (
  <section className="px-4 py-8 sm:py-12">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className="relative overflow-hidden rounded-[28px] border border-emerald-200
                 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-8 sm:p-10"
    >
      {/* soft inner ring */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-emerald-200/50" />

      {/* floating emojis (decorative) */}
      <motion.span
        aria-hidden
        className="absolute -top-2 left-6 text-2xl"
        animate={{ y: [0, 6, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        🍯
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute bottom-4 right-8 text-2xl"
        animate={{ y: [0, -8, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        🌾
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute top-6 right-1/4 text-2xl hidden sm:block"
        animate={{ y: [0, 4, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      >
        🫗
      </motion.span>

      {/* content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <h3 className="noto-serif-bengali-normal text-2xl sm:text-3xl">
          আজই <span className="text-emerald-700">খাঁটি</span> শুরু করুন
        </h3>

        {/* trust chips */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Chip>ক্যাশ অন ডেলিভারি</Chip>
          <Chip>সারা দেশে ডেলিভারি</Chip>
          <Chip>৭ দিনের রিটার্ন</Chip>
        </div>

        {/* primary CTA (client-side Link) */}
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/all-products"
            className="relative mt-5 inline-flex items-center justify-center gap-2
                       rounded-2xl px-6 py-3 hind-siliguri-medium
                       bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm hover:shadow-md
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label="সব পণ্য দেখুন"
            title="সব পণ্য দেখুন"
          >
            {/* shine */}
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <motion.span
                className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/20 blur-sm"
                initial={false}
                whileHover={{ x: "160%" }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </span>
            <span className="relative z-10">সব পণ্য দেখুন</span>
            <FiArrowRight className="relative z-10" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  </section>
);

const Chip = ({ children }) => (
  <span className="hind-siliguri-regular text-sm rounded-full border border-emerald-200 bg-white/70 px-3 py-1">
    {children}
  </span>
);

export default FinalCTA;
