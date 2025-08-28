import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FcGoogle } from "react-icons/fc";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const { signIn, signInWithGoogle, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect
  useEffect(() => {
    if (user) navigate(from, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("ই-মেইল ও পাসওয়ার্ড দিন।");
      return;
    }
    try {
      await signIn(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError("লগইন ব্যর্থ হয়েছে। ই-মেইল বা পাসওয়ার্ড সঠিক নয়।");
      // console.error(err);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError("গুগল সাইন-ইন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।");
      // console.error(err);
    }
  };

  return (
    <section className="min-h-[80vh] bg-brand-surface grid place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white shadow-sm p-6 sm:p-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-brand-neutral-900">
            অ্যাকাউন্টে লগইন
          </h1>
          <p className="font-body text-sm text-brand-neutral-600 mt-2">
            খাঁটি পণ্যের দ্রুত অর্ডারের জন্য লগইন করুন
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="font-body text-sm text-brand-neutral-900">
              ই-মেইল ঠিকানা
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 font-body outline-none focus:border-brand-primary"
              placeholder="আপনার ই-মেইল লিখুন"
            />
          </div>

          <div>
            <label className="font-body text-sm text-brand-neutral-900">
              পাসওয়ার্ড
            </label>
            <div className="mt-1 relative">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 pr-20 font-body outline-none focus:border-brand-primary"
                placeholder="পাসওয়ার্ড দিন"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute inset-y-0 right-2 my-1 rounded-lg px-3 text-sm font-body text-brand-neutral-600 hover:text-brand-neutral-900"
                aria-label="পাসওয়ার্ড দেখুন/লুকান"
              >
                {showPass ? "লুকান" : "দেখুন"}
              </button>
            </div>
            <div className="text-right mt-1">
              <Link
                to="/reset-password"
                className="font-body text-xs text-brand-primary hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-body bg-brand-primary hover:bg-brand-primaryDark text-white rounded-xl px-4 py-3 transition disabled:opacity-60"
          >
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-brand-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 font-body text-sm text-brand-neutral-500">
              অথবা
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-secondary/60 px-4 py-3 font-body text-brand-neutral-900 hover:bg-brand-secondary transition disabled:opacity-60"
        >
          <FcGoogle className="text-xl" />
          গুগল দিয়ে সাইন-ইন
        </button>

        {/* Bottom help */}
        <p className="mt-6 text-center font-body text-sm text-brand-neutral-600">
          নতুন ব্যবহারকারী?{" "}
          <Link
            to="/registration"
            className="text-brand-primary hover:underline"
          >
            রেজিস্ট্রেশন করুন
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
