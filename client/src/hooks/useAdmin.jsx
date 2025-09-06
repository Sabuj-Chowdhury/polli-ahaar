// src/hooks/useAdmin.js
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const LS_KEY = (email) => (email ? `is_admin:${email}` : "is_admin");

const readCached = (email) => {
  try {
    const raw = localStorage.getItem(LS_KEY(email));
    if (!raw) return undefined; // undefined → lets React Query consider it missing
    return JSON.parse(raw) === true; // ensure boolean
  } catch {
    return undefined;
  }
};

const writeCached = (email, val) => {
  try {
    if (!email) return;
    localStorage.setItem(LS_KEY(email), JSON.stringify(!!val));
  } catch {
    /* ignore */
  }
};

const clearCached = (email) => {
  try {
    localStorage.removeItem(LS_KEY(email));
  } catch {
    /* ignore */
  }
};

const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  // read token once; refetch when email changes
  const token = useMemo(
    () => localStorage.getItem("token") || "",
    [user?.email]
  );

  const email = user?.email || "";

  // seed from localStorage for instant UI (no “Login”→“Avatar” role flicker)
  const initial = readCached(email);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["isAdmin", email, token],
    enabled: !!email && !!token && !authLoading,
    // If we have a cached value, show it immediately and then update in background
    initialData: initial,
    placeholderData: initial,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000, // 30 min
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const res = await axiosSecure.get(`/user/admin/${email}`);
      return Boolean(res?.data?.admin);
    },
  });

  // keep localStorage in sync with the latest answer
  useEffect(() => {
    if (!email) {
      // user logged out → clear all cached flags
      clearCached(email);
      return;
    }
    if (typeof data !== "undefined") {
      writeCached(email, data);
    }
  }, [email, data]);

  const adminLoading = authLoading || isLoading || isFetching;
  const isAdmin = Boolean(data);

  return { isAdmin, isLoading: adminLoading, error, refetch };
};

export default useAdmin;
