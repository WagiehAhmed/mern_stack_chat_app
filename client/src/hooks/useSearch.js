import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiUrls from "../utils/apiUrls";
import { useEffect, useMemo } from "react";

export const useSearch = (keyword) => {
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);
  const search = async () => {
    const { data } = await axios({
      ...apiUrls.search,
      params: {
        keyword,
      },
      signal: controller.signal,
    });
    return data;
  };

  const { refetch, data, isLoading, isFetching, isError, isSuccess, error } =
    useQuery({
      queryKey: ["search"],
      queryFn: search,
      retry: 0,
      enabled: false,
    });

  return { refetch, data, isLoading, isFetching, isError, isSuccess, error };
};
