import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Loader from "../Loader";
import { useLocation } from "react-router-dom";
import { Button, Form, FormContainer, Input, Label } from "../basicComponents";
import { useVerifyOtp } from "../../hooks/useVerifyOtp";
import { useTranslation } from "react-i18next";

export default function VerifyOtpForm() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      d1: "",
      d2: "",
      d3: "",
      d4: "",
      d5: "",
      d6: "",
    },
  });
  const { mutate, isLoading } = useVerifyOtp(reset);

  const location = useLocation();
  const dataHandler = (data) => {
    // console.log(data);
    const result = data.d1.concat(data.d2, data.d3, data.d4, data.d5, data.d6);
    mutate({ otp: result, email: location?.state.email });
  };
  const errorsHandler = (errors) => {
    //console.log(errors);
  };

  const d1 = watch("d1");
  const d2 = watch("d2");
  const d3 = watch("d3");
  const d4 = watch("d4");
  const d5 = watch("d5");
  const d6 = watch("d6");
  useEffect(() => {
    setValue("d1", d1?.[d1?.length - 1]);
    setValue("d2", d2?.[d2?.length - 1]);
    setValue("d3", d3?.[d3?.length - 1]);
    setValue("d4", d4?.[d4?.length - 1]);
    setValue("d5", d5?.[d5?.length - 1]);
    setValue("d6", d6?.[d6?.length - 1]);
  }, [d1, d2, d3, d4, d5, d6]);

  return (
    <FormContainer>
      <Form
        className="flex flex-col justify-evenly gap-3"
        onSubmit={handleSubmit(dataHandler, errorsHandler)}
      >
        <p className="capitalize text-centerm font-semibold text-text-primary">
          {t("verifyOtp")}
        </p>

        <div className="flex flex-col">
          <Label htmlFor="otp" className="my-2">
            {t("otpPlaceholder")}
          </Label>
          <div className="flex flex-row justify-between items-center gap-2">
            <Input
              autoFocus
              {...register("d1", {
                required: { value: true },
              })}
              id="otp"
              type="number"
              className={`p-3 w-1/6 rounded hover:cursor-pointer focus:outline-links text-center font-bold ${
                errors.d1 && "border border-red-500"
              }`}
            />
            <Input
              {...register("d2", {
                required: { value: true },
              })}
              id="otp"
              type="number"
              className={`p-3 w-1/6 rounded hover:cursor-pointer focus:outline-links text-center font-bold ${
                errors.d2 && "border border-red-500"
              }`}
            />
            <Input
              {...register("d3", {
                required: { value: true },
              })}
              id="otp"
              type="number"
              className={`p-3 w-1/6 rounded hover:cursor-pointer focus:outline-links text-center font-bold ${
                errors.d3 && "border border-red-500"
              }`}
            />
            <Input
              {...register("d4", {
                required: { value: true },
              })}
              id="otp"
              type="number"
              className={`p-3 w-1/6 rounded hover:cursor-pointer focus:outline-links text-center font-bold ${
                errors.d4 && "border border-red-500"
              }`}
            />
            <Input
              {...register("d5", {
                required: { value: true },
              })}
              id="otp"
              type="number"
              className={`p-3 w-1/6 rounded hover:cursor-pointer focus:outline-links text-center font-bold ${
                errors.d6 && "border border-red-500"
              }`}
            />
            <Input
              {...register("d6", {
                required: { value: true },
              })}
              id="otp"
              type="number"
              className={`p-3 w-1/6 rounded hover:cursor-pointer focus:outline-links text-center font-bold ${
                errors.d6 && "border border-red-500"
              }`}
            />
          </div>
        </div>

        <Button type="submit" className="mt-1 self-center">
          {isLoading ? <Loader /> : <p>{t("verifyOtp")}</p>}
        </Button>
      </Form>
    </FormContainer>
  );
}
