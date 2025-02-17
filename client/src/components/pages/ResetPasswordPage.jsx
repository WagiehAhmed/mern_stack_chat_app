import { useLocation, useNavigate } from "react-router-dom";
import ResetPasswordForm from "../forms/ResetPasswordForm";
import { useEffect } from "react";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!location?.state?.email) {
      navigate("/forgot-password", { replace: true });
    }
  }, []);
  return <ResetPasswordForm />;
}
