import React, { useEffect, useState, lazy } from "react";
import moment from "moment";

// icons
import { IoSearch } from "react-icons/io5";
import { AiOutlineUsergroupAdd } from "react-icons/ai";

import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Form, IconButton, Input } from "./basicComponents";
import { FaImage, FaVideo } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { useToggle } from "../hooks/useToggle";
import { useTranslation } from "react-i18next";
import { useDataContext } from "../context/DataContextProvider";

const CreateGroupModal = lazy(() => import(".//modals/CreateGroupModal"));

const Avatar = lazy(() => import("./Avatar"));
const Explore = lazy(() => import("./Explore"));
const AppImage = lazy(() => import("./AppImage"));

export default function Groups() {
  console.log("Groups");
  const { t } = useTranslation();
  const [openCreateGroup, createGroupTragger] = useToggle(false);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const { userDetails, socket } = useDataContext();
  const navigate = useNavigate();
  const { groupId } = useParams();

  const { register, handleSubmit, watch } = useForm({
    mode: "onChange",
    defaultValues: { keyword: "" },
  });

  // getting user groups
  useEffect(() => {
    if (socket) {
      socket?.emit("getMyGroups");
      socket?.on("getMyGroups", (groups) => {
        setGroups(groups);
      });
      socket?.on("updatedGroup", (updatedGroup) => {
        setGroups((pre) => {
          return pre.map((group) =>
            group?._id?.toString() === updatedGroup?._id?.toString()
              ? { ...group, ...updatedGroup }
              : group
          );
        });
      });
      socket?.on("newGroup", (newGroup) => {
        setGroups((pre) => [newGroup, ...pre]);
      });
    }
    return () => {
      socket?.off("getMyGroups");
      socket?.off("updatedGroup");
      socket?.off("newGroup");
    };
  }, [socket]);

  // setting filtered groups
  useEffect(() => {
    setFilteredGroups(groups);
  }, [groups]);
  // filter main groups
  const filter = (name) => {
    setFilteredGroups(
      groups.filter((group) =>
        group?.name.toLowerCase().includes(name?.toLowerCase())
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

  return (
    <div className="h-full w-full flex flex-row justify-start items-stretch">
      <div
        className={`bg-accent/25 flex flex-col items-stretch justify-start min-w-60 ${
          groupId ? "hidden lg:flex" : "flex-grow"
        }`}
      >
        <div className="h-14 flex flex-row justify-between items-center px-1">
          <p className="capitalize text-center text-lg text-text-primary font-semibold">
            {t("groups")}
          </p>
          <IconButton title={t("addGroupLabel")} onClick={createGroupTragger}>
            <AiOutlineUsergroupAdd size={20} />
          </IconButton>
        </div>
        {/* filter form */}
        <div className="h-fit p-1 pt-2">
          <Form
            className="flex flex-col justify-evenly gap-2"
            onSubmit={handleSubmit(dataHandler)}
          >
            <div className="relative">
              <Input
                {...register("keyword", {
                  required: { value: true, message: "Keyword is required" },
                })}
                id="keyword"
                type="text"
                placeholder={t("searchPlaceholder")}
                className="p-2 pe-10 ring-0 focus:ring-offset-0 hover:ring-offset-0"
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
                className="w-7 h-7 mx-2 absolute top-1/2 end-0 transform -translate-y-1/2 bg-transparent"
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
        {/* filter */}
        {filteredGroups?.length ? (
          <div className="flex-grow overflow-y-auto flex flex-col gap-2 p-2 ">
            {filteredGroups?.map(
              ({ name, _id, avatar, lastMessage, unSeen, rgb }, index) => {
                return (
                  <div
                    key={index}
                    className={`bg-background/75 shadow-lg px-1 py-2 flex flex-row items-stretch justify-start outline-1 outline-offset-0 outline-accent hover:outline rounded hover:cursor-pointer `}
                    onClick={() => navigate(`${_id}`, { replace: true })}
                  >
                    <Avatar
                      userDetails={{ avatar, name, rgb }}
                      className="min-w-8 self-center transition-none hover:scale-0"
                      dot={false}
                    />

                    <div className="flex-grow px-1 flex flex-col gap-1 justify-center">
                      <div className="flex flex-row items-stretch justify-between">
                        <p className="text-xs text-text-primary font-bold capitalize">
                          {name}
                        </p>

                        {unSeen > 0 && (
                          <p className="icon-button text-xs hover:bg-accent text-white bg-accent min-w-4 h-4 w-fit p-1">
                            {unSeen}
                          </p>
                        )}
                      </div>

                      {lastMessage && (
                        <div className="text-xs text-text-secondary flex flex-row justify-between items-center">
                          <div className="flex flex-row">
                            <p className="me-1 max-w-fit line-clamp-1">
                              {userDetails?._id.toString() ===
                              lastMessage?.sender?._id.toString()
                                ? t("you").concat(" : ")
                                : lastMessage?.sender?.name.concat(" : ")}
                            </p>
                            {lastMessage?.image?.filePath !== "" ? (
                              <div className="flex flex-row flex-grow items-center gap-1 w-fit">
                                <FaImage
                                  size={10}
                                  className="text-text-secondary  w-3 h-3 mt-[1px]"
                                />
                                {lastMessage?.text !== "" ? (
                                  <p className="overflow-ellipsis overflow-hidden whitespace-nowrap max-w-60 md:max-w-24">
                                    {lastMessage?.text}
                                  </p>
                                ) : (
                                  <p className="text-[10px]">{t("image")}</p>
                                )}
                              </div>
                            ) : lastMessage?.video?.filePath !== "" ? (
                              <div className="flex flex-row flex-grow items-center gap-1 w-fit">
                                <FaVideo
                                  size={10}
                                  className="text-text-secondary w-3 h-3 mt-[1px]"
                                />
                                {lastMessage?.text !== "" ? (
                                  <p className="overflow-ellipsis overflow-hidden whitespace-nowrap max-w-60 md:max-w-24">
                                    {lastMessage?.text}
                                  </p>
                                ) : (
                                  <p className="text-[10px]">{t("video")}</p>
                                )}
                              </div>
                            ) : (
                              <p className="overflow-ellipsis overflow-hidden whitespace-nowrap max-w-24">
                                {lastMessage?.text}
                              </p>
                            )}
                          </div>
                          {lastMessage?.createdAt !== "" &&
                            lastMessage != "undefined" && (
                              <p className="text-[10px] font-semibold text-text-secondary">
                                {lastMessage?.createdAt &&
                                  moment(lastMessage?.createdAt).format(
                                    "D/M/YYYY"
                                  )}

                                {/* {moment(lastMessage?.createdAt)
                                  .startOf("mini")
                                  .fromNow()} */}
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <Explore message={t("exploreGroups")} />
        )}

        {
          <CreateGroupModal
            onClose={createGroupTragger}
            open={openCreateGroup}
          />
        }
      </div>
      <div className={`flex-grow ${groupId ? "block" : "hidden"}`}>
        <Outlet />
      </div>
      {/* image */}
      <AppImage />
    </div>
  );
}
