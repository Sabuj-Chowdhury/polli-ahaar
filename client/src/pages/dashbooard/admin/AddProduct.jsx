import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { imageUpload } from "../../../utils/imageBBApi";
import SectionTitle from "../../../components/sectionTitle/SectionTitle";

const CATEGORY_OPTIONS = [
  { value: "rice", label: "চাল" },
  { value: "oil", label: "তেল" },
  { value: "spice", label: "মশলা" },
  { value: "honey", label: "মধু" },
  { value: "sugar", label: "চিনি" },
  { value: "dal", label: "ডাল" },
  { value: "tea", label: "চা পাতা" },
  { value: "snacks", label: "স্ন্যাকস/অন্যান্য" },
  { value: "pantry", label: "প্যান্ট্রি" },
];

const TYPE_BY_CATEGORY = {
  rice: ["কাটারিভোগ", "চিনিগুঁড়া", "আতপ"],
  oil: ["সয়াবিন (পুষ্টি)", "সরিষার তেল"],
  spice: [
    "হলুদ",
    "মরিচ (মিষ্টি)",
    "মরিচ (ঝাল)",
    "মরিচ (মিষ্টি-ঝাল)",
    "ধনিয়া গুঁড়া",
    "জিরা গুঁড়া",
    "মেজবানী মসলা",
  ],
  honey: ["সরিষা ফুল", "লিচু ফুল", "গরান", "চাকের মধু"],
  sugar: ["আখের চিনি", "সাদা চিনি"],
  dal: ["মসুর (দেশি)", "মসুর (ইন্ডিয়ান)", "মসুর (মোটা)", "মাসকলাই", "মটর"],
  tea: ["ফটিকছড়ি চা"],
  snacks: ["আমসত্ত্ব (মিষ্টি)", "আমসত্ত্ব (মিষ্টি-টক)", "পাপড়"],
  pantry: ["আটা (পুষ্টি)", "ময়দা (পুষ্টি)", "লবণ", "সুজি"],
};

const ORIGIN_OPTIONS = [
  "দিনাজপুর",
  "নাটোর",
  "রাজবাড়ী",
  "চুয়াডাঙ্গা",
  "ফটিকছড়ি",
  "সুন্দরবন",
  "লোকাল বাজার",
  "রাজশাহী",
  "চট্টগ্রাম",
];

const UNIT_OPTIONS = ["গ্রাম", "কেজি", "লিটার", "পিস", "বস্তা"];

