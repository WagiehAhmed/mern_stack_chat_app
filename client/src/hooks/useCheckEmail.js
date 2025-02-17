import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import apiUrls from "../utils/apiUrls";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
 
export const useCheckEmail = (reset) => {
  const navigate = useNavigate();
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);
  const checkEmail = async (userData) => {
    const { data } = await axios({
      ...apiUrls.checkEmail,
      data: userData,signal: controller.signal,
    });
    return data;
  };
  const onSuccess = ({ message, data: { userDetails } }) => {
    // toast.success(message);
    reset();
    navigate(`/password`, { state: { email: userDetails?.email } });
  };
  const onError = ({ message, response }) => {
    if (response?.data?.message) {
      toast.error(response?.data?.message);
    } else if (message) {
      toast.error(message);
    }
  };
  const { mutate, isLoading } = useMutation({
    mutationFn: checkEmail,
    onSuccess,
    onError,
  });

  return { mutate, isLoading };
};
