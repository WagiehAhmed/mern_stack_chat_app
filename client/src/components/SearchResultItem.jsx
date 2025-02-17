import React from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { useDataContext } from "../context/DataContextProvider";

export default function SearchResultItem({
  details,
  onClose,
  type = "chat",
  joined = false,
}) {
  const navigate = useNavigate();
  const { socket } = useDataContext();
  return (
    <div
      className="bg-background/75 shadow-lg flex flex-row items-center justify-start px-1 py-2 outline-1 outline-offset-0 outline-accent hover:outline rounded"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
        if (type === "chat") {
          navigate(`/chats/${details?._id}`);
        }
        if (type === "group" && joined) {
          navigate(`/groups/${details?._id}`);
        }
      }}
    >
      <Avatar userDetails={details} />

      <div className="ps-1 flex-grow">
        <p className="text-sm text-text-primary font-semibold capitalize">
          {details?.name}
        </p>
        <p className="text-xs text-text-secondary">{details?.email}</p>
      </div>
      {type === "group" && !joined && (
        <div
          className="w-fit border-2 py-1 px-2 rounded-lg bg-accent text-[#FFFFFF] hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            socket.emit("joinGroup", details?._id);
            onClose();
            navigate(`/groups/${details?._id}`);
          }}
        >
          join
        </div>
      )}
    </div>
  );
}
