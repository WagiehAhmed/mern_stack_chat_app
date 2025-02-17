import React, { useEffect, useState } from "react";
import ReactDom from "react-dom";
import { Form, IconButton, Input, ModernModal } from "../basicComponents";
import { useForm } from "react-hook-form";
import Loader from "../Loader";
import SearchResultItem from "../SearchResultItem";
// icons
import { IoSearch } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useSearch } from "../../hooks/useSearch";
import { useDataContext } from "../../context/DataContextProvider";

export default function SearchModal({ onClose, open }) {
  const { t } = useTranslation();
  const { userDetails, socket } = useDataContext();
  const { register, handleSubmit, getValues, watch, reset } = useForm({
    mode: "onChange",
    defaultValues: { keyword: "" },
  });
  const newKeyword = watch("keyword");
  const { data, refetch, isLoading, isFetching } = useSearch(newKeyword);

  // const [data, setData] = useState(null);
  const search = (keyword) => {
    // socket.emit("search", keyword);
    // socket.on("searchResults", (results) => setData(results));
    refetch();
  };

  const dataHandler = (data) => {
    search(data?.keyword);
  };
  // useEffect to trigger search on keyword change
  useEffect(() => {
    if (newKeyword !== "") {
      search(newKeyword);
    }
  }, [newKeyword]);

  // Don't render modal if not open
  if (!open) {
    return null;
  }

  const closeHandler = () => {
    onClose();
    reset();
  };

  return ReactDom.createPortal(
    <ModernModal onClose={closeHandler}>
      <div className="flex flex-col items-stretch justify-start gap-2 p-2">
        <div className="rounded min-w-64">
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
                autoFocus
                className="pe-8 bg-accent ring-0 focus:ring-offset-0 hover:ring-offset-0 hover:bg-accent"
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
                <IoSearch size={25} />
              </IconButton>
            </div>
          </Form>
        </div>
        <div
          className={`bg-accent/50 rounded text-text-primary flex flex-col items-stretch justify-start flex-grow min-w-64 max-h-[490px] overflow-y-auto ${
            (data?.data?.usersTotalCount || data?.data?.groupsTotalCount) &&
            newKeyword !== ""
              ? "p-2 gap-2"
              : "p-0"
          }`}
        >
          {isLoading || isFetching ? (
            newKeyword !== "" && (
              <div className="m-2">
                <Loader color={"accent"} />
              </div>
            )
          ) : (data?.data?.usersTotalCount || data?.data?.groupsTotalCount) &&
            newKeyword !== "" ? (
            <>
              {data?.data?.users?.length > 0 && (
                <p className="font-semibold text-white">{t("chatsLabel")}</p>
              )}
              {data?.data?.users.map((user, index) => (
                <SearchResultItem
                  key={index}
                  details={user}
                  onClose={closeHandler}
                />
              ))}
              {data?.data?.groups?.length > 0 && (
                <p className="font-semibold text-white">{t("groupsLabel")}</p>
              )}
              {data?.data?.groups.map((group, index) => (
                <SearchResultItem
                  type="group"
                  joined={group?.members?.includes(userDetails?._id)}
                  key={index}
                  details={group}
                  onClose={closeHandler}
                />
              ))}
            </>
          ) : (
            newKeyword !== "" && (
              <p className="p-1 m-1 rounded text-white">{data?.message}</p>
            )
          )}
        </div>
      </div>
    </ModernModal>,
    document.getElementById("portal")
  );
}