const AddProduct = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      category: "",
      type: "",
      brand: "",
      originDistrict: "",
      description: "",
      variants: [
        { label: "১ কেজি", unit: "কেজি", qty: 1, price: "", stock: 0 },
      ],
      status: "active",
      featured: false,
      imageFile: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const selectedCategory = watch("category");
  const typeOptions = useMemo(
    () => (selectedCategory ? TYPE_BY_CATEGORY[selectedCategory] || [] : []),
    [selectedCategory]
  );

  useEffect(() => {
    const currentType = watch("type");
    if (currentType && !typeOptions.includes(currentType)) setValue("type", "");
  }, [typeOptions, setValue, watch]);

  // single image handling
  const [imagePreview, setImagePreview] = useState(null);
  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    setValue("imageFile", file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const clearImage = () => {
    setValue("imageFile", null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
    try {
      // upload the single image (if provided)
      let imageUrl = "";
      if (data.imageFile) {
        imageUrl = await imageUpload(data.imageFile);
        if (!imageUrl) {
          toast.error("ছবি আপলোড ব্যর্থ হয়েছে।");
          return;
        }
      } else {
        toast.error("একটি পণ্যের ছবি যুক্ত করুন।");
        return;
      }

      // sanitize variants
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
        toast.error("অন্তত ১টি ভ্যারিয়েন্ট যোগ করুন (সঠিক দামসহ)।");
        return;
      }

      const payload = {
        name: data.name.trim(),
        category: data.category,
        type: data.type || null,
        brand: data.brand?.trim() || null,
        originDistrict: data.originDistrict || null,
        description: data.description?.trim() || "",
        image: imageUrl, // ← single image URL
        variants,
        status: data.status,
        featured: !!data.featured,
        orderCount: 0,
      };

      await axiosSecure.post("/add-product", payload);
      toast.success("পণ্য সফলভাবে যোগ হয়েছে!");
      reset();
      setImagePreview(null);
      navigate("/dashboard/manage-products");
    } catch (err) {
      console.error(err);
      toast.error("পণ্য যোগ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <SectionTitle heading="পণ্য যোগ করুন" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-green-50/40 p-6 rounded-2xl border border-green-200 shadow-sm space-y-6"
      >
        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              পণ্যের নাম
            </label>
            <input
              {...register("name", { required: "পণ্যের নাম দিন" })}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-green-600"
              placeholder="যেমন: কাটারিভোগ চাল"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              ব্র্যান্ড/উৎপাদক (ঐচ্ছিক)
            </label>
            <input
              {...register("brand")}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-green-600"
              placeholder="যেমন: পুষ্টি"
            />
          </div>

          {/* Category */}
          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              ক্যাটাগরি
            </label>
            <select
              {...register("category", { required: "ক্যাটাগরি নির্বাচন করুন" })}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-green-600"
            >
              <option value="">নির্বাচন করুন</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              টাইপ/ভ্যারিয়েন্ট ধরণ (ঐচ্ছিক)
            </label>
            <select
              {...register("type")}
              disabled={!selectedCategory}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none disabled:bg-gray-100 focus:border-green-600"
            >
              <option value="">নির্বাচন করুন</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Origin */}
          <div>
            <label className="hind-siliguri-medium text-sm text-gray-800">
              উৎস জেলা (ঐচ্ছিক)
            </label>
            <select
              {...register("originDistrict")}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-green-600"
            >
              <option value="">নির্বাচন করুন</option>
              {ORIGIN_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {/* Status & Featured */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="hind-siliguri-medium text-sm text-gray-800">
                স্ট্যাটাস
              </label>
              <select
                {...register("status")}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-green-600"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <label className="flex items-center gap-2 mt-7">
              <input type="checkbox" {...register("featured")} />
              <span className="text-sm text-gray-800">Featured</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="hind-siliguri-medium text-sm text-gray-800">
            বিবরণ (ঐচ্ছিক)
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-green-600"
            placeholder="পণ্যের সংক্ষিপ্ত বিবরণ…"
          />
        </div>

        {/* Single Image (better UI) */}
        <div>
          <label
            htmlFor="productImage"
            className="hind-siliguri-medium text-sm text-gray-800"
          >
            পণ্যের ছবি
          </label>

          {/* Clickable upload card */}
          <label
            htmlFor="productImage"
            className="mt-1 block w-full cursor-pointer rounded-xl border border-dashed border-green-300 bg-white p-4 hover:bg-green-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                {/* camera icon (svg) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-700"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 0 0-.894.553L7.382 4H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-2.382l-.724-1.447A1 1 0 0 0 15 2H9zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                </svg>
              </div>

              <div className="flex-1">
                <p className="hind-siliguri-medium text-gray-800">
                  ছবি বাছাই করুন{" "}
                  <span className="text-gray-500">(JPG/PNG, &lt; 5MB)</span>
                </p>
                <p className="hind-siliguri-regular text-xs text-gray-500">
                  ক্লিক করে আপলোড করুন। আপলোডের পর নিচে প্রিভিউ দেখাবে।
                </p>
              </div>

              <span className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-white text-sm">
                ফাইল নির্বাচন
              </span>
            </div>
          </label>

          {/* Hidden native input */}
          <input
            id="productImage"
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="sr-only"
          />

          {/* Preview + actions */}
          {imagePreview && (
            <div className="mt-3 flex items-center gap-4">
              <img
                src={imagePreview}
                alt="product preview"
                className="w-24 h-24 object-cover rounded-lg border"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="productImage"
                  className="cursor-pointer rounded-lg border border-green-300 px-3 py-1.5 text-sm hover:bg-green-50"
                >
                  পরিবর্তন করুন
                </label>
                <button
                  type="button"
                  onClick={clearImage}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  মুছে দিন
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="noto-serif-bengali-normal text-lg text-green-700">
              ভ্যারিয়েন্টসমূহ
            </label>
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
              className="rounded-xl border border-green-300 px-3 py-1.5 text-sm hover:bg-green-50"
            >
              + নতুন ভ্যারিয়েন্ট
            </button>
          </div>

          <div className="space-y-3">
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
                    placeholder="যেমন: ১ কেজি / ৫ লিটার / ২৫ কেজি বস্তা"
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

                <div className="md:col-span-12 flex justify-end">
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
        <div className="pt-2 flex justify-center items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="hind-siliguri-medium rounded-xl bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 disabled:opacity-60"
          >
            {isSubmitting ? "যোগ হচ্ছে..." : "পণ্য যোগ করুন"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
