import axios from "axios";
import useAuth from "./useAuth";
import { useNavigate } from "react-router";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_URL,
});

const useAxiosSecure = () => {
  const { logOut } = useAuth();
  const navigate = useNavigate();
  // intercept request
  axiosSecure.interceptors.request.use(
    (confiq) => {
      const token = localStorage.getItem("token");
      confiq.headers.authorization = `bearer ${token}`;
      return confiq;
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  // intercept response
  axiosSecure.interceptors.response.use(
    (response) => {
      return response;
    },
    async (err) => {
      const status = err.response.status;
      await logOut();

      if (status === 401 || status === 403) {
        navigate("/login");
      }

      return Promise.reject(err);
    }
  );

  return axiosSecure;
};

export default useAxiosSecure;
