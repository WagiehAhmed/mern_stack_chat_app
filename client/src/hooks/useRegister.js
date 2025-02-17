import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import apiUrls from "../utils/apiUrls";
import { useNavigate } from "react-router";
import { useEffect, useMemo } from "react";
 
export const useRegister = (reset) => {
  
  const navigate = useNavigate();
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);
  const register = async (userData) => {
    const { data } = await axios({
      ...apiUrls.register,
      data: userData, signal: controller.signal,
    });
    return data;
  };
  const onSuccess = ({ message }) => {
    toast.success(message);
    reset();
    navigate("/email");
  };
  const onError = ({ message, response }) => {
    if (response?.data?.message) {
      toast.error(response?.data?.message);
    } else if (message) {
      toast.error(message);
    }
  };
  const { mutate, isLoading } = useMutation({
    mutationFn: register,
    onSuccess,
    onError,
  });

  return { mutate, isLoading };
};
