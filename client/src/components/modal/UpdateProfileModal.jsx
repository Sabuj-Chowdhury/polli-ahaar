import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { TbFidgetSpinner } from "react-icons/tb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { imageUpload } from "../../utils/imageBBApi";
import toast from "react-hot-toast";

/**
 * Props:
 * - open, onClose
 * - profile: {_id, name, image, phone, address, email ...}
 * - refetch?: optional parent refetch
 */

const UpdateProfileModal = ({ open, onClose, profile, refetch }) => {
  const axiosSecure = useAxiosSecure();
  const { updateUserProfile } = useAuth();
  const queryClient = useQueryClient();

  const userId = profile?._id;

  // ---- Local form state ----
  const [form, setForm] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
  });

  // `imageUrl` is the hosted URL we’ll save to DB
  const [imageUrl, setImageUrl] = useState(profile?.image || "");
  // `imagePreview` is what <img> uses (can be blob: or http(s))
  const [imagePreview, setImagePreview] = useState(profile?.image || "");
  const [uploadingImg, setUploadingImg] = useState(false);

  // keep track of last blob to revoke
  const lastBlobRef = useRef(null);

  // Force re-fetch of http(s) images (not blob:)
  const cacheBust = useMemo(() => Date.now(), []);
  const withCacheBust = (url, bust) =>
    /^https?:\/\//i.test(url)
      ? `${url}${url.includes("?") ? "&" : "?"}t=${bust}`
      : url;

  // Sync when opened / profile changes
  useEffect(() => {
    if (!open) return;
    setForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    });
    setImageUrl(profile?.image || "");
    setImagePreview(profile?.image || "");
  }, [open, profile]);

  // Revoke any leftover blob on unmount
  useEffect(() => {
    return () => {
      if (lastBlobRef.current) {
        URL.revokeObjectURL(lastBlobRef.current);
        lastBlobRef.current = null;
      }
    };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview blob and revoke the old one
    const blobUrl = URL.createObjectURL(file);
    if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
    lastBlobRef.current = blobUrl;
    setImagePreview(blobUrl);

    try {
      setUploadingImg(true);
      const hosted = await imageUpload(file); // must return http(s) URL
      setImageUrl(hosted);
      // switch preview to hosted (so we see the real URL), with cache-bust
      setImagePreview(
        `${hosted}${hosted.includes("?") ? "&" : "?"}t=${Date.now()}`
      );
      // we can now revoke the temp blob
      if (lastBlobRef.current) {
        URL.revokeObjectURL(lastBlobRef.current);
        lastBlobRef.current = null;
      }
    } catch (err) {
      console.error(err);
      toast.error("ছবি আপলোড করা যায়নি।");
      // keep the previous preview (if any)
    } finally {
      setUploadingImg(false);
    }
  };

  // ---- Mutation: update profile ----
  const mutation = useMutation({
    mutationFn: async (payload) => {
      // 1) Firebase profile (displayName & photoURL)
      await updateUserProfile(payload.name, payload.image);
      // 2) Backend user doc (expect it to return updated user doc)
      const { data } = await axiosSecure.patch(
        `/user/update/${userId}`,
        payload
      );
      return data;
    },
    onSuccess: (updated) => {
      // Update caches so UI reflects instantly
      queryClient.setQueryData(["user", userId], (old) => ({
        ...(old || {}),
        ...(updated || {}),
        image: updated?.image
          ? `${updated.image}${
              updated.image.includes("?") ? "&" : "?"
            }t=${Date.now()}`
          : updated?.image,
      }));

      // Invalidate any other consumers of the profile
      queryClient.invalidateQueries({ queryKey: ["me"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["user", userId],
        exact: false,
      });

      refetch?.(); // in case parent holds other derived data

      toast.success("প্রোফাইল আপডেট হয়েছে!");
      onClose();
    },
    onError: (err) => {
      console.error(err);
      toast.error("প্রোফাইল আপডেট ব্যর্থ হয়েছে।");
    },
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    if (uploadingImg) {
      toast("ছবি আপলোড হচ্ছে… একটু অপেক্ষা করুন।");
      return;
    }
    mutation.mutate({
      name: form.name,
      image: imageUrl,
      phone: form.phone,
      address: form.address,
    });
  };

  const busy = mutation.isLoading || uploadingImg;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
        </Transition.Child>

        {/* Panel wrapper */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Panel */}
            <Transition.Child
              as={Fragment}
              enter="transition-all duration-200"
              enterFrom="opacity-0 translate-y-2 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="transition-all duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-2 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-2xl border border-green-200 bg-white shadow-xl">
                {/* Header */}
                <div className="px-5 pt-5">
                  <Dialog.Title className="noto-serif-bengali-normal text-xl text-green-800">
                    প্রোফাইল আপডেট করুন
                  </Dialog.Title>
                </div>

                {/* Body */}
                <form onSubmit={handleUpdate} className="px-5 pb-5 pt-4">
                  <div className="space-y-5">
                    {/* Avatar + uploader */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-24 h-24 rounded-full bg-gray-100 border overflow-hidden shadow">
                        {imagePreview ? (
                          <img
                            src={withCacheBust(imagePreview, cacheBust)}
                            alt="avatar"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // fallback (keeps circle)
                              e.currentTarget.src =
                                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' fill='%23eee'/></svg>";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}
                      </div>

                      <label
                        htmlFor="photo"
                        className="cursor-pointer hind-siliguri-medium rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-green-50 hover:border-green-400 transition"
                      >
                        {uploadingImg ? "আপলোড হচ্ছে…" : "ছবি বাছাই করুন"}
                      </label>
                      <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="hind-siliguri-medium text-sm text-gray-800">
                        নাম
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-green-600 hind-siliguri-regular"
                        placeholder="আপনার নাম"
                      />
                    </div>

                    {/* Phone + Address */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="hind-siliguri-medium text-sm text-gray-800">
                          ফোন
                        </label>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={onChange}
                          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-green-600 hind-siliguri-regular"
                          placeholder="ফোন নম্বর"
                        />
                      </div>
                      <div>
                        <label className="hind-siliguri-medium text-sm text-gray-800">
                          ঠিকানা
                        </label>
                        <input
                          name="address"
                          value={form.address}
                          onChange={onChange}
                          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-green-600 hind-siliguri-regular"
                          placeholder="আপনার ঠিকানা"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="hind-siliguri-medium rounded-xl border border-gray-300 px-4 py-2 hover:bg-gray-50"
                      disabled={busy}
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="hind-siliguri-medium rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-2 inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      {busy ? (
                        <>
                          <TbFidgetSpinner className="animate-spin" />
                          সেভ হচ্ছে...
                        </>
                      ) : (
                        "সেভ করুন"
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UpdateProfileModal;
