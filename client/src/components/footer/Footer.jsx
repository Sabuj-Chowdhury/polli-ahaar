// src/components/Footer.jsx
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-green-50 via-green-100 to-green-50 text-gray-800">
      {/* Top CTA band */}
      <div className="border-b border-green-200">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          className="mx-auto max-w-7xl px-4 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="text-center sm:text-left">
            <h2 className="noto-serif-bengali-normal text-2xl">
              আমাদের ফেসবুক পরিবারে যোগ দিন
            </h2>
            <p className="hind-siliguri-regular mt-1 text-sm text-gray-600">
              নতুন অফার ও আপডেট জানতে আমাদের ফলো করুন।
            </p>
          </div>

          <motion.a
            href="https://www.facebook.com/PalliAharChittagong"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="hind-siliguri-semibold inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 text-white text-sm shadow-sm hover:shadow-md transition"
            aria-label="ফেসবুক পেজ ফলো করুন"
            title="ফেসবুক পেজ ফলো করুন"
          >
            <FaFacebookF /> ফেসবুক পেজ ফলো করুন
          </motion.a>
        </motion.div>
      </div>

      {/* Main footer */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="mx-auto max-w-7xl px-4 py-12 sm:py-16"
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand / About */}
          <div>
            <h2 className="noto-serif-bengali-normal text-xl">পল্লী আহার</h2>
            <p className="hind-siliguri-regular mt-3 text-sm leading-7 text-gray-700">
              খাঁটি মধু, দেশি চাল, ঘি ও মশলা—গ্রামীণ স্বাদের আসল ঠিকানা। বিশুদ্ধ
              ও নিরাপদ খাদ্য, সারা দেশে ডেলিভারি।
            </p>

            {/* Social */}
            <div className="mt-4 flex items-center gap-3">
              <IconLink
                href="https://www.facebook.com/PalliAharChittagong"
                label="Facebook"
              >
                <FaFacebookF />
              </IconLink>
              <IconLink href="https://instagram.com" label="Instagram">
                <FaInstagram />
              </IconLink>
              <IconLink href="https://wa.me/8801887640827" label="WhatsApp">
                <FaWhatsapp />
              </IconLink>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="noto-serif-bengali-normal text-lg">নেভিগেশন</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <NavLink to="/">হোম</NavLink>
              </li>
              <li>
                <NavLink to="/all-products">পণ্যসমূহ</NavLink>
                {/* If your route is /all-products, change to to="/all-products" */}
              </li>
              <li>
                <NavLink to="/about">আমাদের সম্পর্কে</NavLink>
              </li>
              <li>
                <NavLink to="/contact">যোগাযোগ</NavLink>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="noto-serif-bengali-normal text-lg">যোগাযোগ</h3>
            <div className="mt-3 space-y-3 text-sm">
              <p className="hind-siliguri-regular flex items-start gap-2 text-gray-700">
                <FaMapMarkerAlt className="mt-1 text-green-700" />
                দোকান নং ১, দস্ত মোহাম্মদ বিল্ডিং, ৫৩/এ কাজেম আলী বাই লেন,
                খলিফাপট্টি, চট্টগ্রাম
              </p>
              <p className="hind-siliguri-regular flex items-center gap-2">
                <FaPhoneAlt className="text-green-700" />
                <a
                  href="tel:+8801887640827"
                  className="hover:text-green-700 transition"
                >
                  +880 1887-640827
                </a>
              </p>
              <p className="hind-siliguri-regular flex items-center gap-2">
                <FaEnvelope className="text-green-700" />
                <a
                  href="mailto:info@polliahar.com"
                  className="hover:text-green-700 transition"
                >
                  info@polliahar.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-green-200 pt-6 text-center">
          <p className="hind-siliguri-regular text-xs text-gray-600">
            © {new Date().getFullYear()} পল্লী আহার — সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

const NavLink = ({ to, children }) => (
  <motion.div
    whileHover={{ x: 2 }}
    whileTap={{ scale: 0.98 }}
    className="inline-block"
  >
    <Link
      to={to}
      className="hind-siliguri-regular text-sm hover:text-green-700 transition"
    >
      {children}
    </Link>
  </motion.div>
);

const IconLink = ({ href, label, children }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.96 }}
    className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-green-200 bg-white hover:bg-green-600 hover:text-white transition"
  >
    {children}
    <span className="sr-only">{label}</span>
  </motion.a>
);

export default Footer;
