import User from "../models/User.model.js";
import expressAsyncHandler from "express-async-handler";
import { genSalt, hash } from "bcrypt";
import bcrypt from "bcrypt";
import sendEmail from "../config/sendEmail.js";
import generateOTP from "../utils/genetateOTP.js";
import AppError from "../utils/AppError.js";

import jwt from "jsonwebtoken";
import cookiesOptions from "../utils/cookieConfig.js";
import { deleteFile, saveFile } from "../utils/uploadImage.js";
import Group from "../models/Group.model.js";

import i18next from "i18next";

/**
 * @param {object} userData - user registration date
 * @returns {object} - response
 */
export const register = expressAsyncHandler(async (request, response, next) => {
  const { name, email, password, rgb } = request.body;
  //  password hashing
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);
  // saving use avatar
  let avatar = "";
  if (request.file) {
    const filePath = await saveFile(request.file, "users");
    avatar = {
      filePath,
      fileType: request.file.mimetype,
    };
  }
  // creating new user
  const user = await User.create({
    ...request.body,
    password: hashedPassword,
    avatar: avatar,
    rgb: rgb,
  });
  if (!user) {
    return next(new AppError(request?.t("registerError"), 400));
  }
  try {
    await sendEmail({
      from: `${process.env.USER_EMAIL}`,
      to: `${email}`,
      subject: `${request?.t("verifyEmailTitle")}`,
      html: `<div style="color:black; font-family: Arial, sans-serif;">
    <h2>${request?.t("greeting")} ${name},</h2>
    <p>${request?.t("verifyEmailMessage")}</p>
    <div style="width: fit-content; background-color: green; padding: 10px; border-radius: 10px;">
        <a href="${process.env.FRONTEND_URL}/verify-email?id=${user?._id}" 
           style="text-decoration: none; color: white; font-weight: bold;">
            ${request?.t("verifyButton")}
        </a>
    </div>
</div>`,
    });
  } catch (error) {}
  return response.status(201).json({
    message: request.t("registerSuccess"),
  });
});

/**
 * @param {string} id - user id
 * @param {string} email- user email
 * @returns {object} - response
 */
export const verifyEmail = expressAsyncHandler(
  async (request, response, next) => {
    const { id } = request.query;
    const { email } = request.body;
    const user = await User.findById(id);
    if (user.email === email) {
      await User.updateOne(
        { _id: user?._id },
        { $set: { verify_email: true } }
      );
      return response.status(200).json({
        message: request?.t("verifySuccess"),
      });
    } else {
      return next(new AppError(request?.t("verifyError"), 400));
    }
  }
);

/**
 * @param {string} email - user email
 * @returns {object} - response
 */
export const checkEmail = expressAsyncHandler(
  async (request, response, next) => {
    const { email } = request.body;
    const user = await User.findOne({ email }).select("-password");

    return response.status(200).json({
      message: request?.t("checkEmailSuccess"),
      data: {
        userDetails: user,
      },
    });
  }
);

/**
 * @param {string} email - user email
 * @param {string} password - user password
 * @returns {object} - response
 */
export const checkPassword = expressAsyncHandler(
  async (request, response, next) => {
    const { email, password } = request.body;
    let user = await User.findOne({ email });

    // comparing passwords
    const comparisonResult = await bcrypt.compare(password, user?.password);
    if (!user || !comparisonResult) {
      return next(new AppError(request?.t("inValidEmailOrPassword"), 400));
    }
    // generating tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user = await User.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          refresh_token: refreshToken,
          access_token: accessToken,
        },
      },
      { new: true }
    );

    if (!user.verify_email) {
      try {
        await sendEmail({
          from: `${process.env.USER_EMAIL}`,
          to: `${user?.email}`,
          subject: `${request?.t("verifyEmailTitle")}`,
          html: `<div style="color:black; font-family: Arial, sans-serif;">
      <h2>${request?.t("greeting")} ${user?.name},</h2>
      <p>${request?.t("verifyEmailMessage")}</p>
      <div style="width: fit-content; background-color: green; padding: 10px; border-radius: 10px;">
          <a href="${process.env.FRONTEND_URL}/verify-email?id=${user?._id}" 
             style="text-decoration: none; color: white; font-weight: bold;">
              ${request?.t("verifyButton")}
          </a>
      </div>
  </div>`,
        });
      } catch (error) {}
    }
    response.cookie("accessToken", accessToken, cookiesOptions);
    response.cookie("refreshToken", refreshToken, cookiesOptions);
    const { password: pa, verify_email, ...others } = user._doc;
    return response.status(200).json({
      message: request?.t("loginSuccess"),
      data: {
        userDetails: others,
      },
    });
  }
);

