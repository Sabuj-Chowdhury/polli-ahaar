// src/sections/WhyChooseUs.jsx
import { motion } from "motion/react";
import { FiShield, FiTruck, FiRefreshCcw } from "react-icons/fi";
import { LuLeaf } from "react-icons/lu";

const features = [
  {
    icon: <FiShield className="h-6 w-6" aria-hidden="true" />,
    title: "১০০% খাঁটি পণ্য",
    desc: "বিশ্বস্ত উৎস থেকে সংগ্রহ—কোনো ভেজাল নয়, মান নিয়ন্ত্রণে আপোস নয়।",
  },
  {
    icon: <FiTruck className="h-6 w-6" aria-hidden="true" />,
    title: "সারা দেশে ডেলিভারি",
    desc: "দ্রুত ও নিরাপদ ডেলিভারি—শহর হোক বা গ্রাম, আপনার দোরগোড়ায়।",
  },
  {
    icon: <LuLeaf className="h-6 w-6" aria-hidden="true" />,
    title: "অর্গানিক ও স্বাস্থ্যসম্মত",
    desc: "প্রিজারভেটিভ-মুক্ত, প্রকৃতির আসল স্বাদ ও পুষ্টিগুণ অক্ষুণ্ন।",
  },
  {
    icon: <FiRefreshCcw className="h-6 w-6" aria-hidden="true" />,
    title: "সহজ রিটার্ন নীতি",
    desc: "প্রোডাক্ট নিয়ে সমস্যা? নির্দিষ্ট সময়ের ভিতর ঝামেলাহীন রিটার্ন।",
  },
];

const WhyChooseUs = () => {
  // motion variants
  const header = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 180, damping: 20 },
    },
  };

  const grid = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const card = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 220, damping: 18, mass: 0.6 },
    },
  };

  return (
    <section className="bg-white">
      <div className=" px-4 py-5 sm:py-10">
        {/* Heading */}
        <motion.div
          variants={header}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="noto-serif-bengali-normal text-2xl sm:text-3xl text-brand-neutral-900">
            কেন আমাদের বেছে নিবেন?
          </h2>
          <p className="hind-siliguri-regular mt-3 text-brand-neutral-600 leading-7">
            আমরা প্রতিশ্রুতি দিই খাঁটি, নিরাপদ ও ন্যায্য দামের গ্রামীণ
            খাদ্যপণ্য—আপনার পরিবারের জন্য।
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              variants={card}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="inline-flex items-center justify-center rounded-xl bg-brand-secondary/70 text-brand-neutral-900 p-3">
                {f.icon}
                <span className="sr-only">{f.title}</span>
              </div>

              <h3 className="hind-siliguri-semibold text-lg mt-4 text-brand-neutral-900">
                {f.title}
              </h3>

              <p className="hind-siliguri-regular text-sm mt-2 text-brand-neutral-600 leading-6">
                {f.desc}
              </p>

              {/* subtle accent underline on hover */}
              <span className="mt-4 block h-px w-0 bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300 group-hover:w-full" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="mt-10 rounded-2xl border border-brand-border bg-brand-secondary/60 px-6 py-5 text-center relative overflow-hidden"
        >
          {/* soft shine */}
          <span className="pointer-events-none absolute inset-0">
            <span className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition" />
          </span>

          <p className="hind-siliguri-regular text-brand-neutral-900">
            খাঁটি পণ্যের নিশ্চয়তা পেতে এখনই অর্ডার করুন — আপনার স্বাস্থ্য,
            আমাদের অঙ্গীকার।
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
