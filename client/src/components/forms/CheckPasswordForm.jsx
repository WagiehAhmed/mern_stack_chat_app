import React, { useEffect, useMemo, useState } from "react";
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
import { Link, useLocation } from "react-router-dom";
import { useCheckPassword } from "../../hooks/useCheckPassword";
import Loader from "../Loader";
import Avatar from "../Avatar.jsx";
import { useTranslation } from "react-i18next";

export default function CheckPasswordForm({ userInfo }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [showPassword, setShowPasswrod] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange", defaultValues: { password: "" } });
  const [mutate, isLoading] = useCheckPassword(reset);

  const dataHandler = (data) => {
    // console.log(data);
    mutate({ password: data?.password, email: location?.state?.email });
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

  return (
    <FormContainer>
      <Form
        className="flex flex-col justify-evenly gap-3"
        onSubmit={handleSubmit(dataHandler, errorsHandler)}
      >
        <p className="capitalize text-center font-semibold text-text-primary">
          {t("password")}
        </p>
        <div className="w-20 h-20 mx-auto rounded-full hover:cursor-pointer select-none shadow-xl">
          <Avatar userDetails={userInfo} className="w-full h-full text-4xl" />
        </div>
        <p className="font-bold text-2xl capitalize text-text-primary mx-auto">
          {userInfo?.name}
        </p>

        <div className="flex flex-col">
          <Label htmlFor="password"> {t("password")}</Label>
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
              autoFocus
            />
            <div className="w-fit h-fit absolute transform top-1/2 end-2 -translate-y-1/2 hover:cursor-pointer">
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
          <Link
            to={"/forgot-password"}
            className="m-1 self-end text-xs text-text-secondary hover:text-accent hover:cursor-pointer"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <Button type="submit" className="mt-1 self-center">
          {isLoading ? <Loader /> : <p>{t("login")}</p>}
        </Button>
      </Form>
    </FormContainer>
  );
}
