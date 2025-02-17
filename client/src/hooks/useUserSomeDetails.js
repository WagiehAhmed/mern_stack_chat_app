import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiUrls from "../utils/apiUrls";
import { useEffect, useMemo } from "react";

export const useUserSomeDetails = (email) => {
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);
  const getUserSomeDetails = async () => {
    const { data } = await axios({
      ...apiUrls.userSomeDetails,
      params: {
        email,
      },
      signal: controller.signal,
    });
    return data;
  };

  const { refetch, data, isLoading, isError, isSuccess, error } = useQuery({
    queryKey: ["userDetails2"],
    queryFn: getUserSomeDetails,
    retry: 0,
    enabled: false,
  });

  return { refetch, data, isLoading, isError, isSuccess, error };
};
