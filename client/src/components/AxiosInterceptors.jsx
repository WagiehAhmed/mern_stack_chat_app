import axios from "axios";
import { useEffect } from "react";
import i18n from "i18next";
import apiUrls from "../utils/apiUrls";
import { useDataContext } from "../context/DataContextProvider";
import { useNavigate } from "react-router-dom";

export default function AxiosInterceptors({ children }) {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = `${import.meta.env.VITE_BACKEND_URL}`;

  const { setUserDetails } = useDataContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        config.headers["Accept-Language"] = i18n.language;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response && error.response.status === 401) {
          const originalRequest = error.config;
          originalRequest._retry = true;
          try {
            if (!originalRequest.url.includes("reset-access-token")) {
              const { data } = await axios({ ...apiUrls.resetAccessToken });
              setUserDetails(data?.userDetails);
              return axios(originalRequest);
            }
          } catch (err) {
            navigate("/email", { replace: true });
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup function to eject interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [i18n.language]); 

  return children;
}