/**
 * @param {object} - user new data
 * @returns {object} - response
 */
export const updateUser = expressAsyncHandler(
  async (request, response, next) => {
    let { name, email, password } = request.body;
    const user = await User.findById(request?.user?._id);

    //  password hashing
    if (password) {
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);
      password = hashedPassword;
    }
    let avatar;
    if (request.file) {
      if (user?.avatar?.filePath !== "") {
        await deleteFile(user.avatar.filePath);
      }
      const filePath = await saveFile(request.file, "users");
      avatar = {
        filePath,
        fileType: request.file.mimetype,
      };
    }

    name = user.name || name;
    email = user.email || email;

    // generating tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user = await User.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          name,
          email,
          password,
          avatar,
          refresh_token: refreshToken,
          access_token: accessToken,
        },
      },
      { new: true }
    );

    response.cookie("accessToken", accessToken, cookiesOptions);
    response.cookie("refreshToken", refreshToken, cookiesOptions);

    return response.status(200).json({
      message: request?.t("userUpdateSuccess"),
      data: {
        userDetails: user,
      },
    });
  }
);

/**
 * @returns {object} - response (message, user details)
 */
export const getUserAllDetails = expressAsyncHandler(
  async (request, response, next) => {
    let userDetails;
    if (request?.query?.id || request?.user?._id) {
      userDetails = await User.findById(
        request?.query?.id ? request?.query?.id : request?.user._id
      ).select("-password");
    }
    if (!userDetails) {
      return next(new AppError(request?.t("checkEmailError"), 400));
    }
    return response.status(200).json({
      message: request?.t("userDetails"),
      data: { userDetails },
    });
  }
);

/**
 * @returns {object} - response (message, user details)
 */
export const getUserSomeDetails = expressAsyncHandler(
  async (request, response, next) => {
    const { email } = request.query;
    const userDetails = await User.findOne({ email }).select("name avatar rgb");
    if (!userDetails) {
      return next(new AppError(request?.t("checkEmailError"), 400));
    }
    return response.status(200).json({
      message: request?.t("userDetails"),
      data: { userDetails },
    });
  }
);

/**
 * @returns {object} - response (message)
 */
export const logout = expressAsyncHandler(async (request, response, next) => {
  const user = await User.findByIdAndUpdate(
    request?.user?._id,
    {
      refresh_token: "",
      access_token: "",
      last_seen: new Date(),
    },
    { new: true }
  );

  response.clearCookie("accessToken", cookiesOptions);
  response.clearCookie("refreshToken", cookiesOptions);

  if (!user) {
    return next(new AppError(request?.t("checkEmailError"), 400));
  }
  return response.status(200).json({
    message: request?.t("logoutSuccess"),
  });
});

/**
 * @returns {object} - response (message)
 */
export const changeTheme = expressAsyncHandler(
  async (request, response, next) => {
    const user = await User.findByIdAndUpdate(
      request?.user?._id,
      {
        $set: { theme: request?.body?.theme },
      },
      { new: true }
    );

    if (user) {
      return response.status(200).json({
        message: request?.t("changeThemeSuccess"),
        data: {
          userDetails: user,
        },
      });
    }
  }
);

/**
 * @returns {object} - response (message)
 */
export const changeLanguage = expressAsyncHandler(
  async (request, response, next) => {
    const user = await User.findByIdAndUpdate(
      request?.user?._id,
      {
        $set: { lng: request?.body?.lng },
      },
      { new: true }
    );

    if (user) {
      return response.status(200).json({
        message: request?.t("changeLanguageSuccess"),
        data: {
          userDetails: user,
        },
      });
    }
  }
);

/**
 * @param {string} userEmail - user email
 * @returns {object} - response
 */
export const forgotPassword = expressAsyncHandler(
  async (request, response, next) => {
    const { email } = request.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError(request?.t("checkEmailError"), 400));
    }

    const otp = generateOTP();
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);

    await User.updateOne(
      {
        _id: user?._id,
      },
      {
        $set: {
          otp: {
            value: otp,
            exp: expireTime,
          },
        },
      }
    );
    try {
      await sendEmail({
        from: `${process.env.USER_EMAIL}`,
        to: `${user?.email}`,
        subject: `${request?.t("fotgotPasswordTitle")}`,
        html: `<div style="color:black; font-family: Arial, sans-serif;">
    <h2>${request?.t("greeting")} ${user?.name},</h2>
    <p>${request?.t("fogotPasswordMessage")}</p>
    <h3 style="color:red;"> ${otp}</h3>
    <h5>${request?.t("otpExpNote")}</h5>
    <p>>${request?.t("thankYou")}</p>
    
    </div>`,
      });
    } catch (error) {}

    return response.status(200).json({
      message: request?.t("checkYourEmail"),
    });
  }
);

