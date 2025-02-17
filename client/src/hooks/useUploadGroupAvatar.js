import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import apiUrls from "../utils/apiUrls";
import { useEffect, useMemo } from "react";
 
export const useUploadGroupAvatar = (createGroup2) => {
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);
  const uploadGroupAvatar = async (groupData) => {
    const { data } = await axios({
      ...apiUrls.uploadGroupAvatar,
      data: groupData,signal: controller.signal,
    });
    return data;
  };
  const onSuccess = ({ avatar }) => {
    createGroup2({ avatar });
  };
  const onError = ({ message, response }) => {
    if (response?.data?.message) {
      toast.error(response?.data?.message);
    } else if (message) {
      toast.error(message);
    }
  };
  const { mutate, isLoading, data, isSuccess } = useMutation({
    mutationFn: uploadGroupAvatar,
    onSuccess,
    onError,
  });

  return { mutate, isLoading, data, isSuccess };
};
