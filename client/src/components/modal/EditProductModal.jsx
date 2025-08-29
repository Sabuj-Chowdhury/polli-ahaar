import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  CATEGORY_OPTIONS,
  TYPE_BY_CATEGORY,
  ORIGIN_OPTIONS,
  UNIT_OPTIONS,
} from "../../utils/productOptions";
import { imageUpload } from "../../utils/imageBBApi";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const EditProductModal = ({ product, isOpen, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      category: "",
      type: "",
      brand: "",
      originDistrict: "",
      description: "",
      variants: [],
      status: "active",
      featured: false,
      imageFile: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Prefill when modal opens / product changes
  useEffect(() => {
    if (product && isOpen) {
      reset({
        name: product.name || "",
        category: product.category || "",
        type: product.type || "",
        brand: product.brand || "",
        originDistrict: product.originDistrict || "",
        description: product.description || "",
        variants:
          (product.variants || []).map((v) => ({
            label: v.label ?? "",
            unit: v.unit ?? "কেজি",
            qty: typeof v.qty === "number" ? v.qty : 1,
            price: typeof v.price === "number" ? v.price : "",
            stock: typeof v.stock === "number" ? v.stock : 0,
          })) || [],
        status: product.status || "active",
        featured: !!product.featured,
        imageFile: null,
      });
      setImagePreview(product.image || null);
      setFileName("");
    }
  }, [product, isOpen, reset]);

  const selectedCategory = watch("category");
  const typeOptions = useMemo(
    () => (selectedCategory ? TYPE_BY_CATEGORY[selectedCategory] || [] : []),
    [selectedCategory]
  );

  // -------- image preview (blob) ----------
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const lastBlobRef = useRef(null);

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    setValue("imageFile", file || null);
    setFileName(file ? file.name : "");
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
      lastBlobRef.current = blobUrl;
      setImagePreview(blobUrl);
    } else {
      setImagePreview(product?.image || null);
    }
  };

  useEffect(() => {
    return () => {
      if (lastBlobRef.current) {
        URL.revokeObjectURL(lastBlobRef.current);
        lastBlobRef.current = null;
      }
    };
  }, []);

  const clearImage = () => {
    setValue("imageFile", null);
    setFileName("");
    setImagePreview(product?.image || null);
  };

  // ---------- MUTATION (optimistic) ----------
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      // PUT should return the updated product doc; if not, we’ll synthesize one
      const { data } = await axiosSecure.put(`/product/${id}`, payload);
      return data?.value || data || { _id: id, ...payload }; // support MongoDB findOneAndUpdate response or custom
    },
    onMutate: async ({ id, payload }) => {
      // cancel all products-admin queries while we update cache
      const queries = queryClient.getQueriesData({
        queryKey: ["products-admin"],
      });
      await Promise.all(
        queries.map(([key]) => queryClient.cancelQueries({ queryKey: key }))
      );

      // snapshot previous states for rollback
      const snapshots = queries.map(([key, old]) => ({ key, old }));

      // apply optimistic update across every cached page that has this product
      queries.forEach(([key, old]) => {
        if (!old?.items) return;
        const items = old.items.map((p) =>
          p._id === id
            ? {
                ...p,
                ...payload,
                // recompute minPrice to keep list sorting correct
                minPrice: Array.isArray(payload.variants)
                  ? Math.min(
                      ...payload.variants.map(
                        (v) => Number(v.price) || Infinity
                      )
                    )
                  : p.minPrice,
              }
            : p
        );
        queryClient.setQueryData(key, { ...old, items });
      });

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      // rollback to snapshots
      ctx?.snapshots?.forEach(({ key, old }) => {
        queryClient.setQueryData(key, old);
      });
      toast.error("পণ্য আপডেট ব্যর্থ হয়েছে।");
    },
    onSuccess: (updated) => {
      // ensure caches have the canonical updated product (covers cases where server tweaked data)
      const queries = queryClient.getQueriesData({
        queryKey: ["products-admin"],
      });
      queries.forEach(([key, old]) => {
        if (!old?.items) return;
        const items = old.items.map((p) =>
          p._id === updated._id ? updated : p
        );
        queryClient.setQueryData(key, { ...old, items });
      });
      toast.success("পণ্য সফলভাবে আপডেট হয়েছে!");
    },
    onSettled: () => {
      // revalidate from server (current page + any others)
      queryClient.invalidateQueries({ queryKey: ["products-admin"] });
    },
  });

  const onSubmit = async (data) => {
    try {
      let imageUrl = product.image;
      if (data.imageFile) {
        const url = await imageUpload(data.imageFile);
        if (!url) {
          toast.error("ছবি আপলোড ব্যর্থ হয়েছে।");
          return;
        }
        imageUrl = url;
      }

      const variants = (data.variants || [])
        .map((v) => ({
          label: v.label?.trim(),
          unit: v.unit,
          qty: Number(v.qty) || 0,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        }))
        .filter((v) => v.label && v.price > 0);

      if (!variants.length) {
        toast.error("অন্তত ১টি ভ্যারিয়েন্ট দিন।");
        return;
      }

      const payload = {
        name: data.name.trim(),
        category: data.category,
        type: data.type || null,
        brand: data.brand?.trim() || null,
        originDistrict: data.originDistrict || null,
        description: data.description?.trim() || "",
        image: imageUrl,
        variants,
        status: data.status,
        featured: !!data.featured,
      };

      await updateMutation.mutateAsync({ id: product._id, payload });
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error("পণ্য আপডেট ব্যর্থ হয়েছে।");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white max-w-3xl w-full p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">পণ্য সম্পাদনা করুন</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700">পণ্যের নাম</label>
              <input
                {...register("name", { required: "পণ্যের নাম দিন" })}
                placeholder="যেমন: কাটারিভোগ চাল"
                className="mt-1 border rounded w-full px-3 py-2 outline-none focus:border-green-600"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-700">ব্র্যান্ড/উৎপাদক</label>
              <input
                {...register("brand")}
                placeholder="যেমন: পুষ্টি"
                className="mt-1 border rounded w-full px-3 py-2 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">ক্যাটাগরি</label>
              <select
                {...register("category", { required: "ক্যাটাগরি দিন" })}
                className="mt-1 border rounded w-full px-3 py-2 outline-none focus:border-green-600"
              >
                <option value="">নির্বাচন করুন</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700">
                টাইপ/ভ্যারিয়েন্ট ধরণ
              </label>
              <select
                {...register("type")}
                disabled={!selectedCategory}
                className="mt-1 border rounded w-full px-3 py-2 outline-none disabled:bg-gray-100 focus:border-green-600"
              >
                <option value="">নির্বাচন করুন</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700">উৎস জেলা</label>
              <select
                {...register("originDistrict")}
                className="mt-1 border rounded w-full px-3 py-2 outline-none focus:border-green-600"
              >
                <option value="">নির্বাচন করুন</option>
                {ORIGIN_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700">স্ট্যাটাস</label>
              <select
                {...register("status")}
                className="mt-1 border rounded w-full px-3 py-2 outline-none focus:border-green-600"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <label className="mt-7 inline-flex items-center gap-2">
              <input type="checkbox" {...register("featured")} />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-700">বিবরণ</label>
            <textarea
              {...register("description")}
              rows={3}
              className="mt-1 border rounded w-full px-3 py-2 outline-none focus:border-green-600"
              placeholder="পণ্যের সংক্ষিপ্ত বিবরণ…"
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm text-gray-700 block mb-1">
              পণ্যের ছবি
            </label>

            <label
              htmlFor="editProductImage"
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-green-400 bg-green-50/40 p-4 hover:bg-green-50 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-700"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 0 0-.894.553L7.382 4H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-2.382l-.724-1.447A1 1 0 0 0 15 2H9zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  ছবি বাছাই করুন{" "}
                  <span className="text-gray-500">(JPG/PNG, &lt; 5MB)</span>
                </p>
                <p className="text-xs text-gray-500">
                  ক্লিক করুন বা ফাইল টেনে নিয়ে আসুন। নিচে প্রিভিউ দেখাবে।
                </p>
                {fileName && (
                  <p className="mt-1 text-xs text-gray-600">
                    নির্বাচিত ফাইল:{" "}
                    <span className="font-medium">{fileName}</span>
                  </p>
                )}
              </div>

              <span className="shrink-0 inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-white text-sm">
                Browse
              </span>
            </label>

            <input
              id="editProductImage"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="sr-only"
            />

            {imagePreview && (
              <div className="mt-3 flex items-center gap-4">
                <img
                  src={imagePreview}
                  alt="product preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="editProductImage"
                    className="cursor-pointer rounded-lg border border-green-300 px-3 py-1.5 text-sm hover:bg-green-50"
                  >
                    পরিবর্তন করুন
                  </label>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    ছবি মুছুন
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">ভ্যারিয়েন্টসমূহ</h3>
              <button
                type="button"
                onClick={() =>
                  append({
                    label: "",
                    unit: "কেজি",
                    qty: 1,
                    price: "",
                    stock: 0,
                  })
                }
                className="rounded-lg border border-green-300 px-3 py-1.5 text-sm hover:bg-green-50"
              >
                + নতুন ভ্যারিয়েন্ট
              </button>
            </div>

            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-white p-3 rounded-xl border border-gray-200"
                >
                  <div className="md:col-span-3">
                    <label className="text-sm text-gray-700">লেবেল</label>
                    <input
                      {...register(`variants.${idx}.label`, {
                        required: "লেবেল দিন",
                      })}
                      placeholder="১ কেজি / ৫ লিটার / ২৫ কেজি বস্তা"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">ইউনিট</label>
                    <select
                      {...register(`variants.${idx}.unit`)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">পরিমাণ</label>
                    <input
                      type="number"
                      step="any"
                      {...register(`variants.${idx}.qty`, { min: 0 })}
                      placeholder="1 / 0.5 / 25"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">দাম (৳)</label>
                    <input
                      type="number"
                      step="any"
                      {...register(`variants.${idx}.price`, {
                        required: "দাম দিন",
                        min: { value: 1, message: "দাম ১ টাকার বেশি হতে হবে" },
                      })}
                      placeholder="135"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
                    />
                    {errors?.variants?.[idx]?.price && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.variants[idx].price.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">স্টক</label>
                    <input
                      type="number"
                      {...register(`variants.${idx}.stock`, { min: 0 })}
                      placeholder="50"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
                    />
                  </div>

                  <div className="md:col-span-1 flex md:justify-end">
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg px-3 py-1.5"
                    >
                      মুছুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || updateMutation.isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
            >
              {isSubmitting || updateMutation.isLoading
                ? "আপডেট হচ্ছে…"
                : "আপডেট করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
