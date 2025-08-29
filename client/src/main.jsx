import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./provider/AuthProvider";
import { RouterProvider } from "react-router";
import router from "./routes/Routes";
import { CartProvider } from "./provider/CartProvider";

// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" reverseOrder={false} />
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
