import { useState } from "react";
import { Link, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";

const SignUp = () => {
  const { createUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    photo: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("সব ঘর পূরণ করুন।");
      return;
    }
    if (form.password.length < 6) {
      setError("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
      return;
    }
    if (form.password !== form.confirm) {
      setError("পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি।");
      return;
    }

    try {
      setLoading(true);
      const result = await createUser(form.email, form.password);
      if (result.user) {
        await updateUserProfile(form.name, form.photo);
        navigate("/"); // after signup redirect to home
      }
    } catch (err) {
      setError("রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] bg-brand-surface grid place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white shadow-sm p-6 sm:p-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-brand-neutral-900">
            নতুন অ্যাকাউন্ট খুলুন
          </h1>
          <p className="font-body text-sm text-brand-neutral-600 mt-2">
            খাঁটি পণ্য অর্ডার করতে এখনই নিবন্ধন করুন
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
              পূর্ণ নাম
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 font-body outline-none focus:border-brand-primary"
              placeholder="আপনার নাম লিখুন"
            />
          </div>

          <div>
            <label className="font-body text-sm text-brand-neutral-900">
              প্রোফাইল ছবি (ঐচ্ছিক)
            </label>
            <input
              type="text"
              name="photo"
              value={form.photo}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 font-body outline-none focus:border-brand-primary"
              placeholder="ছবির URL দিন"
            />
          </div>

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
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 font-body outline-none focus:border-brand-primary"
              placeholder="পাসওয়ার্ড দিন"
            />
          </div>

          <div>
            <label className="font-body text-sm text-brand-neutral-900">
              কনফার্ম পাসওয়ার্ড
            </label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 font-body outline-none focus:border-brand-primary"
              placeholder="আবার পাসওয়ার্ড দিন"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-body bg-brand-primary hover:bg-brand-primaryDark text-black rounded-xl px-4 py-3 transition disabled:opacity-60"
          >
            {loading ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্ট্রেশন করুন"}
          </button>
        </form>

        {/* Bottom help */}
        <p className="mt-6 text-center font-body text-sm text-brand-neutral-600">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link to="/login" className="text-black hover:underline">
            লগইন করুন
          </Link>
        </p>
      </div>
    </section>
  );
};

export default SignUp;
