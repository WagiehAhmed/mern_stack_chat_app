import React, { useRef, useState } from "react";
import {
  Button,
  Form,
  FormContainer,
  IconButton,
  Input,
  Label,
} from "../basicComponents";
import { useForm } from "react-hook-form";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link } from "react-router";
// icons
import { FaRegCircleUser } from "react-icons/fa6";
import { useRegister } from "../../hooks/useRegister";
import Loader from "../Loader";
import generateRandomColorRGB from "../../../../server/utils/generateRandomColorRGB";
import { useTranslation } from "react-i18next";

export default function RegisterForm() {
  const { t } = useTranslation();
  const avatarRef = useRef(null);
  const [showPassword, setShowPasswrod] = useState(false);
  const [showConfirmPassword, setShowConfirmPasswrod] = useState(false);
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
      email: "",
      password: "",
      avatar: null,
    },
  });
  const { mutate, isLoading } = useRegister(reset);

  const dataHandler = (data) => {
    // console.log(data);
    const fd = new FormData();
    fd.append("name", data?.name);
    fd.append("email", data?.email);
    fd.append("password", data?.password);
    fd.append("avatar", data?.avatar?.[0]);
    fd.append("rgb", generateRandomColorRGB());
    mutate(fd);
  };
  const errorsHandler = (errors) => {
    // console.log(errors);
  };
  const hidePasswordHandler = (e) => {
    setShowPasswrod(false);
  };
  const showPasswordHandler = (e) => {
    setShowPasswrod(true);
  };
  const hidePasswordHandler2 = (e) => {
    setShowConfirmPasswrod(false);
  };
  const showPasswordHandler2 = (e) => {
    setShowConfirmPasswrod(true);
  };

  watch("avatar");

  return (
    <FormContainer>
      <Form
        className="flex flex-col justify-evenly gap-3"
        onSubmit={handleSubmit(dataHandler, errorsHandler)}
      >
        <p className="capitalize text-center font-semibold text-text-primary">
          {t("register")}
        </p>
        <div
          className="w-20 h-20 mx-auto rounded-full hover:cursor-pointer select-none shadow-xl"
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
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            autoFocus
            {...register("name", {
              required: { value: true, message: t("nameIsRequired") },
              pattern: {
                value: /^[A-Za-z\u0600-\u06FF\s]+$/,
                message: t("nameIsInvalid"),
              },
            })}
            id="name"
            type="text"
            placeholder={t("namePlaceholder")}
          />
          {errors?.name && (
            <span className="error">{errors?.name?.message}</span>
          )}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            {...register("email", {
              required: { value: true, message: t("emailIsRequired") },
              minLength: {
                value: 15,
                message: t("userEmailIsTooShort"),
              },
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/i,
                message: t("emailIsInvalid"),
              },
            })}
            id="email"
            type="text"
            placeholder={t("emailPlaceholder")}
          />
          {errors?.email && (
            <span className="error">{errors?.email?.message}</span>
          )}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="password">{t("password")}</Label>
          <div className=" relative">
            <Input
              {...register("password", {
                required: { value: true, message: t("passwordIsRequired") },
                minLength: {
                  value: 5,
                  message: t("userPasswordIsTooShort"),
                },
              })}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
            />
            <div className="w-fit h-fit absolute transform top-1/2 end-2  -translate-y-1/2 hover:cursor-pointer">
              {showPassword ? (
                <IconButton
                  onClick={hidePasswordHandler}
                  type="button"
                  className="bg-transparent hover:bg-transparent text-text-primary hover:text-text-secondary"
                >
                  <IoEye size={20} />
                </IconButton>
              ) : (
                <IconButton
                  onClick={showPasswordHandler}
                  type="button"
                  className="bg-transparent hover:bg-transparent text-text-primary hover:text-text-secondary"
                >
                  <IoEyeOff size={20} />
                </IconButton>
              )}
            </div>
          </div>
          {errors?.password && (
            <span className="error">{errors?.password?.message}</span>
          )}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <div className=" relative">
            <Input
              {...register("confirmPassword", {
                required: {
                  value: true,
                  message: t("confirmPasswordIsRequired"),
                },
                minLength: {
                  value: 5,
                  message: t("userPasswordIsTooShort"),
                },
                validate: (value) =>
                  value === getValues("password") || t("notTheSame"),
              })}
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder={t("confirmPasswordPlaceholder")}
            />
            <div className="w-fit h-fit absolute transform top-1/2 end-2 -translate-y-1/2 hover:cursor-pointer">
              {showConfirmPassword ? (
                <IconButton
                  onClick={hidePasswordHandler2}
                  type="button"
                  className="bg-transparent hover:bg-transparent text-text-primary hover:text-text-secondary"
                >
                  <IoEye size={20} />
                </IconButton>
              ) : (
                <IconButton
                  onClick={showPasswordHandler2}
                  type="button"
                  className="bg-transparent hover:bg-transparent text-text-primary hover:text-text-secondary"
                >
                  <IoEyeOff size={20} />
                </IconButton>
              )}
            </div>
          </div>
          {errors?.confirmPassword && (
            <span className="error">{errors?.confirmPassword?.message}</span>
          )}
        </div>

        <Button type="submit" className="mt-1 self-center">
          {isLoading ? <Loader /> : <p>{t("register")}</p>}
        </Button>
        <p className="text-text-secondary text-xs first-letter:capitalize">
          {t("alreadyHaveAnAccount")}
          <Link
            to={"/email"}
            className="text-sm font-semibold text-accent capitalize hover:text-accent"
          >
            {" "}
            {t("login")}
          </Link>
        </p>
      </Form>
    </FormContainer>
  );
}
