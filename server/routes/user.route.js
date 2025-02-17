import express from "express";
import {
  changeTheme,
  changeLanguage,
  checkEmail,
  checkPassword,
  forgotPassword,
  getUserAllDetails,
  getUserSomeDetails,
  logout,
  register,
  resetPassword,
  search,
  updateUser,
  verifyEmail,
  verifyOtp,
  resetAccessToken,
} from "../controllers/user.controller.js";
import {
  changeLanguageRules,
  changeThemeRules,
  checkEmailRules,
  checkPasswordRules,
  forgotPasswordRules,
  getUserAllDetailsRules,
  getUserSomeDetailsRules,
  registerRules,
  resetPasswordRules,
  updateUserRules,
  verifyEmailRules,
  verifyOtpRules,
} from "../middlewares/validation/userValidationRules.js";
import { upload } from "../utils/uploadImage.js";
import auth from "../middlewares/auth.js";
const userRouter = express.Router();

userRouter.post("/register", upload.single("avatar"), registerRules, register);
userRouter.post("/verify-email", verifyEmailRules, verifyEmail);
userRouter.post("/check-email", checkEmailRules, checkEmail);
userRouter.post("/check-password", checkPasswordRules, checkPassword);
userRouter.get(
  "/user-all-details",
  auth,
  getUserAllDetailsRules,
  getUserAllDetails
);
userRouter.get(
  "/user-some-details",
  getUserSomeDetailsRules,
  getUserSomeDetails
);
userRouter.get("/search", auth, search);
userRouter.put("/logout", auth, logout);
userRouter.put(
  "/update-user",
  upload.single("avatar"),
  auth,
  updateUserRules,
  updateUser
);
userRouter.put("/forgot-password", forgotPasswordRules, forgotPassword);
userRouter.put("/verify-otp", verifyOtpRules, verifyOtp);
userRouter.put("/reset-password", resetPasswordRules, resetPassword);
userRouter.put("/change-theme", changeThemeRules, auth, changeTheme);
userRouter.put("/change-language", changeLanguageRules, auth, changeLanguage);
userRouter.put("/reset-access-token", resetAccessToken);

export default userRouter;
