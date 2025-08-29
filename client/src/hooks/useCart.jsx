import { useContext } from "react";
import CartContext from "../context/CartContext";

const useCart = () => {
  const cart = useContext(CartContext);
  return cart;
};

export default useCart;
