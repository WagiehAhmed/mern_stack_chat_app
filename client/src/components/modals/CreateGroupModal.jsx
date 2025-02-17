import React, { useRef } from "react";
import { StandardModal } from "../basicComponents";
import ReactDom from "react-dom";

import { Button, Form, IconButton, Input, Label } from "../basicComponents";
import { useForm } from "react-hook-form";
import Loader from "../Loader";

// icons
import { FaRegCircleUser } from "react-icons/fa6";

import { useUploadGroupAvatar } from "../../hooks/useUploadGroupAvatar";
import generateRandomColorRGB from "../../../../server/utils/generateRandomColorRGB";
import { useDataContext } from "../../context/DataContextProvider";
import { useTranslation } from "react-i18next";

export default function CreateGroupModal({ onClose, open }) {
  // Don't render modal if not open
  if (!open) {
    return null;
  }

  const { t } = useTranslation();
  const { socket, userDetails } = useDataContext();
  const avatarRef = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      avatar: null,
    },
  });

  const name = watch("name");
  const avatar = watch("avatar");

  const createGroup = (data) => {
    socket.emit("newGroup", {
      ...data,
      admin: userDetails?._id?.toString(),
      rgb: generateRandomColorRGB(),
      members: [userDetails?._id?.toString()],
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    });
    reset();
    onClose();
  };

  const createGroup2 = ({ avatar }) => {
    createGroup({ name: name, avatar });
  };

  const { mutate, isLoading } = useUploadGroupAvatar(createGroup2);

  const dataHandler = (data) => {
    if (!data?.avatar?.[0] && data?.name) {
      createGroup({ name: data.name });
    } else {
      const fd = new FormData();
      if (data?.avatar && data?.avatar[0]) {
        fd.append("avatar", data.avatar[0]);
      }
      if (fd.has("avatar")) {
        mutate(fd);
      }
    }
  };
  const errorsHandler = (errors) => {
    // console.log(errors);
  };
  return ReactDom.createPortal(
    <StandardModal onClose={onClose} header={t("createGroup")}>
      <Form
        className="flex flex-col justify-evenly gap-2"
        onSubmit={handleSubmit(dataHandler, errorsHandler)}
      >
        <div
          className="w-24 h-24 mx-auto rounded-full hover:cursor-pointer select-none shadow-xl"
          onClick={(e) => {
            e.stopPropagation();
            avatarRef.current.click();
          }}
        >
          <Input
            type="file"
            accept="image/*"
            {...register("avatar")}
            ref={(e) => {
              register("avatar").ref(e);
              avatarRef.current = e;
            }}
            className="hidden"
          />

          {getValues("avatar")?.[0] ? (
            <IconButton className="w-full h-full p-0" type="button">
              <img
                className="w-full h-full object-fill rounded-full"
                src={URL.createObjectURL(getValues("avatar")?.[0])}
              />
            </IconButton>
          ) : (
            <IconButton
              className="w-full h-full p-1 bg-transparent hover:bg-accent hover:text-white"
              type="button"
            >
              <FaRegCircleUser className="w-full h-full" />
            </IconButton>
          )}
        </div>

        <div className="flex flex-col">
          <Label htmlFor="name">{t("groupName")}</Label>
          <Input
            autoFocus
            {...register("name", {
              required: { value: true, message: t("groudNameIsRequired") },
              pattern: {
                value: /^[A-Za-z\u0600-\u06FF\s]+$/,
                message: t("groupNameIsInvalid"),
              },
            })}
            id="name"
            type="text"
            placeholder={t("groupNamePlaceholder")}
          />
          {errors?.name && (
            <span className="error">{errors?.name?.message}</span>
          )}
        </div>

        <Button type="submit" className="mt-1 self-center">
          {isLoading ? <Loader /> : <p>{t("create")}</p>}
        </Button>
      </Form>
    </StandardModal>,
    document.getElementById("portal")
  );
}
