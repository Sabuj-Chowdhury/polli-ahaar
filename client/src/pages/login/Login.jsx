import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const { signIn, signInWithGoogle, loading } = useAuth(); // removed `user`
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("ই-মেইল ও পাসওয়ার্ড দিন।");
      return;
    }
    try {
      await signIn(form.email, form.password);
      toast.success("সফলভাবে লগইন হয়েছে!");
      navigate(from, { replace: true });
    } catch {
      toast.error("লগইন ব্যর্থ হয়েছে। ই-মেইল বা পাসওয়ার্ড সঠিক নয়।");
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      toast.success("গুগল লগইন সফল!");
      navigate(from, { replace: true });
    } catch {
      toast.error("গুগল সাইন-ইন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।");
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1606788075761-464cf71a5b15?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/90 shadow-lg p-8 backdrop-blur-md">
        <div className="text-center">
          <h1 className="noto-serif-bengali-normal text-2xl text-gray-900">
            অ্যাকাউন্টে লগইন
          </h1>
          <p className="hind-siliguri-regular mt-2 text-sm text-gray-600">
            খাঁটি পণ্যের দ্রুত অর্ডারের জন্য লগইন করুন
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              পাসওয়ার্ড
            </label>
            <div className="mt-1 relative">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-20 hind-siliguri-regular outline-none focus:border-green-600"
                placeholder="পাসওয়ার্ড দিন"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute inset-y-0 right-2 my-1 rounded-lg px-3 text-sm text-gray-600 hover:text-gray-900"
              >
                {showPass ? "লুকান" : "দেখুন"}
              </button>
            </div>
            <div className="text-right mt-1">
              <Link
                to="/reset-password"
                className="hind-siliguri-regular text-xs text-green-700 hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full hind-siliguri-medium bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-3 transition disabled:opacity-60"
          >
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
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

        {/* Google Sign In */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 hind-siliguri-medium text-gray-800 hover:bg-gray-100 transition disabled:opacity-60"
        >
          <FcGoogle className="text-xl" />
          গুগল দিয়ে সাইন-ইন
        </button>

        {/* Bottom help */}
        <p className="mt-6 text-center hind-siliguri-regular text-sm text-gray-600">
          নতুন ব্যবহারকারী?{" "}
          <Link to="/signup" className="text-green-700 hover:underline">
            রেজিস্ট্রেশন করুন
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
