import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiUrls from "../utils/apiUrls";

import { useDataContext } from "../context/DataContextProvider";
import { useEffect, useMemo } from "react";

export const useUserAllDetails = () => {
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => {
    return () => controller.abort();
  }, []);
  const { setUserDetails } = useDataContext();
  const getUserAllDetails = async () => {
    const { data } = await axios({
      ...apiUrls.userAllDetails,
      signal: controller.signal,
    });
    setUserDetails(data?.data?.userDetails);
    return data;
  };

  const { refetch, data, isLoading, isFetching, isError, isSuccess, error } =
    useQuery({
      queryKey: ["userDetails"],
      queryFn: getUserAllDetails,
      retry: 0,
      enabled: false,
    });

  return { refetch, data, isLoading, isFetching, isError, isSuccess, error };
};
