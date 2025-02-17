import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import apiUrls from "../utils/apiUrls";

import { useDataContext } from "../context/DataContextProvider";
import { useEffect, useMemo } from "react";

export const useChangeLanguage = () => {
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);
  const { setUserDetails } = useDataContext();
  // const queryClient = useQueryClient();
  const changeLanguage = async (lng) => {
    const { data } = await axios({
      ...apiUrls.changeLanguage,
      data: { lng },
      signal: controller.signal,
    });
    return data;
  };
  const onSuccess = ({ message, data: { userDetails } }) => {
    setUserDetails(userDetails);
    // queryClient.invalidateQueries({ QueryKey: ["userDetails"] });
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
    mutationFn: changeLanguage,
    onSuccess,
    onError,
  });

  return { mutate, isLoading };
};
