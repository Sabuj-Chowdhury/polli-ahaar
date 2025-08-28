/* Testimonials.jsx */
import { AiFillStar } from "react-icons/ai";

const reviews = [
  {
    name: "নাসরিন আক্তার",
    text: "মধুর কোয়ালিটি দারুণ! আগে যেখানে কিনতাম সেখানে এমন স্বাদ পেতাম না। ডেলিভারিও দ্রুত ছিল।",
    rating: 5,
  },
  {
    name: "সাহেদুল ইসলাম",
    text: "দেশি চালের ভাতের ঘ্রাণ একেবারে গ্রামের মতো। দামও ন্যায্য, প্যাকেজিং ভালো।",
    rating: 5,
  },
  {
    name: "তন্ময় দে",
    text: "ঘি সত্যিই খাঁটি—চমৎকার সুবাস। কাস্টমার সাপোর্ট বিনয়ী ও সহায়ক।",
    rating: 4,
  },
];

const StarRow = ({ count = 5 }) => (
  <div className="flex items-center gap-1 text-brand-accent" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <AiFillStar key={i} className="h-5 w-5" />
    ))}
  </div>
);

const Testimonials = () => {
  return (
    <section className="bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl tracking-tight text-brand-neutral-900">
            গ্রাহকদের মতামত
          </h2>
          <p className="font-body mt-3 text-brand-neutral-600">
            আমাদের পণ্যের গুণগত মানের কথা বলছেন আপনাদের মতো গ্রাহকরাই।
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((r, idx) => (
            <article
              key={idx}
              className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm"
            >
              <span className="sr-only">{`${r.name} এর রেটিং ${r.rating} তারকা`}</span>
              <StarRow count={r.rating} />
              <p className="font-body mt-3 text-brand-neutral-600 leading-7">
                “{r.text}”
              </p>
              <p className="font-body mt-4 font-semibold text-brand-neutral-900">
                — {r.name}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
