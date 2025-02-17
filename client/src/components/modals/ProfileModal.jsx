import React from "react";
import { StandardModal } from "../basicComponents";
import ReactDom from "react-dom";
import { useDataContext } from "../../context/DataContextProvider";
import Avatar from "../Avatar";
import { useTranslation } from "react-i18next";
export default function ProfileModal({ onClose, open }) {
  const { t } = useTranslation();
  const { userDetails } = useDataContext();
  // Don't render modal if not open
  if (!open) {
    return null;
  }
  return ReactDom.createPortal(
    <StandardModal onClose={onClose} header={`${t("profileDetails")}`}>
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="w-20 h-20 mx-auto rounded-full hover:cursor-pointer select-none shadow-xl">
          <Avatar
            userDetails={userDetails}
            dot={false}
            className="w-full h-full text-4xl transition-none hover:scale-0"
          />
        </div>
        <p className="font-semibold text-md capitalize text-text-primary mx-auto">
          {userDetails?.name}
        </p>
        <p className="text-sm capitalize text-text-primary mx-auto">
          {userDetails?.email}
        </p>
      </div>
    </StandardModal>,

    document.getElementById("portal")
  );
}
