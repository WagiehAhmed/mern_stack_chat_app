import React, { useEffect } from "react";
import CheckPasswordForm from "../forms/CheckPasswordForm";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserSomeDetails } from "../../hooks/useUserSomeDetails";

export default function CheckPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refetch, data, isLoading, isError, isSuccess, error } =
    useUserSomeDetails(location?.state?.email);
  useEffect(() => {
    if (!location?.state?.email) {
      navigate("/email", { replace: true });
    } else {
      refetch();
    }
  }, []);
  return location?.state?.email && data?.data?.userDetails ? (
    <CheckPasswordForm userInfo={data?.data?.userDetails} />
  ) : null;
}
