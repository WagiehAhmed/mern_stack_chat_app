import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// icons
import { IoEyeOff } from "react-icons/io5";
import { IoEye } from "react-icons/io5";

import Loader from "../Loader";
import { useResetPassword } from "../../hooks/useResetPassword";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormContainer,
  IconButton,
  Input,
  Label,
} from "../basicComponents";
import { useTranslation } from "react-i18next";

export default function ResetPasswordForm() {
  const { t } = useTranslation();
  const [showPassword, setShowPasswrod] = useState(false);
  const [showConfirmPassword, setShowconfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { mutate, isLoading } = useResetPassword(reset);
  const location = useLocation();
  const dataHandler = (data) => {
    // console.log(data);
    mutate({
      password: data?.password,
      email: location?.state?.email,
    });
  };
  const errorsHandler = (errors) => {
    //console.log(errors);
  };

  return (
    <FormContainer>
      <Form
        className="flex flex-col justify-evenly gap-3"
        onSubmit={handleSubmit(dataHandler, errorsHandler)}
      >
        <p className="capitalize text-center font-semibold text-text-primary">
          {t("resetPassword")}
        </p>

        <div className="flex flex-col">
          <Label htmlFor="password">{t("newPassword")}</Label>
          <div className=" relative">
            <Input
              {...register("password", {
                required: { value: true, message: t("passwrodIsRequired") },
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
                  onClick={() => setShowPasswrod(false)}
                  type="button"
                  className="bg-transparent hover:bg-transparent text-text-primary hover:text-text-secondary"
                >
                  <IoEye size={25} />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => setShowPasswrod(true)}
                  type="button"
                  className="bg-transparent hover:bg-transparent text-text-primary hover:text-text-secondary"
                >
                  <IoEyeOff size={25} />
                </IconButton>
              )}
            </div>
          </div>
          {errors?.password && (
            <span className="text-red-600 font-semibold text-xs">
              {errors?.password?.message}
            </span>
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

            <div className="w-fit h-fit absolute transform top-1/2 end-2  -translate-y-1/2 hover:cursor-pointer">
              {showConfirmPassword ? (
                <IconButton
                  onClick={() => setShowconfirmPassword(false)}
                  type="button"
                  className="bg-transparent hover:bg-transparent text-text-primary hover:text-text-secondary"
                >
                  <IoEye size={25} />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => setShowconfirmPassword(true)}
                  type="button"
                  className="bg-transparent hover:bg-transparent text-text-primary hover:text-text-secondary"
                >
                  <IoEyeOff size={25} />
                </IconButton>
              )}
            </div>
          </div>
          {errors?.confirmPassword && (
            <span className="text-red-600 font-semibold text-xs">
              {errors?.confirmPassword?.message}
            </span>
          )}
        </div>
        <Button disabled={!isValid} type="submit" className="mt-1 self-center">
          {isLoading ? <Loader /> : <p>{t("changePassword")}</p>}
        </Button>
      </Form>
    </FormContainer>
  );
}
