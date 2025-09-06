// src/components/modal/ReviewModal.jsx
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import useAuth from "../../hooks/useAuth";

const ReviewModal = ({ order, onClose, onSubmit, submitting }) => {
  const { user } = useAuth(); // current user
  const [anonymous, setAnonymous] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Name logic
    const formName = fd.get("name")?.toString().trim();
    const fallbackName = user?.displayName || user?.name || "";
    const name = anonymous
      ? "Anonymous"
      : formName || fallbackName || "Anonymous";

    // Rating as a number (1..5)
    const stars = Math.max(1, Math.min(5, Number(fd.get("rating") || 5)));

    // Comment
    const text = fd.get("comment")?.toString().trim() || "";

    onSubmit({
      name,
      stars, // number (e.g., 4.5)
      text,
      anonymous, // boolean
      userEmail: user?.email || null, // pass along for backend
    });
  };

  return (
    <Transition.Root show={!!order} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-5 text-left align-middle shadow-xl transition-all border border-amber-200">
                <Dialog.Title
                  as="h3"
                  className="text-lg hind-siliguri-medium mb-3"
                >
                  রিভিউ দিন — অর্ডার #{String(order?._id || "").slice(-6)}
                </Dialog.Title>

                <form onSubmit={submit} className="space-y-3">
                  {/* Name (prefilled) */}
                  <label className="block text-sm">
                    নাম
                    <input
                      type="text"
                      name="name"
                      defaultValue={user?.displayName || user?.name || ""}
                      disabled={anonymous}
                      className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 disabled:bg-gray-100"
                    />
                  </label>

                  {/* Anonymous option */}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                    />
                    গোপন নাম (Anonymous) ব্যবহার করুন
                  </label>

                  {/* Rating */}
                  <label className="block text-sm">
                    রেটিং (১–৫)
                    <input
                      type="number"
                      name="rating"
                      min={1}
                      max={5}
                      step={0.5}
                      defaultValue={5}
                      className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </label>

                  {/* Comment */}
                  <label className="block text-sm">
                    মতামত (ঐচ্ছিক)
                    <textarea
                      name="comment"
                      rows={3}
                      placeholder="আপনার অভিজ্ঞতা লিখুন…"
                      className="mt-1 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </label>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border px-4 py-2"
                      disabled={submitting}
                    >
                      বন্ধ করুন
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-amber-600 text-white px-4 py-2 disabled:opacity-60"
                    >
                      {submitting ? "সাবমিট হচ্ছে…" : "সাবমিট করুন"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ReviewModal;
