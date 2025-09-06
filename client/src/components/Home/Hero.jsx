import { MotionConfig, motion } from "framer-motion";
import { Link } from "react-router"; // client-side navigation
import heroImage from "../../assets/HeroImg.png";
import { FaMoneyBillWave, FaRotate } from "react-icons/fa6";

const container = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 20,
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 18 },
  },
};

export const Hero = () => (
  <MotionConfig reducedMotion="user">
    <section className="px-4 py-6 sm:py-10 grid md:grid-cols-2 gap-8 items-center">
      {/* Left: copy */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-xl"
      >
        <motion.h1
          variants={item}
          className="noto-serif-bengali-normal text-3xl md:text-5xl leading-tight"
        >
          গ্রামীণ স্বাদের <span className="text-green-700">আসল ঠিকানা</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="hind-siliguri-regular mt-3 text-gray-600"
        >
          খাঁটি মধু, দেশি চাল, ঘি ও মসলার বিশ্বস্ত সংগ্রহ—এখন ঘরে বসেই।
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="mt-5 flex flex-wrap items-center gap-3"
        >
          {/* Primary CTA (shine + lift) */}
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/all-products"
              className="relative inline-flex items-center justify-center hind-siliguri-medium
                         rounded-2xl px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600
                         text-white shadow-sm hover:shadow-md focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="সব পণ্য দেখুন"
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
              এখনই কিনুন
            </Link>
          </motion.div>
          <TrustItem icon={<FaMoneyBillWave />} text="ক্যাশ অন ডেলিভারি" />
          <TrustItem icon={<FaRotate />} text="৭ দিনের রিটার্ন" />
        </motion.div>

        {/* Trust chips */}
        {/* <motion.div variants={item} className="mt-4 flex flex-wrap gap-2">
          <TrustItem icon={<FaMoneyBillWave />} text="ক্যাশ অন ডেলিভারি" />
          <TrustItem icon={<FaRotate />} text="৭ দিনের রিটার্ন" />
        </motion.div> */}
      </motion.div>

      {/* Right: image */}
      <div className="relative">
        <motion.img
          src={heroImage}
          alt="Polli Ahaar"
          className="w-full h-[340px] md:h-[420px] object-cover rounded-3xl"
          initial={{ scale: 1.03, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.div
          className="absolute bottom-3 left-3 bg-white rounded-2xl px-3 py-2 shadow"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
            delay: 0.15,
          }}
        >
          🌟 ২,৫০০+ খাঁটি রিভিউ
        </motion.div>
      </div>
    </section>
  </MotionConfig>
);

const TrustItem = ({ icon, text }) => (
  <div className="flex items-center gap-2 rounded-xl border p-2.5 bg-white/80">
    <span className="text-green-600">{icon}</span>
    <span className="hind-siliguri-regular text-sm">{text}</span>
  </div>
);

export default Hero;
