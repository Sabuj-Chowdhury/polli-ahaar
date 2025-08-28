/* Hero.jsx */
import { Link } from "react-router";

const Hero = () => {
  return (
    <section className="bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: copy */}
        <div>
          <h1 className="font-noto-serif-bengali-normal text-3xl sm:text-4xl tracking-tight text-brand-neutral-900">
            গ্রামীণ স্বাদের আসল ঠিকানা
          </h1>
          <p className="font-body mt-4 text-brand-neutral-600 leading-7">
            খাঁটি মধু, দেশি চাল, ঘি ও মশলার বিশুদ্ধ সংগ্রহ—এখন ঘরে বসেই। ন্যায্য
            দামে, যত্নে প্যাকেজিং, সারা দেশে ডেলিভারি।
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/shop"
              className="font-body bg-brand-primary hover:bg-brand-primaryDark text-black px-6 py-3 rounded-xl shadow transition"
            >
              অর্ডার করুন
            </Link>
            <Link
              to="/about"
              className="font-body bg-brand-accent hover:bg-orange-600 text-Black px-6 py-3 rounded-xl transition"
            >
              কেন আমরা খাঁটি?
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-body">
            <span className="bg-brand-secondary text-brand-neutral-900 px-3 py-1 rounded-lg">
              ১০০% খাঁটি পণ্য
            </span>
            <span className="bg-brand-secondary text-brand-neutral-900 px-3 py-1 rounded-lg">
              সারা দেশে ডেলিভারি
            </span>
            <span className="bg-brand-secondary text-brand-neutral-900 px-3 py-1 rounded-lg">
              ফেরতযোগ্য নীতি
            </span>
          </div>
        </div>

        {/* Right: image */}
        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-2xl border border-brand-border bg-white shadow-sm overflow-hidden">
            {/* Replace the src with your real hero image */}
            <img
              src="https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1400&auto=format&fit=crop"
              alt="খাঁটি মধু ও গ্রামীণ পণ্যের সংগ্রহ"
              className="h-full w-full object-cover"
            />
          </div>
          {/* Decorative pill */}
          <div className="absolute -bottom-4 left-4 bg-white border border-brand-border rounded-xl px-4 py-2 shadow-sm">
            <p className="font-body text-sm">⭐ ২.৬কে+ গ্রাহকের ভালোবাসা</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
