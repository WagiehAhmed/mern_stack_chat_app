import React from "react";

export default function Loader({ color = "[#FFFFFF]" }) {
  return (
    <div className="h-6 w-6 mx-auto">
      <div
        className={`w-full h-full border-2 border-${color} border-r-transparent border-l-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
}
