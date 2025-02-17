import { useLocation, useNavigate } from "react-router-dom";
import VerifyOtpForm from "../forms/VerifyOtpForm";
import { useEffect } from "react";

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!location?.state?.email) {
      navigate("/forgot-password", { replace: true });
    }
  }, []);
  return <VerifyOtpForm />;
}
