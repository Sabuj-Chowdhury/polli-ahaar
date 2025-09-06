// src/sections/ReviewsMarquee.jsx
import Marquee from "react-fast-marquee";
import { motion } from "motion/react";

export const ReviewsMarquee = () => {
  return (
    <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 py-10">
      <div className=" px-4 py-5 sm:py-10">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
          viewport={{ once: true }}
          className="noto-serif-bengali-normal text-2xl md:text-3xl text-center mb-6"
        >
          ক্রেতারা যা বলছেন ✨
        </motion.h2>

        {/* Marquee */}
        <Marquee
          gradient={false}
          speed={45}
          pauseOnHover={true}
          pauseOnClick={true}
        >
          {REVIEWS.map((r, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04 }}
              className="shrink-0 w-[280px] sm:w-[320px] mx-2 sm:mx-3 rounded-2xl border border-green-100 bg-white shadow-sm hover:shadow-md p-4 transition"
            >
              <div className="hind-siliguri-medium text-green-700 text-sm mb-1">
                ★ {r.stars || r.rating} — {r.name}
              </div>
              <div className="hind-siliguri-regular text-gray-600 text-sm leading-snug line-clamp-4">
                {r.text}
              </div>
            </motion.div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

const REVIEWS = [
  {
    name: "তানভীর",
    stars: "5.0",
    text: "মধুটা একেবারে খাঁটি—ঘ্রাণেই বোঝা যায়।",
  },
  { name: "রূপা", stars: "4.9", text: "চাল দারুণ, ভাত ফ্লাফি আর সুগন্ধি।" },
  {
    name: "নাসরিন আক্তার",
    rating: 5,
    text: "মধুর কোয়ালিটি দারুণ! আগে যেখানে কিনতাম সেখানে এমন স্বাদ পেতাম না। ডেলিভারিও দ্রুত ছিল।",
  },
  {
    name: "সাহেদুল ইসলাম",
    rating: 5,
    text: "দেশি চালের ভাতের ঘ্রাণ একেবারে গ্রামের মতো। দামও ন্যায্য, প্যাকেজিং ভালো।",
  },
  {
    name: "তন্ময় দে",
    rating: 4,
    text: "ঘি সত্যিই খাঁটি—চমৎকার সুবাস। কাস্টমার সাপোর্ট বিনয়ী ও সহায়ক।",
  },
];
