import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import apiUrls from "../utils/apiUrls";
import { useNavigate } from "react-router";

import { useDataContext } from "../context/DataContextProvider";
import { useEffect, useMemo } from "react";
export const useLogout = () => {
  const { setSocket, setOnlineUsers, setUserDetails } = useDataContext();
  const navigate = useNavigate();
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);
  const logout = async () => {
    const { data } = await axios({
      ...apiUrls.logout,
      signal: controller.signal,
    });
    return data;
  };
  const onSuccess = ({ message }) => {
    setSocket(null);
    setOnlineUsers(null);
    setUserDetails(null);
    navigate("/email", { replace: true });
    // toast.success(message);
  };
  const onError = ({ message, response }) => {
    if (response?.data?.message) {
      toast.error(response?.data?.message);
    } else if (message) {
      toast.error(message);
    }
  };
  const { mutate, isLoading } = useMutation({
    mutationFn: logout,
    onSuccess,
    onError,
  });

  return { mutate, isLoading };
};
