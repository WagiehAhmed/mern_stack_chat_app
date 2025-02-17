import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import apiUrls from "../utils/apiUrls";
import { useEffect, useMemo } from "react";

export const useUploadMessageMedia = (sendMessage2) => {
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);
  const uploadImageMedia = async (messageData) => {
    const { data } = await axios({
      ...apiUrls.uploadImageMedia,
      data: messageData,
      signal: controller.signal,
    });
    return data;
  };
  const onSuccess = ({ image, video, audio }) => {
    sendMessage2({ image, video, audio });
  };
  const onError = ({ message, response }) => {
    if (response?.data?.message) {
      toast.error(response?.data?.message);
    } else if (message) {
      toast.error(message);
    }
  };
  const { mutate, isLoading, data, isSuccess } = useMutation({
    mutationFn: uploadImageMedia,
    onSuccess,
    onError,
  });

  return { mutate, isLoading, data, isSuccess };
};
