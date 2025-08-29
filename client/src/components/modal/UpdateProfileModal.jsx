import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { TbFidgetSpinner } from "react-icons/tb";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { imageUpload } from "../../utils/imageBBApi";
import toast from "react-hot-toast";

const UpdateProfileModal = ({ open, onClose, profile, refetch }) => {
  const axiosSecure = useAxiosSecure();
  const { updateUserProfile } = useAuth();

  const { name, image, phone, address, _id } = profile || {};

  const [form, setForm] = useState({
    name: name || "",
    phone: phone || "",
    address: address || "",
  });
  const [imagePreview, setImagePreview] = useState(image || null);
  const [imageUrl, setImageUrl] = useState(image || "");
  const [loading, setLoading] = useState(false);

  // Sync form when modal opens / profile changes
  useEffect(() => {
    if (!open) return;
    setForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    });
    setImagePreview(profile?.image || null);
    setImageUrl(profile?.image || "");
  }, [open, profile]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // // Optional: size guard (2MB)
    // if (file.size > 2 * 1024 * 1024) {
    //   toast.error("ছবির সাইজ ২MB এর কম হতে হবে।");
    //   return;
    // }

    // Preview
    const url = URL.createObjectURL(file);
    setImagePreview(url);

    try {
      const hosted = await imageUpload(file); // returns hosted URL
      setImageUrl(hosted);
    } catch (err) {
      console.error(err);
      toast.error("ছবি আপলোড করা যায়নি।");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updateData = {
      name: form.name,
      image: imageUrl,
      phone: form.phone,
      address: form.address,
    };

    try {
      // 1) Firebase profile (displayName & photoURL)
      await updateUserProfile(form.name, imageUrl);

      // 2) Backend user doc
      await axiosSecure.patch(`/user/update/${_id}`, updateData);

      toast.success("প্রোফাইল আপডেট হয়েছে!");
      await refetch?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("প্রোফাইল আপডেট ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

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
                            src={imagePreview}
                            alt="preview"
                            className="w-full h-full object-cover"
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
                        ছবি বাছাই করুন
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
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="hind-siliguri-medium rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-2 inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
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
