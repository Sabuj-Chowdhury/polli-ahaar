/* Footer.jsx */
import { Link } from "react-router";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-brand-neutral-900 text-brand-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div>
            <h2 className="font-heading text-xl text-white">পল্লী আহার</h2>
            <p className="font-body mt-3 text-sm text-brand-neutral-300 leading-6">
              খাঁটি মধু, দেশি চাল, ঘি ও মশলা—গ্রামীণ স্বাদের আসল ঠিকানা। বিশুদ্ধ
              ও নিরাপদ খাদ্য, সারা দেশে ডেলিভারি।
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading text-lg text-white">নেভিগেশন</h3>
            <ul className="mt-3 space-y-2 font-body text-sm">
              <li>
                <Link to="/shop" className="hover:text-brand-accent transition">
                  পণ্যসমূহ
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-brand-accent transition"
                >
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-brand-accent transition">
                  ব্লগ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-brand-accent transition"
                >
                  যোগাযোগ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-heading text-lg text-white">কাস্টমার কেয়ার</h3>
            <ul className="mt-3 space-y-2 font-body text-sm">
              <li>
                <Link to="/faq" className="hover:text-brand-accent transition">
                  সাধারণ জিজ্ঞাসা
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-brand-accent transition"
                >
                  রিটার্ন নীতি
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-brand-accent transition"
                >
                  ডেলিভারি তথ্য
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-brand-accent transition"
                >
                  শর্তাবলী
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-heading text-lg text-white">যোগাযোগ</h3>
            <p className="font-body mt-3 text-sm text-brand-neutral-300">
              দোকান নং ১, দস্ত মোহাম্মদ বিল্ডিং, ৫৩/এ কাজেম আলী বাই লেন,
              খলিফাপট্টি, চট্টগ্রাম
            </p>
            <p className="font-body mt-2 text-sm">
              📞{" "}
              <a href="tel:+8801887640827" className="hover:text-brand-accent">
                +880 1887-640827
              </a>
            </p>
            <p className="font-body text-sm">
              ✉️{" "}
              <a
                href="mailto:info@polliahar.com"
                className="hover:text-brand-accent"
              >
                info@polliahar.com
              </a>
            </p>

            <div className="mt-4 flex gap-4 text-lg">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-accent"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-accent"
              >
                <FaInstagram />
              </a>
              <a
                href="https://wa.me/8801887640827"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-accent"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-brand-border/20 pt-6 text-center">
          <p className="font-body text-xs text-brand-neutral-400">
            © {new Date().getFullYear()} পল্লী আহার — সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
