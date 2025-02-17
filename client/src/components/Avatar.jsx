import React from "react";
import generateAltarnativeName from "../utils/generateAltarnativeName";
import { useDataContext } from "../context/DataContextProvider";

export default function Avatar({
  dot = true,
  userDetails,
  className: cn,
  ...props
}) {
  const { onlineUsers } = useDataContext();
  const state = dot && onlineUsers?.has(userDetails?._id);
  return (
    <div
      {...props}
      title={userDetails?.name}
      style={{
        backgroundColor: userDetails?.avatar?.filePath ? "" : userDetails?.rgb,
      }}
      className={`icon-button relative hover:cursor-pointer shadow-lg select-none ${cn}`}
    >
      {state && (
        <div className="border-[5px] border-accent rounded-full absolute bottom-0 end-0"></div>
      )}

      {userDetails?.avatar?.filePath ? (
        <img
          className="w-full h-full object-fill rounded-full"
          src={`${import.meta.env.VITE_BACKEND_URL}/public/${
            userDetails?.avatar?.filePath
          }`}
          type={userDetails?.avatar?.fileType}
        />
      ) : (
        userDetails?.name && (
          <p className="font-bold text-md uppercase text-[#FFFFFF]">
            {generateAltarnativeName(userDetails?.name)}
          </p>
        )
      )}
    </div>
  );
}
