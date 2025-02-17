import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import apiUrls from "../utils/apiUrls";
import { useNavigate } from "react-router";
 
import { useDataContext } from "../context/DataContextProvider";
import { useEffect, useMemo } from "react";
export const useCheckPassword = (reset) => {
  const navigate = useNavigate();
  const { setUserDetails } = useDataContext();
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);

  const checkPassword = async (userData) => {
    const { data } = await axios({
      ...apiUrls.checkPassword,
      data: userData,
      signal: controller.signal,
    });
    return data;
  };
  const onSuccess = ({ message, data: { userDetails } }) => {
    setUserDetails(userDetails);
    // toast.success(message);
    reset();
    navigate("/", { replace: true });
  };
  const onError = ({ message, response }) => {
    if (response?.data?.message) {
      toast.error(response?.data?.message);
    } else if (message) {
      toast.error(message);
    }
  };
  const { mutate, isLoading } = useMutation({
    mutationFn: checkPassword,
    onSuccess,
    onError,
  });

  return [mutate, isLoading];
};
