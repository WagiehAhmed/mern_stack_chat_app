import React from "react";
import { ToastContainer } from "react-toastify";
import { useDataContext } from "../context/DataContextProvider";

export default function Notifications() {
  const { userDetails } = useDataContext();
  return (
    <ToastContainer
      position={userDetails?.lng === "ar" ? "top-right" : "top-left"}
      autoClose={1500}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick={false}
      rtl={userDetails?.lng === "ar" ? true : false}
      theme={userDetails?.theme === "light" ? "light" : "dark"}
    />
  );
}
