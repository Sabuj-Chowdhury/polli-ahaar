// providers/CartProvider.jsx
import { useEffect, useReducer, useRef } from "react";
import toast from "react-hot-toast";
import CartContext from "../context/CartContext";

const CART_KEY = "polli:cart:v1";

const initialState = { items: [] };

function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        items: Array.isArray(action.payload) ? action.payload : [],
      };

    case "ADD_ITEM": {
      const { item } = action;
      const idx = state.items.findIndex(
        (i) => i.id === item.id && i.variantLabel === item.variantLabel
      );
      if (idx !== -1) {
        const cur = state.items[idx];
        const newQty = Math.min(cur.qty + item.qty, cur.stock);
        const updated = { ...cur, qty: newQty };
        return {
          ...state,
          items: [
            ...state.items.slice(0, idx),
            updated,
            ...state.items.slice(idx + 1),
          ],
        };
      }
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

// ✅ lazy initializer reads localStorage synchronously (no race)
function initFromStorage() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return { items: Array.isArray(parsed) ? parsed : [] };
  } catch {
    return initialState;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState,
    initFromStorage
  );

  // flag to skip the first persist (not needed with lazy init,
  // but keeps us safe in StrictMode double-invocation)
  const hasMountedRef = useRef(false);

  // Persist whenever items change (after first mount)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state.items));
    } catch {
      /* ignore quota errors */
    }
  }, [state.items]);

  // Cross-tab sync (if another tab modifies the cart)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CART_KEY) {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          dispatch({ type: "HYDRATE", payload: next });
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Derived values
  const count = state.items.reduce((s, i) => s + i.qty, 0);
  const subtotal = state.items.reduce((s, i) => s + i.qty * i.price, 0);

  // Actions
  const addItem = (product, variant, qty = 1) => {
    // allow single-variant products where variant might be passed in already
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
        variantLabel: variant.label ?? null,
        unit: variant.unit,
        price: Number(variant.price) || 0,
        stock,
        qty: safeQty,
      },
    });

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
    if (n > item.stock) toast.error(`স্টকে আছে মাত্র ${item.stock} টি।`);
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
