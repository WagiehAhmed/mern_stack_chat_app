import React from "react";
import logo from "../assets/logo.png";
import { useParams } from "react-router-dom";

export default function AppImage() {
  const { chatId, groupId } = useParams();
  return (
    <div
      className={`w-full h-full flex-row justify-center items-center ${
        chatId || groupId ? "hidden" : " hidden sm:flex"
      }`}
    >
      <img src={logo} className="w-2/3 md:w-1/2" />
    </div>
  );
}
