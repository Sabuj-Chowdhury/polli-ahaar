// src/components/orders/ConfirmDeleteModal.jsx
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiTrash2 } from "react-icons/fi";

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  orderId,
  submitting,
}) => {
  const shortId = String(orderId || "").slice(-8);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[70]"
        onClose={submitting ? () => {} : onClose}
      >
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

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-5 text-left align-middle shadow-xl border border-red-200">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-red-50 p-2 text-red-600">
                    <FiTrash2 size={20} />
                  </div>
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      অর্ডার ডিলিট নিশ্চিতকরণ
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-gray-600">
                      আপনি কি নিশ্চিতভাবে{" "}
                      <span className="font-medium">অর্ডার #{shortId}</span>{" "}
                      ডিলিট করতে চান? এটি স্থায়ীভাবে মুছে যাবে।
                    </Dialog.Description>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={onClose}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                  >
                    ফিরে যান
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={submitting}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {submitting ? "ডিলিট হচ্ছে…" : "ডিলিট করুন"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmDeleteModal;
