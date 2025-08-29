// CartProvider.jsx
import { useEffect, useReducer } from "react";
import toast from "react-hot-toast";
import CartContext from "../context/CartContext";

const initialState = {
  items: [],
};

function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.payload || [] };

    case "ADD_ITEM": {
      const { item } = action;
      const existingIndex = state.items.findIndex(
        (i) => i.id === item.id && i.variantLabel === item.variantLabel
      );

      // if item exists, bump qty but cap at stock
      if (existingIndex !== -1) {
        const existing = state.items[existingIndex];
        const newQty = Math.min(existing.qty + item.qty, existing.stock);
        const updated = { ...existing, qty: newQty };
        return {
          ...state,
          items: [
            ...state.items.slice(0, existingIndex),
            updated,
            ...state.items.slice(existingIndex + 1),
          ],
        };
      }
      // fresh add
      return { ...state, items: [...state.items, item] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i.id === action.id && i.variantLabel === action.variantLabel)
        ),
      };

    case "SET_QTY": {
      const { id, variantLabel, qty } = action;
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === id && i.variantLabel === variantLabel
            ? { ...i, qty: Math.min(Math.max(qty, 1), i.stock) }
            : i
        ),
      };
    }

    case "CLEAR":
      return { ...state, items: [] };

    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  // Derived values
  const count = state.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.qty * i.price, 0);

  // Helpers
  const addItem = (product, variant, qty = 1) => {
    if (!variant) {
      toast.error("ভ্যারিয়েন্ট নির্বাচন করুন।");
      return;
    }
    const stock = Number(variant.stock) || 0;
    if (stock <= 0) {
      toast.error("স্টক নেই — কার্টে যোগ করা যাবে না।");
      return;
    }
    const safeQty = Math.max(1, Number(qty) || 1);

    dispatch({
      type: "ADD_ITEM",
      item: {
        id: product._id,
        name: product.name,
        image: product.image,
        variantLabel: variant.label,
        unit: variant.unit,
        price: Number(variant.price) || 0,
        stock,
        qty: safeQty,
      },
    });

    // find existing item (post-dispatch state not available here; show optimistic toast)
    const label = variant.label ? ` (${variant.label})` : "";
    toast.success(`${product.name}${label} কার্টে যোগ হয়েছে!`);
  };

  const removeItem = (id, variantLabel) => {
    dispatch({ type: "REMOVE_ITEM", id, variantLabel });
    toast("কার্ট থেকে মুছে ফেলা হয়েছে", { icon: "🗑️" });
  };

  const setQty = (id, variantLabel, qty) => {
    const item = state.items.find(
      (i) => i.id === id && i.variantLabel === variantLabel
    );
    if (!item) return;

    const n = Number(qty) || 1;
    if (n > item.stock) {
      toast.error(`স্টকে আছে মাত্র ${item.stock} টি।`);
    }
    dispatch({ type: "SET_QTY", id, variantLabel, qty: n });
  };

  const clearCart = () => {
    if (state.items.length === 0) return;
    dispatch({ type: "CLEAR" });
    toast("কার্ট খালি করা হয়েছে", { icon: "🛒" });
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        count,
        subtotal,
        addItem,
        removeItem,
        setQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
