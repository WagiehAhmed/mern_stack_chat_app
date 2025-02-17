import React, { memo } from "react";
import { IconButton } from "./basicComponents";
// icons
import { FiArrowUpLeft } from "react-icons/fi";
import { FiArrowUpRight } from "react-icons/fi";
import i18next from "i18next";
function Explore({ message }) {
  return (
    <div className="flex flex-col justify-center items-center py-8 select-none font-semibold">
      <IconButton className="w-16 h-16 bg-transparent hover:bg-transparent text-text-secondary hover:text-text-secondary">
        {i18next.dir() === "rtl" ? (
          <FiArrowUpRight size={50} />
        ) : (
          <FiArrowUpLeft size={50} />
        )}
      </IconButton>
      <p className="text-center text-xs text-balance text-text-secondary">
        {message}
      </p>
    </div>
  );
}

export default memo(Explore);
