import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  // read token once per render; react-query will re-run when email/token change
  const token = useMemo(
    () => localStorage.getItem("token") || "",
    [user?.email]
  );

  const {
    data: isAdmin = false,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["isAdmin", user?.email, token],
    // only run when we have an email AND a token and auth isn't still resolving
    enabled: !!user?.email && !!token && !authLoading,
    retry: false, // don't hammer the endpoint if token timing is off
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      const res = await axiosSecure.get(`/user/admin/${user.email}`);
      // backend returns { admin: true/false }
      return Boolean(res?.data?.admin);
    },
  });

  // expose a clear loading flag
  const adminLoading = authLoading || isLoading || isFetching;

  return { isAdmin, isLoading: adminLoading, error, refetch };
};

export default useAdmin;
