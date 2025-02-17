import React from "react";
import { StandardModal } from "../basicComponents";
import ReactDom from "react-dom";
export default function VideoModal({ onClose, open, video }) {
  if (!open) {
    return null;
  }
  return ReactDom.createPortal(
    <StandardModal onClose={onClose}>
      <video
        controls
        className="rounded w-full max-h-[80vh] object-contain"
        src={`${import.meta.env.VITE_BACKEND_URL}/public/${video?.filePath}`}
        alt="video"
        type={video?.fileType}
      />
    </StandardModal>,

    document.getElementById("portal")
  );
}
