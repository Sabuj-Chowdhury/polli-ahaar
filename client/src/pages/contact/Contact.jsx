// src/pages/Contact.jsx
import { motion } from "framer-motion";
import {
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaFacebookF,
} from "react-icons/fa";

const Contact = () => {
  return (
    <section className="px-4 py-10 sm:py-16 max-w-5xl mx-auto">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="text-center mb-10"
      >
        <h1 className="noto-serif-bengali-normal text-3xl sm:text-4xl">
          যোগাযোগ করুন
        </h1>
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-3 block h-[3px] w-24 mx-auto bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"
        />
        <p className="hind-siliguri-regular text-gray-600 text-sm mt-3">
          যেকোনো প্রশ্ন, অর্ডার বা সহযোগিতার জন্য সরাসরি আমাদের সাথে যোগাযোগ
          করুন।
        </p>
      </motion.div>

      {/* Contact Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* WhatsApp */}
        <ContactCard
          icon={<FaWhatsapp className="text-green-600 text-2xl" />}
          title="WhatsApp"
          value="+880 1887-640827"
          link="https://wa.me/8801887640827"
          action="চ্যাট করুন"
        />

        {/* Phone */}
        <ContactCard
          icon={<FaPhoneAlt className="text-green-600 text-2xl" />}
          title="ফোন"
          value="+880 1887-640827"
          link="tel:+8801887640827"
          action="এখনই কল করুন"
        />

        {/* Address */}
        <ContactCard
          icon={<FaMapMarkerAlt className="text-green-600 text-2xl" />}
          title="ঠিকানা"
          value="দোকান নং ১, দস্ত মোহাম্মদ বিল্ডিং, 
          ৫৩/এ কাজেম আলী বাই লেন, খলিফাপট্টি, চট্টগ্রাম"
        />

        {/* Facebook */}
        <ContactCard
          icon={<FaFacebookF className="text-green-600 text-2xl" />}
          title="Facebook"
          value="Palli Ahar Chittagong"
          link="https://www.facebook.com/PalliAharChittagong"
          action="পেজ দেখুন"
        />
      </div>
    </section>
  );
};

const ContactCard = ({ icon, title, value, link, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ type: "spring", stiffness: 180, damping: 20 }}
    className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm hover:shadow-md transition"
  >
    <div className="flex items-center gap-3">
      {icon}
      <h3 className="noto-serif-bengali-normal text-lg">{title}</h3>
    </div>
    <p className="hind-siliguri-regular text-gray-700 mt-3 whitespace-pre-line">
      {value}
    </p>
    {link && (
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="hind-siliguri-medium mt-3 inline-block rounded-xl bg-green-600 text-white px-4 py-2 text-sm hover:bg-green-700 transition"
      >
        {action}
      </a>
    )}
  </motion.div>
);

export default Contact;
