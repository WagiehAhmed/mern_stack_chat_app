import { useEffect } from "react";
import CheckEmailForm from "../forms/CheckEmailForm";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../../context/DataContextProvider";

export default function CheckEmailPage() {
  const { userDetails } = useDataContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (userDetails) {
      console.log("CheckEmailPage : ", userDetails);
      navigate("/", { replace: true });
    }
  }, [userDetails]);

  return !userDetails ? <CheckEmailForm /> : null;
}
