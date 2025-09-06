const UpdateOrderModal = ({ order, onClose, onSubmit, submitting }) => {
  const s = order?.shipping || {};

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const shipping = {
      name: fd.get("name")?.toString().trim(),
      phone: fd.get("phone")?.toString().trim(),
      address: fd.get("address")?.toString().trim(),
      note: fd.get("note")?.toString().trim(),
    };
    if (!shipping.name || !shipping.phone || !shipping.address) return;
    onSubmit(shipping);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 border border-green-200">
        <h3 className="text-lg hind-siliguri-medium mb-3">অর্ডার আপডেট</h3>
        <form onSubmit={submit} className="space-y-3">
          <Input name="name" defaultValue={s.name || ""} placeholder="নাম" />
          <Input
            name="phone"
            defaultValue={s.phone || ""}
            placeholder="মোবাইল"
          />
          <Input
            name="address"
            defaultValue={s.address || ""}
            placeholder="ঠিকানা"
          />
          <textarea
            name="note"
            rows={3}
            defaultValue={s.note || ""}
            className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="নির্দেশনা (ঐচ্ছিক)"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2"
              disabled={submitting}
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-green-600 text-white px-4 py-2 disabled:opacity-60"
            >
              {submitting ? "সেভ হচ্ছে…" : "সেভ করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
  />
);

export default UpdateOrderModal;
