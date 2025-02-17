import React from "react";
import logo from "../../assets/logo.png";
import { Outlet } from "react-router-dom";
export default function MainLayout({ children }) {
  return (
    <div className="w-screen h-screen flex flex-col">
      <header className="h-16 bg-background shadow-md z-10 flex flex-row items-center justify-center">
        <img src={logo} className="h-28" />
      </header>
      <div className="flex-grow bg-background/95 relative z-0 flex flex-row justify-center items-center">
        <Outlet />
      </div>
    </div>
  );
}
