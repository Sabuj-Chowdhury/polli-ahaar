// src/hooks/useAxiosSecure.js
import axios from "axios";
import useAuth from "./useAuth";
import { useNavigate } from "react-router";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_URL,
});

const useAxiosSecure = () => {
  const { logOut } = useAuth();
  const navigate = useNavigate();

  axiosSecure.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      } else {
        delete config.headers.authorization;
      }
      return config;
    },
    (err) => Promise.reject(err)
  );

  axiosSecure.interceptors.response.use(
    (res) => res,
    async (err) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // token invalid/expired — clear and send to login
        localStorage.removeItem("token");
        try {
          await logOut();
        } catch {}
        navigate("/login");
      }
      return Promise.reject(err);
    }
  );

  return axiosSecure;
};

export default useAxiosSecure;
