import React from "react";
import Avatar from "./Avatar";
import moment from "moment";

// icons
import { MdAddReaction } from "react-icons/md";
import { useToggle } from "../hooks/useToggle";
import { useDataContext } from "../context/DataContextProvider";
import { IoCheckmarkDone } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import ImageModal from "./modals/ImageModal";
import VideoModal from "./modals/VideoModal";
import { IconButton } from "./basicComponents";

export default function Message({ msg, userId, groupId }) {
  const [showImojis, setShowEmojis] = useToggle(false);
  const [showImageModal, toggleImageModal] = useToggle(false);
  const [showVideoModal, toggleVideoModal] = useToggle(false);

  const { i18n } = useTranslation();
  const { socket, userDetails } = useDataContext();
  const updateEmoji = (emoji) => {
    if (userId) {
      socket.emit("updateChatMessageEmoji", {
        emoji,
        msgId: msg?._id,
        receiverId: userId,
      });
    } else if (groupId) {
      socket.emit("updateGroupMessageEmoji", {
        emoji,
        msgId: msg?._id,
        groupId,
      });
    }
  };
  const getTotalemojisTypes = (emojis) => {
    return emojis.reduce((acc, cur) => {
      if (!acc?.includes(cur?.value)) {
        acc?.push(cur?.value);
      }
      return acc;
    }, []);
  };

  return (
    <div
      className={`select-none flex flex-row w-fit text-text-primary gap-0.5 group ${
        msg?.sender?._id === userDetails?._id
          ? "flex-row self-start"
          : "flex-row-reverse self-end"
      }`}
    >
      <Avatar
        userDetails={msg?.sender}
        className="w-5 h-5 text-[7px] font-extralight"
        dot={false}
      />
      <div
        className={`mt-2 w-fit max-w-xs md:max-w-lg text-text-primary flex flex-col justify-start items-start p-1 gap-1 relative`}
      >
        <div
          className={`hover:cursor-pointer rounded-full text-text-primary  ${
            msg?.emojis?.length === 0 && "hidden p-0.5"
          } group-hover:block absolute top-1/2 transform -translate-y-1/2  ${
            msg?.sender?._id === userDetails?._id ? "start-full" : "end-full"
          }`}
          onMouseEnter={setShowEmojis}
          onMouseLeave={setShowEmojis}
        >
          {msg?.emojis?.length > 0 ? (
            <div
              className={`bg-accent/50 px-1 rounded-full flex items-center justify-start ${
                msg?.sender?._id === userDetails?._id
                  ? " flex-row"
                  : " flex-row-reverse"
              }`}
            >
              <div>
                <p>{msg?.emojis?.length}</p>
              </div>
              <div
                className={`${
                  msg?.sender?._id === userDetails?._id
                    ? "flex flex-row"
                    : "flex flex-row-reverse"
                }`}
              >
                {getTotalemojisTypes(msg?.emojis).map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
            </div>
          ) : (
              <IconButton className="bg-transparent hover:bg-transparent hover:text-accent">
                <MdAddReaction size={20} />
              </IconButton>
          )}
          {showImojis && (
            <div
              className={`flex items-center justify-between gap-1 border border-border bg-background p-1 rounded-full absolute ${
                msg?.sender?._id === userDetails?._id
                  ? "start-full bottom-1/2 translate-y-1/2 flex-row"
                  : "end-full bottom-1/2 translate-y-1/2 flex-row-reverse"
              }`}
            >
              {["👍", "😍", "😢", "😲", "❤️", "😂", "😤"].map(
                (emoji, index) => (
                  <div
                    key={index}
                    className="icon-button select-none hover:scale-125 transition-transform duration-100 w-6 h-6 text-sm"
                    onClick={() => {
                      updateEmoji({
                        value: emoji,
                        maker: userDetails?._id,
                        message: msg?._id,
                        createdAt: new Date().toLocaleString(),
                        updatedAt: new Date().toLocaleString(),
                      });
                    }}
                  >
                    {emoji}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div
          className={`w-full rounded-xl p-1 ${
            msg?.sender?._id === userDetails?._id
              ? i18n.dir() === "ltr"
                ? "rounded-tl-none bg-accent text-white"
                : "rounded-tr-none bg-accent text-white"
              : i18n.dir() === "ltr"
              ? "rounded-tr-none bg-background"
              : "rounded-tl-none bg-background"
          }`}
        >
          {msg?.image?.filePath && (
            <img
              className="rounded-lg w-full max-h-60 object-contain hover:cursor-pointer"
              src={`${import.meta.env.VITE_BACKEND_URL}/public/${
                msg?.image?.filePath
              }`}
              alt="Image"
              type={msg?.image?.fileType}
              onClick={toggleImageModal}
            />
          )}
          {msg?.video?.filePath && (
            <video
              controls
              muted
              className="rounded-lg w-full max-h-60 object-contain hover:cursor-pointer"
              src={`${import.meta.env.VITE_BACKEND_URL}/public/${
                msg?.video?.filePath
              }`}
              type={msg?.video?.fileType}
              // onClick={toggleVideoModal}
            />
          )}
          {msg?.audio?.filePath && (
            <audio
              controls
              className="rounded max-w-60 h-9 object-contain hover:cursor-pointer"
              src={`${import.meta.env.VITE_BACKEND_URL}/public/${
                msg?.audio?.filePath
              }`}
              type={msg?.audio?.fileType}
            />
          )}
          <p className="flex-grow whitespace-pre-wrap max-w-full break-words">
            {msg.text}
          </p>
        </div>

        <div
          className={`flex gap-1 text-xs text-text-secondary ${
            msg?.sender?._id === userDetails?._id
              ? "self-end flex-row"
              : "self-start flex-row-reverse"
          }`}
        >
          {userDetails?._id === msg?.sender?._id && (
            <IoCheckmarkDone
              size={15}
              className={`text-text-secondary ${
                msg?.seen ? "opacity-100" : "opacity-50"
              } `}
            />
          )}
          <p>{moment(msg?.createdAt).format("h:mm,D MMM YYYY")}</p>
        </div>
      </div>
      <ImageModal
        open={showImageModal}
        onClose={toggleImageModal}
        image={msg?.image}
      />
      <VideoModal
        open={showVideoModal}
        onClose={toggleVideoModal}
        video={msg?.video}
      />
    </div>
  );
}
