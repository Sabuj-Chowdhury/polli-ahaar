/* WhyChooseUs.jsx */
import { FiShield, FiTruck, FiRefreshCcw } from "react-icons/fi";
import { LuLeaf } from "react-icons/lu";

const features = [
  {
    icon: <FiShield className="h-6 w-6" aria-hidden="true" />,
    title: "১০০% খাঁটি পণ্য",
    desc: "বিশ্বস্ত উৎস থেকে সংগ্রহ—কোনো ভেজাল নয়, মান নিয়ন্ত্রণে আপোস নয়।",
  },
  {
    icon: <FiTruck className="h-6 w-6" aria-hidden="true" />,
    title: "সারা দেশে ডেলিভারি",
    desc: "দ্রুত ও নিরাপদ ডেলিভারি—শহর হোক বা গ্রাম, আপনার দোরগোড়ায়।",
  },
  {
    icon: <LuLeaf className="h-6 w-6" aria-hidden="true" />,
    title: "অর্গানিক ও স্বাস্থ্যসম্মত",
    desc: "প্রিজারভেটিভ-মুক্ত, প্রকৃতির আসল স্বাদ ও পুষ্টিগুণ অক্ষুণ্ন।",
  },
  {
    icon: <FiRefreshCcw className="h-6 w-6" aria-hidden="true" />,
    title: "সহজ রিটার্ন নীতি",
    desc: "প্রোডাক্ট নিয়ে সমস্যা? নির্দিষ্ট সময়ের ভিতর ঝামেলাহীন রিটার্ন।",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl tracking-tight text-brand-neutral-900">
            কেন আমাদের বেছে নেবেন?
          </h2>
          <p className="font-body mt-3 text-brand-neutral-600 leading-7">
            আমরা প্রতিশ্রুতি দিই খাঁটি, নিরাপদ ও ন্যায্য দামের গ্রামীণ
            খাদ্যপণ্য—আপনার পরিবারের জন্য।
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6 shadow-sm hover:shadow transition"
            >
              <div className="inline-flex items-center justify-center rounded-xl bg-brand-secondary text-brand-neutral-900 p-3">
                {f.icon}
                <span className="sr-only">{f.title}</span>
              </div>
              <h3 className="font-heading text-lg mt-4 text-brand-neutral-900">
                {f.title}
              </h3>
              <p className="font-body text-sm mt-2 text-brand-neutral-600 leading-6">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mt-10 rounded-2xl border border-brand-border bg-brand-secondary/60 px-6 py-5 text-center">
          <p className="hind-siliguri-regulary text-brand-neutral-900">
            খাঁটি পণ্যের নিশ্চয়তা পেতে এখনই অর্ডার করুন — আপনার স্বাস্থ্য,
            আমাদের অঙ্গীকার।
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
