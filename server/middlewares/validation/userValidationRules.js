import { body, query, param } from "express-validator";
import User from "../../models/User.model.js";
import validator from "./validator.js";
import i18next from "i18next";

export const registerRules = [
  body("name")
    .notEmpty()
    .withMessage(i18next.t("requiredName"))
    .matches(/^[A-Za-z\u0600-\u06FF\s]+$/)
    .withMessage(i18next.t("nameNotes")),
  body("email")
    .notEmpty()
    .withMessage(i18next.t("requiredEmail"))
    .isEmail()
    .withMessage(i18next.t("invaildEmail"))
    .isLength({ min: 15 })
    .withMessage(i18next.t("userEmailIsTooShort"))
    .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/i)
    .withMessage(i18next.t("userEmailMustBeGmail"))
    .custom(async (value, { req }) => {
      const exists = await User.exists({ email: value });
      if (!exists) {
        return true;
      } else {
        throw new Error(i18next.t("checkEmailSuccess"));
      }
    }),

  body("password").notEmpty().withMessage(i18next.t("requiredPassword")),
  validator,
];

export const verifyEmailRules = [
  body("email")
    .notEmpty()
    .withMessage(i18next.t("requiredEmail"))
    .isEmail()
    .withMessage(i18next.t("invaildEmail"))
    .custom(async (value, { req }) => {
      const exists = await User.exists({ email: value });
      if (exists) {
        return true;
      } else {
        throw new Error(i18next.t("checkEmailError"));
      }
    }),
  validator,
];

export const checkPasswordRules = [
  body("email")
    .notEmpty()
    .withMessage(i18next.t("requiredEmail"))
    .custom(async (value, { req }) => {
      const exists = await User.exists({ email: value });
      if (exists) {
        return true;
      } else {
        throw new Error(i18next.t("checkEmailError"));
      }
    }),
  body("password").notEmpty().withMessage(i18next.t("requiredPassword")),
  validator,
];

export const checkEmailRules = [
  body("email")
    .notEmpty()
    .withMessage(i18next.t("requiredEmail"))
    .isEmail()
    .withMessage(i18next.t("invaildEmail"))
    .custom(async (value, { req }) => {
      const exists = await User.exists({ email: value });
      if (exists) {
        return true;
      } else {
        throw new Error(i18next.t("checkEmailError"));
      }
    }),
  validator,
];
export const getUserAllDetailsRules = [
  query("id")
    .optional()
    .isMongoId()
    .withMessage(i18next.t("invaildId"))
    .custom(async (value, { req }) => {
      const exists = await User.exists({ _id: value });
      if (exists) {
        return true;
      } else {
        throw new Error(i18next.t("checkEmailError"));
      }
    }),
  validator,
];
export const getUserSomeDetailsRules = [
  query("email").custom(async (value, { req }) => {
    const exists = await User.exists({ email: value });
    if (exists) {
      return true;
    } else {
      throw new Error(i18next.t("checkEmailError"));
    }
  }),
  validator,
];

export const updateUserRules = [
  body("name")
    .optional()
    .matches(/^[A-Za-z\u0600-\u06FF\s]+$/)
    .withMessage(i18next.t("nameNotes")),
  body("email")
    .optional()
    .isEmail()
    .withMessage(i18next.t("invalidId"))
    .custom(async (value, { req }) => {
      const users = await User.find({ email: value }).countDocuments();
      const user = await User.findOne({ email: value });
      if ((user && user.name === req.body.name) || users === 1 || users === 0) {
        return true;
      } else {
        throw new Error(i18next.t("checkEmailError"));
      }
    }),
  validator,
];

export const forgotPasswordRules = [
  body("email")
    .notEmpty()
    .withMessage(i18next.t("requiredEmail"))
    .isEmail()
    .withMessage(i18next.t("invaildEmail"))
    .custom(async (value, { request }) => {
      const exists = await User.exists({ email: value });
      if (exists) {
        return true;
      } else {
        throw new Error(i18next.t("invaildEmail"));
      }
    }),
  validator,
];

export const verifyOtpRules = [
  body("otp").notEmpty().withMessage(i18next.t("requiredOtp")),
  body("email")
    .notEmpty()
    .withMessage(i18next.t("requiredEmail"))
    .isEmail()
    .withMessage(i18next.t("invaildEmail"))
    .custom(async (value, { request }) => {
      const exists = await User.exists({ email: value });
      if (exists) {
        return true;
      } else {
        throw new Error(i18next.t("checkEmailError"));
      }
    }),
  validator,
];

export const resetPasswordRules = [
  body("password").notEmpty().withMessage(i18next.t("requiredPassword")),
  body("email")
    .notEmpty()
    .withMessage(i18next.t("requiredEmail"))
    .isEmail()
    .withMessage(i18next.t("invaildEmail"))
    .custom(async (value, { request }) => {
      const exists = await User.exists({ email: value });
      if (exists) {
        return true;
      } else {
        throw new Error(i18next.t("checkEmailError"));
      }
    }),
  validator,
];

export const changeThemeRules = [
  body("theme").notEmpty().withMessage(i18next.t("requiredTheme")),
  validator,
];

export const changeLanguageRules = [
  body("lng").notEmpty().withMessage(i18next.t("requiredLanguage")),
  validator,
];
