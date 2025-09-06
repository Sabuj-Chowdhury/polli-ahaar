const OPTIONS = [
  { value: "pending", label: "পেন্ডিং" },
  { value: "processing", label: "প্রসেস হচ্ছে" },
  { value: "shipped", label: "শিপড" },
  { value: "delivered", label: "ডেলিভারড" },
  { value: "completed", label: "সম্পন্ন" },
  { value: "cancelled", label: "বাতিল" },
];

const StatusSelect = ({ value, onChange, disabled }) => {
  return (
    <select
      value={String(value || "pending")}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-sm outline-none hover:bg-emerald-50 disabled:opacity-60"
      title="স্ট্যাটাস পরিবর্তন করুন"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
};

export default StatusSelect;
