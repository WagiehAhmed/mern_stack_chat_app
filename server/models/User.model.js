import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import i18next from "i18next";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, i18next.t("userNameIsRequired")],
    },
    email: {
      type: String,
      unique: [true, i18next.t("userEmailIsUnique")],
      required: [true, i18next.t("userEmailIsRequired")],
      minlength: [15, i18next.t("userEmailIsTooShort")],
      validate: {
        validator: (value) => {
          return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(value);
        },
        message: i18next.t("userEmailMustBeGmail"),
      },
    },
    password: {
      type: String,
      required: [true, i18next.t("userPasswordIsRequired")],
      minlength: [5, i18next.t("userPasswordIsTooShort")],
    },
    avatar: {
      type: Object,
      default: {
        filePath: "",
        type: "",
      },
    },
    refresh_token: {
      type: String,
      default: "",
    },
    access_token: {
      type: String,
      default: "",
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    last_seen: {
      type: Date,
    },
    otp: {
      value: {
        type: String,
      },
      exp: {
        type: Date,
      },
    },
    rgb: {
      type: String,
      default: "",
    },
    theme: {
      type: String,
      default: "light",
    },
    lng: {
      type: String,
      default: "en",
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = function () {
  try {
    const token = jwt.sign(
      {
        _id: this._id,
        name: this.name,
        email: this.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
    return token;
  } catch (error) {
    throw error;
  }
};

userSchema.methods.generateRefreshToken = function () {
  try {
    const token = jwt.sign(
      {
        _id: this._id,
        name: this.name,
        email: this.email,
      },
      process.env.JWT_SECRET
      // ,{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
    return token;
  } catch (error) {
    throw error;
  }
};

export default mongoose.model("Users", userSchema);
