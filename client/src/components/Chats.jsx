import React, { useEffect, useState, lazy } from "react";
import moment from "moment";

import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Form, IconButton, Input } from "./basicComponents";
import { useForm } from "react-hook-form";

const Avatar = lazy(() => import("./Avatar"));
const Explore = lazy(() => import("./Explore"));
const AppImage = lazy(() => import("./AppImage"));

// icons
import { IoSearch } from "react-icons/io5";
import { FaImage, FaVideo } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { useDataContext } from "../context/DataContextProvider";
import { VscMicFilled } from "react-icons/vsc";

export default function Chats() {
  const { t } = useTranslation();
  const [chats, setChats] = useState([]);
  const [filteredchats, setFilteredchats] = useState([]);
  const { userDetails, socket, onlineUsers } = useDataContext();
  const { chatId } = useParams();

  const navigate = useNavigate();

  const { register, handleSubmit, watch } = useForm({
    mode: "onChange",
    defaultValues: { keyword: "" },
  });

  // getting user chats
  useEffect(() => {
    socket?.emit("getMyChats");
    socket?.on("getMyChats", (myChats) => {
      console.log("myChats");
      setChats(myChats);
    });
    socket?.on("updatedChat", (updatedChat) => {
      setChats((pre) => {
        return pre.map((chat) => {
          if (chat?._id?.toString() === updatedChat?._id?.toString()) {
            return { ...chat, ...updatedChat };
          } else {
            return chat;
          }
        });
      });
    });
    return () => {
      socket?.off("getMyChats");
      socket?.off("updatedChat");
    };
  }, [socket]);

  // setting filtered chats
  useEffect(() => {
    setFilteredchats(chats);
  }, [chats]);
  // filter main chats
  const filter = (name) => {
    setFilteredchats(
      chats.filter((chat) =>
        (chat.receiver._id !== userDetails?._id
          ? chat.receiver
          : chat.sender
        ).name
          .toLowerCase()
          .includes(name.toLowerCase())
      )
    );
  };
  // data handler
  const dataHandler = (data) => {
    filter(data?.keyword);
  };
  // watching search keyword
  const searchKeyword = watch("keyword");
  useEffect(() => {
    filter(searchKeyword);
  }, [searchKeyword]);

  console.log("Chats");
  return (
    <div className="h-full w-full flex flex-row justify-start items-stretch">
      <div
        className={`bg-accent/25 flex flex-col items-stretch justify-start min-w-60 ${
          chatId ? "hidden lg:flex" : "flex-grow"
        }`}
      >
        <div className="h-14 border-border flex flex-row justify-center items-center px-1">
          <p className="capitalize text-center text-lg text-text-primary font-semibold">
            {t("chats")}
          </p>
        </div>
        {/* filter form */}
        <div className="h-fit p-1 pt-2">
          <Form
            className="flex flex-col justify-evenly gap-2"
            onSubmit={handleSubmit(dataHandler)}
          >
            <div className="relative ">
              <Input
                {...register("keyword", {
                  required: { value: true, message: "Keyword is required" },
                })}
                id="keyword"
                type="text"
                placeholder={t("searchPlaceholder")}
                className="p-2 pe-10 ring-0 focus:ring-offset-0 hover:ring-offset-0 "
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              {/* {errors.keyword && (
                        <span className="error text-red-500">
                          {errors.keyword.message}
                        </span>
                      )} */}
              <IconButton
                className="mx-2 absolute top-1/2 end-0 transform -translate-y-1/2 bg-transparent hover:bg-transparent text-white"
                type="submit"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <IoSearch size={20} />
              </IconButton>
            </div>
          </Form>
        </div>

        {/* onlineUsers */}
        {onlineUsers?.size > 1 && (
          <div className="overflow-x-auto flex flex-row gap-2 p-1 scrollbar-hidden">
            {Array.from(onlineUsers?.values()).map(({ data }, index) => {
              if (data?._id !== userDetails?._id) {
                return (
                  <div className="flex flex-col justify-center items-center max-w-fit">
                    <Avatar
                      userDetails={data}
                      key={index}
                      className="min-w-8"
                      onClick={() =>
                        navigate(`${data?._id}`, { replace: true })
                      }
                    />
                    <p className="text-[10px] text-text-primary font-semibold max-w-20 text-start text-ellipsis line-clamp-1">
                      {userDetails?.name}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* filter */}
        {filteredchats?.length ? (
          <div className="flex-grow overflow-y-auto flex flex-col gap-2 p-2">
            {filteredchats?.map((chat, index) => {
              const chatOwner =
                chat?.sender?._id !== userDetails?._id
                  ? chat?.sender
                  : chat?.receiver;
              return (
                <div
                  key={index}
                  className={`bg-background/75 shadow-lg px-1 py-2 flex flex-row items-stretch justify-start outline-1 outline-offset-0 outline-accent hover:outline rounded hover:cursor-pointer `}
                  onClick={() =>
                    navigate(`${chatOwner?._id}`, { replace: true })
                  }
                >
                  <Avatar
                    userDetails={chatOwner}
                    className="min-w-8 self-center transition-none hover:scale-0"
                  />
                  <div className="flex-grow px-1 flex flex-col gap-1 justify-center">
                    <div className="flex flex-row items-stretch justify-between">
                      <p className="text-xs text-text-primary font-bold capitalize">
                        {chatOwner?.name}
                      </p>

                      {chat?.unSeen > 0 && (
                        <p className="icon-button text-xs hover:bg-accent text-white bg-accent min-w-4 h-4 w-fit p-1">
                          {chat?.unSeen}
                        </p>
                      )}
                    </div>

                    {chat?.lastMessage && (
                      <div className="text-xs text-text-secondary flex flex-row justify-between items-center">
                        <div className="flex flex-row ">
                          <p className="me-1 max-w-fit text-nowrap">
                            {userDetails?._id.toString() ===
                            chat?.lastMessage?.sender?._id.toString()
                              ? t("you").concat(" : ")
                              : chat?.lastMessage?.sender?.name
                                  .split(" ")[0]
                                  .concat(" : ")}
                          </p>

                          {chat?.lastMessage?.image?.filePath !== "" ? (
                            <div className="flex flex-row flex-grow items-center gap-1 w-fit">
                              <FaImage
                                size={10}
                                className="text-text-secondary w-3 h-3 mt-[1px]"
                              />
                              {chat?.lastMessage?.text !== "" ? (
                                <p className="overflow-ellipsis overflow-hidden whitespace-nowrap max-w-60 md:max-w-20">
                                  {chat?.lastMessage?.text}
                                </p>
                              ) : (
                                <p className="text-[10px]">{t("image")}</p>
                              )}
                            </div>
                          ) : chat?.lastMessage?.video?.filePath !== "" ? (
                            <div className="flex flex-row flex-grow items-center gap-1 w-fit">
                              <FaVideo
                                size={10}
                                className="text-text-secondary w-3 h-3 mt-[1px]"
                              />
                              {chat?.lastMessage?.text !== "" ? (
                                <p className="overflow-ellipsis overflow-hidden whitespace-nowrap max-w-60 md:max-w-20">
                                  {chat?.lastMessage?.text}
                                </p>
                              ) : (
                                <p className="text-[10px]">{t("video")}</p>
                              )}
                            </div>
                          ) : chat?.lastMessage?.audio?.filePath !== "" ? (
                            <div className="flex flex-row flex-grow items-center gap-1 w-fit">
                              <VscMicFilled
                                size={10}
                                className="text-text-secondary w-3 h-3 mt-[1px]"
                              />
                              {chat?.lastMessage?.text !== "" ? (
                                <p className="overflow-ellipsis overflow-hidden whitespace-nowrap max-w-60 md:max-w-20">
                                  {chat?.lastMessage?.text}
                                </p>
                              ) : (
                                <p className="text-[10px]">{t("audio")}</p>
                              )}
                            </div>
                          ) : (
                            <p className="overflow-ellipsis overflow-hidden whitespace-nowrap max-w-20 ">
                              {chat?.lastMessage?.text}
                            </p>
                          )}
                        </div>
                        {chat?.lastMessage?.createdAt !== "" && (
                          <p className="text-[10px] font-semibold text-text-secondary">
                            {moment(
                              new Date(
                                chat?.lastMessage?.createdAt
                              ).toISOString()
                            ).format("D/M/YYYY")}

                            {/* {moment(chat?.lastMessage?.createdAt)
                        .startOf("mini")
                        .fromNow()} */}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Explore message={t("exploreUsers")} />
        )}
      </div>
      <div className={`flex-grow ${chatId ? "block" : "hidden"}`}>
        <Outlet />
      </div>
      {/* image */}
      <AppImage />
    </div>
  );
}
