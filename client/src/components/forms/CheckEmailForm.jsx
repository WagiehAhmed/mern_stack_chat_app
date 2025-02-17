import React, { useEffect } from "react";
import { Button, Form, FormContainer, Input, Label } from "../basicComponents";
import { useForm } from "react-hook-form";
import { useCheckEmail } from "../../hooks/useCheckEmail";
import { Link } from "react-router-dom";
import Loader from "../Loader";
import { useTranslation } from "react-i18next";
export default function CheckEmailForm() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange", defaultValues: { email: "" } });
  const { mutate, isLoading } = useCheckEmail(reset);

  const dataHandler = (data) => {
    mutate({ email: data?.email });
  };
  const errorsHandler = (errors) => {
    // //console.log(errors);
  };

  return (
    <FormContainer>
      <Form
        className="flex flex-col justify-evenly gap-3"
        onSubmit={handleSubmit(dataHandler, errorsHandler)}
      >
        <p className="capitalize text-center font-semibold text-text-primary">
          {t("email")}
        </p>
        <div className="flex flex-col">
          <Label htmlFor="email"> {t("email")}</Label>
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
            autoFocus
          />
          {errors?.email && (
            <span className="error">{errors?.email?.message}</span>
          )}
        </div>

        <Button type="submit" className="mt-1 self-center">
          {isLoading ? <Loader /> : <p>{t("login")}</p>}
        </Button>
        <p className="text-text-secondary text-xs first-letter:capitalize ">
          {t("doNotHaveAnAccount")}
          <Link
            to={"/register"}
            className="text-sm font-semibold text-accent capitalize hover:text-accent"
          >
            {t("register")}
          </Link>
        </p>
      </Form>
    </FormContainer>
  );
}
