import React, { useEffect, useRef, useState } from "react";
import Avatar from "../Avatar";
import Message from "../Message";
import background from "../../assets/background.png";
import { useNavigate, useParams } from "react-router-dom";
import { Form, IconButton, Input } from "../basicComponents";
import { useForm } from "react-hook-form";
import { useToggle } from "../../hooks/useToggle";
import { useUploadMessageMedia } from "../../hooks/useUploadMessageMedia";
import scrollToEnd from "../../utils/scrollToEnd";

// icons
import { IoSend } from "react-icons/io5";
import { CgClose } from "react-icons/cg";
import { TiAttachment } from "react-icons/ti";
import { FaVideo } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaPhoneAlt } from "react-icons/fa";
import { BsFillEmojiSmileFill } from "react-icons/bs";
import { VscMicFilled } from "react-icons/vsc";

// date
import moment from "moment";

//translation
import { useTranslation } from "react-i18next";
import { useDataContext } from "../../context/DataContextProvider";
import Loader from "../Loader";
import i18next from "i18next";
import EmojiPicker from "../EmojiPicker";
import AudioRecorder from "../AudioRecorder";

// notification
import useSound from "use-sound";
import sendMessageNotificationSound from "../../sounds/sendMessage.mp3";

export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const { userDetails, onlineUsers, socket } = useDataContext();
  const { chatId } = useParams();
  const [recording, toggleRecording] = useToggle(false);
  const [audioCall, toggleaudioCall] = useToggle(false);
  const [showInfo, infoToggle] = useToggle(false);
  // references
  const messageContainerRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const textRef = useRef(null);
  // toggles
  const [showOptionsMenu, toggleOptionsMenu] = useToggle(false);
  // states
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);

  const [play] = useSound(sendMessageNotificationSound);
  const { register, handleSubmit, setValue, getValues, watch, reset } = useForm(
    {
      mode: "onChange",
      defaultValues: { text: "", image: null, video: null, audio: null },
    }
  );

  // update fields
  const messageText = watch("text");
  const messageImage = watch("image");
  const messageVideo = watch("video");
  const messageAudio = watch("audio");
  const navigate = useNavigate();

  const sendMessage = (data) => {
    socket?.emit("newChatMessage", {
      ...data,
      sender: userDetails?._id,
      receiver: chatId,
    });
    reset();
    if (recording) {
      toggleRecording();
    }
    // play();
  };

  const sendMessage2 = ({ image, video, audio }) => {
    sendMessage({ text: messageText, image, video, audio });
  };

  const { mutate, isLoading } = useUploadMessageMedia(sendMessage2);

  const dataHandler = (data) => {
    console.log(data);
    if (!data?.image?.[0] && !data?.video?.[0] && !data?.audio && data?.text) {
      sendMessage({ text: data.text });
      textRef?.current?.onBlur();
    } else {
      const fd = new FormData();
      if (data?.image && data?.image[0]) {
        fd.append("image", data.image[0]);
      }
      if (data?.video && data?.video[0]) {
        fd.append("video", data.video[0]);
      }
      if (data?.audio) {
        fd.append("audio", data?.audio, "audio.wav");
      }
      if (fd.has("image") || fd.has("video") || fd.has("audio")) {
        mutate(fd);
      }
    }
  };

  useEffect(() => {
    if (socket && chatId) {
      socket?.emit("chatMessagePage", chatId);
      socket?.on("isTyping", ({ isTyping }) => {
        setIsTyping(isTyping);
      });
      socket?.on("chatMessagePage", ({ user, messages }) => {
        setUserData(user);
        setMessages(messages);
        scrollToEnd(messageContainerRef);
      });
      socket?.emit("chatMessageSeen", chatId);
      socket?.on("error", (error) => {
        setError(error);
      });

      socket?.on("lastSeen", (last_seen) => {
        setUserData((pre) => {
          return { ...pre, last_seen };
        });
      });
    }
    return () => {
      socket?.off("chatMessagePage");
      socket?.off("chatMessageSeen");
      socket?.off("error");
    };
  }, [socket, chatId]);

  useEffect(() => {
    socket?.emit("chatMessageSeen", chatId);
    scrollToEnd(messageContainerRef);
    return () => {
      socket?.off("chatMessageSeen");
    };
  }, [messages]);

  useEffect(() => {
    socket?.on("chatMessages", (messages) => {
      // console.log(messages[messages?.length - 1]);
      setMessages(messages);
    });
    return () => {
      socket?.off("chatMessages");
    };
  }, []);

  // adding emoji to message text
  const [showEmojiPicker, setShowEmojiPicker] = useToggle(false);
  const handleEmojiSelect = (emoji) => {
    console.log(emoji);
    setValue("text", messageText + emoji.toString());
  };
  // const audioCallHandler = () => {
  //   toggleaudioCall();
  // };

  return userData ? (
    <div className="select-none w-full h-full flex flex-row ">
      <div className="flex flex-col items-stretch justify-start w-full h-full">
        {/* {audioCall && <CallComponent />} */}
        <header className="flex flex-row items-center justify-between min-h-12 bg-background p-1">
          <div className="flex flex-row justify-center items-center gap-1">
            <IconButton
              onClick={() => {
                navigate("/chats");
              }}
              className="bg-transparent lg:hidden"
            >
              {i18n.dir() === "rtl" ? (
                <FaAngleRight size={20} />
              ) : (
                <FaAngleLeft size={20} />
              )}
            </IconButton>

            <div
              className="flex flex-row items-center hover:cursor-pointer"
              onClick={infoToggle}
            >
              <Avatar
                userDetails={userData}
                dot={false}
                className="transition-none hover:scale-0"
              />
              <div className="ps-1">
                <p className="text-xs text-text-primary font-bold capitalize">
                  {userData?.name}
                </p>
                <p
                  className={`text-xs ${
                    onlineUsers?.has(userData?._id)
                      ? "text-accent"
                      : "text-text-secondary"
                  }`}
                >
                  {isTyping
                    ? t("typing")
                    : onlineUsers?.has(userData?._id)
                    ? t("online")
                    : userData?.last_seen &&
                      moment(userData?.last_seen).format(
                        "ddd, do MMM ,YYYY [at] h:mm A"
                      )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-1">
            <IconButton className="bg-transparent hover:bg-accent/50 hover:text-white">
              <FaPhoneAlt size={15} />
            </IconButton>
            <IconButton className="bg-transparent hover:bg-accent/50 hover:text-white">
              <FaVideo size={15} />
            </IconButton>
            <IconButton className="bg-transparent hover:bg-accent/50 hover:text-white">
              <BiDotsVerticalRounded size={20} />
            </IconButton>
          </div>
        </header>
        <div
          className={`flex-grow bg-no-repeat bg-cover pb-5 ${
            userDetails?.theme === "light"
              ? "bg-background-primary"
              : "bg-background"
          }  flex flex-col justify-start items-start gap-5 p-1 overflow-y-auto`}
          style={{
            backgroundImage: `url(${background})`,
          }}
          ref={messageContainerRef}
        >
          {messages?.map((msg, index) => (
            <Message msg={msg} userId={userData?._id} key={index} />
          ))}
        </div>
        <div className="p-0 md:p-1 bg-background ">
          {((messageImage && messageImage?.[0]) ||
            (messageVideo && messageVideo?.[0]) ||
            recording) && (
            <div
              className={`bg-accent/25 w-full flex flex-row gap-1 overflow-auto ${
                (messageImage || messageVideo) && "p-1"
              } rounded`}
            >
              {messageImage && messageImage?.[0] && (
                <div className="w-fit h-fit  relative bg-black/50 rounded overflow-hidden">
                  <IconButton
                    className="absolute top-1 end-1 w-6 h-6 z-50"
                    onClick={() => {
                      setValue("image", null);
                    }}
                    type="buttom"
                  >
                    <CgClose size={15} />
                  </IconButton>
                  <img
                    src={URL.createObjectURL(messageImage?.[0])}
                    type={messageImage?.[0]?.type}
                    className="h-20 md:h-32 aspect-square object-cover"
                  />
                </div>
              )}
              {messageVideo && messageVideo?.[0] && (
                <div className="w-fit h-fit relative bg-black/50 rounded overflow-hidden">
                  <IconButton
                    className="absolute top-1 end-1 w-6 h-6 z-50"
                    onClick={() => {
                      setValue("video", null);
                    }}
                    type="buttom"
                  >
                    <CgClose size={15} />
                  </IconButton>
                  <video
                    controls
                    muted
                    className="h-20 md:h-32 aspect-square object-cover"
                    src={URL.createObjectURL(messageVideo?.[0])}
                    type={messageVideo?.[0]?.type}
                  />
                </div>
              )}
            </div>
          )}
          {recording && (
            <div className="bg-accent/25 w-full flex flex-row gap-1 overflow-auto p-1 rounded">
              <AudioRecorder setAudio={(audio) => setValue("audio", audio)} />
            </div>
          )}
          <Form
            encType="multipart/form-data"
            onSubmit={handleSubmit(dataHandler)}
          >
            <div className="flex flex-row items-center gap-1 px-1">
              <div className="relative w-fit h-fit flex flex-row items-center">
                <div className="relative flex flex-row gap-1 items-center ">
                  {/* media button */}
                  <IconButton
                    className={`md:hidden ${
                      showOptionsMenu
                        ? "bg-accent/50 text-white"
                        : "bg-transparent"
                    }`}
                    onClick={toggleOptionsMenu}
                    type="button"
                  >
                    <TiAttachment size={20} />
                  </IconButton>
                  <IconButton
                    className={`hidden md:inline-flex ${
                      messageImage && messageImage?.[0]
                        ? "bg-accent/50 text-white"
                        : "bg-transparent"
                    }`}
                    onClick={() => {
                      imageRef.current.click();
                    }}
                    type="button"
                  >
                    <FaImage size={15} />
                  </IconButton>
                  <IconButton
                    className={`hidden md:inline-flex ${
                      messageVideo && messageVideo?.[0]
                        ? "bg-accent/50 text-white"
                        : "bg-transparent"
                    }`}
                    onClick={() => {
                      videoRef.current.click();
                    }}
                    type="button"
                  >
                    <FaVideo size={15} />
                  </IconButton>
                  {/* mic button */}
                  <IconButton
                    className={`${
                      recording ? "bg-accent/50 text-white" : "bg-transparent"
                    }`}
                    type="button"
                    onClick={toggleRecording}
                  >
                    <VscMicFilled size={15} />
                  </IconButton>
                  {/* emoji button */}
                  <IconButton
                    className={` ${
                      showEmojiPicker
                        ? "bg-accent/50 text-white"
                        : "bg-transparent"
                    }`}
                    type="button"
                    onClick={setShowEmojiPicker}
                  >
                    <BsFillEmojiSmileFill size={15} />
                  </IconButton>
                  {/* emogi picker */}
                  <div className="absolute bottom-[140%] start-0">
                    {showEmojiPicker && (
                      <EmojiPicker selectionHandler={handleEmojiSelect} />
                    )}
                  </div>
                </div>
                {/* menu */}
                {showOptionsMenu && (
                  <div className="absolute start-0 -top-[83px] md:hidden rounded bg-background p-1 text-text-primary ">
                    <div
                      className="hover:bg-accent/25 flex flex-row items-center gap-2 m-0 p-1 px-2 rounded hover:cursor-pointer"
                      onClick={() => {
                        imageRef.current.click();
                        toggleOptionsMenu();
                      }}
                    >
                      <FaImage size={15} className="text-accent" />
                      <p>image</p>
                    </div>
                    <div
                      className="hover:bg-accent/25 flex flex-row items-center gap-2 m-0 p-1 px-2 rounded hover:cursor-pointer"
                      onClick={() => {
                        videoRef.current.click();
                        toggleOptionsMenu();
                      }}
                    >
                      <FaVideo size={15} className="text-accent" />
                      <p>video</p>
                    </div>
                  </div>
                )}
                {/* image input */}
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("image")}
                  ref={(e) => {
                    register("image").ref(e);
                    imageRef.current = e;
                  }}
                />

                {/* video input */}
                <Input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  {...register("video")}
                  ref={(e) => {
                    register("video").ref(e);
                    videoRef.current = e;
                  }}
                />
              </div>
              <div className=" flex-grow flex flex-row items-center justify-between">
                <Input
                  {...register("text", {
                    required: false,
                  })}
                  ref={(e) => {
                    register("text").ref(e);
                    textRef.current = e;
                  }}
                  onFocus={(e) => {
                    socket?.emit("isTyping", { state: true, receiver: chatId });
                  }}
                  onBlur={(e) => {
                    socket?.emit("isTyping", {
                      state: false,
                      receiver: chatId,
                    });
                  }}
                  type="text"
                  id="text"
                  placeholder={t("enterMessage")}
                  // autoFocus
                  className="p-[6px] max-h-40 w-full overflow-auto break-words bg-accent/50 rounded-full ring-0 focus:ring-offset-0 hover:ring-offset-0 resize-none"
                />
                <IconButton className="m-1 min-w-9 min-h-9" type="submit">
                  <IoSend
                    size={20}
                    className={i18n.dir() === "rtl" && "rotate-180"}
                  />
                </IconButton>
              </div>
            </div>
          </Form>
        </div>
      </div>
      {showInfo && (
        <div
          className={`w-fit min-w-60 max-w-80 px-1 bg-background flex flex-col justify-start text-text-primary`}
        >
          <IconButton
            onClick={infoToggle}
            className="self-start mt-[10px] min-w-8 min-h-8 bg-transparent "
          >
            {i18next.dir() === "rtl" ? (
              <FaAngleRight size={20} />
            ) : (
              <FaAngleLeft size={20} />
            )}
          </IconButton>
          <Avatar
            className="self-center min-w-20 min-h-20 text-4xl transition-none hover:scale-0"
            userDetails={userData}
            dot={false}
          />
          <p className="text-lg font-medium self-center capitalize">
            {userData?.name}
          </p>
          <p className="text-sm text-text-secondary self-center">
            {userData?.email}
          </p>
          <div className="w-full mt-2">
            <div className="text-sm whitespace-nowrap">
              <span className="font-medium">{t("joinedAt")}</span>
              <span className="font-bold">{" : "}</span>
              <span className=" text-text-secondary">
                {moment(userData?.createdAt).format("D MMM YYYY")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : error ? (
    <div className="p-1 m-1 bg-red-400 text-text-primary rounded">
      {error?.message}
    </div>
  ) : (
    <div className="flex flex-row justify-center items-center h-full w-full">
      <Loader color="accent" />
    </div>
  );
}
