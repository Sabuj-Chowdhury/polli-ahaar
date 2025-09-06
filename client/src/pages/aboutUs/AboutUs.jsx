// src/pages/AboutUs.jsx
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <section className="px-4 py-10 sm:py-16 max-w-5xl mx-auto">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="text-center mb-8"
      >
        <h1 className="noto-serif-bengali-normal text-3xl sm:text-4xl">
          আমাদের সম্পর্কে
        </h1>
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-3 block h-[3px] w-24 mx-auto bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"
        />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="hind-siliguri-regular text-gray-700 space-y-4 leading-relaxed text-center sm:text-left"
      >
        <p>
          <span className="hind-siliguri-semibold">পল্লী আহার</span> শুরু হয়েছে
          একটি প্রতিশ্রুতি নিয়ে—গ্রামের খাঁটি স্বাদ ও নিরাপদ খাদ্য পৌঁছে দেওয়া
          আপনার ঘরে। আমরা বিশ্বাস করি, খাদ্যের গুণমান শুধু স্বাদের নয়,
          স্বাস্থ্যের সাথেও গভীরভাবে যুক্ত।
        </p>
        <p>
          আমাদের সংগ্রহে রয়েছে মধু, দেশি চাল, ঘি, মশলা এবং আরও অনেক গ্রামীণ
          খাদ্যপণ্য, যা আমরা সরাসরি কৃষক ও বিশ্বস্ত উৎপাদকদের কাছ থেকে সংগ্রহ
          করি। প্রতিটি ধাপেই রয়েছে{" "}
          <span className="hind-siliguri-semibold">গুণগত মান যাচাই</span>—যাতে
          আপনি পান আসল ও বিশুদ্ধ পণ্য।
        </p>
        <p>
          খাঁটি, স্বাস্থ্যসম্মত এবং ন্যায্য দামের পণ্য দিয়ে আপনার পরিবারকে
          সুস্থ রাখা—এটাই আমাদের অঙ্গীকার।
        </p>
      </motion.div>
    </section>
  );
};

export default AboutUs;
