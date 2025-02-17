import React from "react";
import { Button, Form, FormContainer, Input, Label } from "../basicComponents";
import Loader from "../Loader";

import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { useVerifyEmail } from "../../hooks/useVerifyEmail";
import { useTranslation } from "react-i18next";
export default function VerifyEmailForm() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange", defaultValues: { email: "" } });
  const { mutate, isLoading } = useVerifyEmail(reset);

  const dataHandler = (data) => {
    mutate({ email: data?.email ,id:searchParams.get("id")});
  };
  const errorsHandler = (errors) => {
    // console.log(errors);
  };
  return (
    <FormContainer>
      <Form
        className="flex flex-col justify-evenly gap-3"
        onSubmit={handleSubmit(dataHandler, errorsHandler)}
      >
        <p className="capitalize text-center font-semibold text-text-primary">
          {t("verifyEmail")}
        </p>
        <div className="flex flex-col">
          <Label htmlFor="email">{t("name")}</Label>
          <Input
            {...register("email", {
              required: { value: true, message: t("nameIsReuired") },
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
          {isLoading ? <Loader /> : <p>{t("verify")}</p>}
        </Button>
      </Form>
    </FormContainer>
  );
}
