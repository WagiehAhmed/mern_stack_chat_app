import React from "react";
import { StandardModal } from "../basicComponents";
import ReactDom from "react-dom";
export default function ImageModal({ onClose, open, image }) {
  if (!open) {
    return null;
  }
  return ReactDom.createPortal(
    <StandardModal onClose={onClose}>
      <img
        className="rounded w-full h-full max-h-[80vh] object-contain"
        src={`${import.meta.env.VITE_BACKEND_URL}/public/${image?.filePath}`}
        alt="Image"
        type={image?.fileType}
      />
    </StandardModal>,

    document.getElementById("portal")
  );
}
