import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import apiUrls from "../utils/apiUrls";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
 
export const useForgotPassword = (reset) => {
  const navigate = useNavigate();
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);
  const forgotPassword = async (userData) => {
    const { data } = await axios({
      ...apiUrls.forgotPassword,
      data: userData,signal: controller.signal,
    });
    return data;
  };
  const onSuccess = ({ message }, { email }) => {
    toast.success(message);
    reset();
    navigate(`/verify-otp`, { state: { email }});
  };
  const onError = ({ message, response }) => {
    if (response?.data?.message) {
      toast.error(response?.data?.message);
    } else if (message) {
      toast.error(message);
    }
  };
  const { mutate, isLoading } = useMutation({
    mutationFn: forgotPassword,
    onSuccess,
    onError,
  });

  return { mutate, isLoading };
};
