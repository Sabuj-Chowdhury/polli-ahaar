import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import useAuth from "../../hooks/useAuth";
import { imageUpload } from "../../utils/imageBBApi.js";

const SignUp = () => {
  const { createUser, updateUserProfile, logOut, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      toast.error("ছবির সাইজ ২MB এর কম হতে হবে।");
      return;
    }
    setFile(f);
    setSelectedImage(URL.createObjectURL(f));
    setFileName(f.name);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      toast.error("ছবির সাইজ ২MB এর কম হতে হবে।");
      return;
    }
    setFile(f);
    setSelectedImage(URL.createObjectURL(f));
    setFileName(f.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("সব ঘর পূরণ করুন।");
      return;
    }
    if (form.password.length < 6) {
      toast.error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি।");
      return;
    }

    try {
      setLoading(true);

      let photoURL = "";
      if (file) {
        photoURL = await imageUpload(file);
      }

      const result = await createUser(form.email, form.password);
      if (result?.user) {
        await updateUserProfile(form.name, photoURL);
        await logOut(); // ✅ auto logout after signup
        toast.success("রেজিস্ট্রেশন সফল! এখন লগইন করুন।");
        navigate("/login");
      }
    } catch {
      toast.error("রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      toast.success("গুগল দিয়ে রেজিস্ট্রেশন সফল!");
      navigate("/");
    } catch {
      toast.error("গুগল সাইন-আপ সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।");
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white/90 shadow-xl p-8 backdrop-blur-md m-5">
        <div className="text-center">
          <h1 className="noto-serif-bengali-normal text-2xl text-gray-900">
            নতুন অ্যাকাউন্ট খুলুন
          </h1>
          <p className="hind-siliguri-regular mt-2 text-sm text-gray-600">
            খাঁটি পণ্য অর্ডার করতে এখনই নিবন্ধন করুন
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              পূর্ণ নাম
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 hind-siliguri-regular outline-none focus:border-green-600"
              placeholder="আপনার নাম লিখুন"
            />
          </div>

          {/* Profile Image (custom uploader) */}
          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              প্রোফাইল ছবি
            </label>

            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />

            <label
              htmlFor="photo"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="mt-1 group flex items-center gap-3 rounded-xl border border-gray-300 bg-white/80 px-3 py-2.5 cursor-pointer hover:border-green-600 transition"
            >
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-gray-400">
                    <path
                      fill="currentColor"
                      d="M9 3l-1.5 2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-2.5L15 3H9zm3 14a4 4 0 110-8 4 4 0 010 8z"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <p className="hind-siliguri-medium text-sm text-gray-800 truncate">
                  {fileName || "ছবি নির্বাচন করুন বা টেনে এনে ছেড়ে দিন"}
                </p>
                <p className="hind-siliguri-regular text-xs text-gray-500">
                  JPG/PNG • সর্বোচ্চ ২MB
                </p>
              </div>

              <span className="hind-siliguri-medium text-sm rounded-lg border border-gray-300 px-3 py-1 text-gray-700 group-hover:bg-green-600 group-hover:text-white transition">
                বাছাই করুন
              </span>
            </label>

            {selectedImage && (
              <div className="mt-2 flex items-center justify-between">
                <span className="hind-siliguri-regular text-xs text-gray-500 truncate">
                  নির্বাচিত: {fileName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setSelectedImage(null);
                    setFileName("");
                  }}
                  className="hind-siliguri-regular text-xs text-red-600 hover:underline"
                >
                  ছবি মুছুন
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              ই-মেইল ঠিকানা
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 hind-siliguri-regular outline-none focus:border-green-600"
              placeholder="আপনার ই-মেইল লিখুন"
            />
          </div>

          {/* Password */}
          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 hind-siliguri-regular outline-none focus:border-green-600"
              placeholder="পাসওয়ার্ড দিন"
            />
          </div>

          {/* Confirm */}
          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              কনফার্ম পাসওয়ার্ড
            </label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 hind-siliguri-regular outline-none focus:border-green-600"
              placeholder="আবার পাসওয়ার্ড দিন"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full hind-siliguri-medium bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-3 transition disabled:opacity-60"
          >
            {loading ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্ট্রেশন করুন"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white/90 px-3 hind-siliguri-regular text-sm text-gray-500">
              অথবা
            </span>
          </div>
        </div>

        {/* Google Sign Up */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 hind-siliguri-medium text-gray-800 hover:bg-gray-100 transition disabled:opacity-60"
        >
          <FcGoogle className="text-xl" />
          গুগল দিয়ে সাইন-আপ
        </button>

        <p className="mt-6 text-center hind-siliguri-regular text-sm text-gray-600">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link to="/login" className="text-green-700 hover:underline">
            লগইন করুন
          </Link>
        </p>
      </div>
    </section>
  );
};

export default SignUp;