/**
 * @param {string} userImage - user image
 * @param {string} otp - otp
 * @returns {object} - response
 */
export const verifyOtp = expressAsyncHandler(
  async (request, response, next) => {
    const { email, otp } = request.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError(request?.t("checkEmailError"), 400));
    }
    const currentTime = new Date();
    const expireTime = new Date(user?.otp?.exp);
    if (expireTime < currentTime) {
      return next(new AppError(request?.t("otpExpError"), 400));
    }
    if (user?.otp?.value !== otp) {
      return next(new AppError(request?.t("otpInvalid"), 400));
    }

    await User.updateOne(
      { _id: user?._id },
      {
        $set: {
          otp: {
            value: "",
            exp: "",
          },
        },
      }
    );
    return response.status(200).json({
      message: request?.t("otpVerifySuccess"),
    });
  }
);

/**
 * @param {string} email - user email
 * @param {string} passwrod - user new password
 * @returns {object} - response
 */
export const resetPassword = expressAsyncHandler(
  async (request, response, next) => {
    const { email, password } = request.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError(request?.t("checkEmailError"), 400));
    }
    //  password hashing
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    await User.updateOne(
      { _id: user?._id },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    return response.status(200).json({
      message: request?.t("resetPasswordSuccess"),
    });
  }
);

/**
 * @returns {object} - response
 */
export const search = expressAsyncHandler(async (request, response, next) => {
  const { keyword } = request.query;
  // users
  const users = await User.find({
    $or: [
      {
        name: { $regex: keyword, $options: "i" },
      },
      {
        email: { $regex: keyword, $options: "i" },
      },
    ],
    $nor: [{ name: request?.user?.name }, { email: request?.user?.email }],
  });
  const usersTotalCount = await User.find({
    $or: [
      {
        name: { $regex: keyword, $options: "i" },
      },
      {
        email: { $regex: keyword, $options: "i" },
      },
    ],
    $nor: [{ name: request?.user?.name }, { email: request?.user?.email }],
  }).countDocuments();
  // groups;
  const groups = await Group.find({
    name: { $regex: keyword, $options: "i" },
  });
  const groupsTotalCount = await Group.find({
    name: { $regex: keyword, $options: "i" },
  }).countDocuments();

  if (users.length === 0 && groups.length === 0) {
    return response.status(200).json({
      message: request?.t("noResults"),
    });
  }

  return response.status(200).json({
    message: request?.t("allFoundedResults"),
    data: {
      users,
      usersTotalCount,
      groups,
      groupsTotalCount,
    },
  });
});

/**
 * @returns {object} - response
 */
export const resetAccessToken = expressAsyncHandler(
  async (request, response, next) => {
    if (!request?.cookies?.refreshToken) {
      return response.status(401).json({ message: i18next.t("unAuthorized") });
    }

    try {
      const verifiedToken = jwt.verify(
        request.cookies.refreshToken,
        process.env.JWT_SECRET
      );
      if (!verifiedToken) {
        return response
          .status(401)
          .json({ message: i18next.t("invalidToken") });
      }
      const accessToken = jwt.sign(
        {
          _id: verifiedToken._id,
          name: verifiedToken.name,
          email: verifiedToken.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
      );

      const user = await User.findByIdAndUpdate(
        verifiedToken._id,
        {
          $set: {
            access_token: accessToken,
          },
        },
        { new: true }
      );
      if (!user) {
        return response
          .status(404)
          .json({ message: i18next.t("userNotFound") });
      }
      response.cookie("accessToken", accessToken, cookiesOptions);

      const { password, verify_email, ...userDetails } = user._doc;

      return response.status(200).json({
        data: { userDetails },
      });
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return response
          .status(401)
          .json({ message: i18next.t("invalidToken") });
      }
    }
  }
);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @returns {object} - response
 */
// export const deleteUser = expressAsyncHandler(async (request, response, next) => {
//   const user = await User.findByIdAndUpdate(request?.user?._id);
//   if (!user) {
//     return response.status(400).json({
//       message: "User not found.",
//     });
//   }
//   return response.status(200).json({
//     message: "User deleted successfully.",
//     data: user,
//   });
// });
