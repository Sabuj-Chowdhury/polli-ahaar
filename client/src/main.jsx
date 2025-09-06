import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { broadcastQueryClient } from "@tanstack/query-broadcast-client-experimental"; // 👈 add this
import { Toaster } from "react-hot-toast";
import AuthProvider from "./provider/AuthProvider";
import { RouterProvider } from "react-router";
import router from "./routes/Routes";
import { CartProvider } from "./provider/CartProvider";

// Create a client
const queryClient = new QueryClient();

// 🔥 Sync queries across browser tabs
broadcastQueryClient({
  queryClient,
  broadcastChannel: "ponno-query-sync",
});

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
