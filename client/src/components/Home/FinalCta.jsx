/* FinalCta.jsx */
import { Link } from "react-router";

const FinalCta = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-secondary via-brand-surface to-brand-secondary/70" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-border bg-white/70 backdrop-blur px-6 py-10 sm:px-10 text-center shadow-sm">
          <h2 className="font-heading text-2xl sm:text-3xl tracking-tight text-brand-neutral-900">
            খাঁটি গ্রামের স্বাদ — এখন আপনার দোরগোড়ায়
          </h2>
          <p className="font-body mt-3 text-brand-neutral-600">
            মধু, চাল, ঘি, মশলা—সব কিছু এক জায়গায়। স্বাস্থ্যকর খাদ্য বেছে নিন
            আজই।
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="font-body bg-brand-primary hover:bg-brand-primaryDark text-black px-6 py-3 rounded-xl shadow"
            >
              এখনই অর্ডার করুন
            </Link>
            <Link
              to="/contact"
              className="font-body bg-brand-accent hover:bg-orange-600 text-black px-6 py-3 rounded-xl"
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
