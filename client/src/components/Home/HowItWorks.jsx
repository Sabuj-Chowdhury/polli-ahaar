// src/sections/HowItWorks.jsx
import { motion } from "motion/react";

const steps = [
  { t: "সরাসরি সংগ্রহ", d: "বিশ্বস্ত খামারী/উৎপাদকদের থেকে" },
  { t: "গুণগত পরীক্ষা", d: "আর্দ্রতা/ভেজাল/অশুদ্ধি চেক" },
  { t: "স্বচ্ছ প্যাক", d: "হাইজিনিক প্যাকিং ও সিল" },
  { t: "দ্রুত ডেলিভারি", d: "দেশজুড়ে পৌঁছে যাই" },
];

export const HowItWorks = () => {
  return (
    <section className="px-4 py-5 sm:py-10">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        viewport={{ once: true }}
        className="noto-serif-bengali-normal text-2xl md:text-3xl text-center mb-8"
      >
        আমরা কীভাবে <span className="text-green-700">খাঁটি</span> রাখি
      </motion.h2>

      {/* Steps */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.15 } },
        }}
        className="grid sm:grid-cols-2 md:grid-cols-4 gap-6"
      >
        {steps.map((s, i) => (
          <motion.div
            key={s.t}
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: {
                opacity: 1,
                y: 0,
                transition: { type: "spring", stiffness: 200, damping: 18 },
              },
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="rounded-2xl border border-green-100 bg-white p-6 text-center shadow-sm hover:shadow-md transition"
          >
            <div className="hind-siliguri-semibold text-lg text-gray-900">
              {s.t}
            </div>
            <div className="hind-siliguri-regular text-gray-600 text-sm mt-2 leading-snug">
              {s.d}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HowItWorks;
